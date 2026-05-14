import { and, count, eq, gte, inArray } from "drizzle-orm";

import { scoringDefaults, type ScoringConfig } from "@/config/scoring-defaults";
import { runQuery } from "@/db/client";
import { communityEndorsements, userScoreEvents, users, voteEvents } from "@/db/schema";
import type { AccountState } from "@/lib/permissions";
import { appendAuditLog } from "@/modules/audit/logs";
import { getTenantConfigOverride } from "@/modules/tenants/data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScoreEventType =
  | "email_verified"
  | "account_age"
  | "account_state"
  | "vote_cast"
  | "vote_aligned"
  | "flag_acted"
  | "witnessed_approval"
  | "endorsement_received"
  | "endorsement_withdrawn"
  | "abuse_flag"
  | "review_opened"
  | "review_closed"
  | "suspension";

/** Activity event types that are capped per rolling window. */
const ACTIVITY_EVENT_TYPES = new Set<ScoreEventType>([
  "vote_cast",
  "vote_aligned",
  "flag_acted",
  "witnessed_approval",
  "endorsement_received"
]);

export type ScoreSignal = {
  eventType: ScoreEventType;
  delta: number;
  windowCapped: boolean;
  description: string;
};

export type UserScoreBreakdown = {
  userId: string;
  tenantId: string;
  totalScore: number;
  promotionThreshold: number;
  windowDays: number;
  eligible: boolean;
  signals: ScoreSignal[];
};

export type VoteCastPointBreakdown = {
  tenantId: string;
  promiseId: string;
  points: number;
  actionCount: number;
  lastEarnedAt: string;
};

export type VoteCastPointSummary = {
  tenantId: string;
  windowDays: number;
  windowCap: number;
  promisePoints: VoteCastPointBreakdown[];
};

export type UserScoreHistoryEntry = {
  id: string;
  tenantId: string;
  eventType: ScoreEventType;
  delta: number;
  description: string;
  createdAt: string;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  countsTowardCurrentScore: boolean;
};

export type UserScoreHistory = {
  userId: string;
  tenantId: string;
  windowDays: number;
  entries: UserScoreHistoryEntry[];
};

type StaticScoreEvent = {
  eventType: ScoreEventType;
  delta: number;
  metadata: Record<string, unknown>;
};

function buildEmptyUserScoreBreakdown(
  userId: string,
  tenantId: string,
  config: ScoringConfig,
  windowDays: number
): UserScoreBreakdown {
  return {
    userId,
    tenantId,
    totalScore: 0,
    promotionThreshold: config.promotionThreshold,
    windowDays,
    eligible: false,
    signals: []
  };
}

function buildVoteCastScoreReference({
  tenantId,
  promiseId,
  userId,
  createdAt,
  eventType
}: {
  tenantId: string;
  promiseId: string;
  userId: string;
  createdAt: string;
  eventType: "created" | "changed";
}) {
  return `vote_cast:${tenantId}:${promiseId}:${userId}:${createdAt}:${eventType}`;
}

function buildScoreEventId(referenceId: string) {
  return `score:${referenceId}`;
}

async function backfillVoteCastScoreEvents(
  userId: string,
  tenantId: string,
  voteCastDelta: number,
  windowStart?: Date
) {
  if (voteCastDelta <= 0) {
    return;
  }

  const voteEventFilters = [eq(voteEvents.userId, userId), eq(voteEvents.tenantId, tenantId)];
  if (windowStart) {
    voteEventFilters.push(gte(voteEvents.createdAt, windowStart));
  }

  const recentVoteEvents = await runQuery((db) =>
    db
      .select({
        promiseId: voteEvents.promiseId,
        newValue: voteEvents.newValue,
        eventType: voteEvents.eventType,
        createdAt: voteEvents.createdAt
      })
      .from(voteEvents)
      .where(and(...voteEventFilters))
      .orderBy(voteEvents.createdAt)
  );

  if (recentVoteEvents.length === 0) {
    return;
  }

  const referenceIds = recentVoteEvents.map((event) =>
    buildVoteCastScoreReference({
      tenantId,
      promiseId: event.promiseId,
      userId,
      createdAt: event.createdAt.toISOString(),
      eventType: event.eventType as "created" | "changed"
    })
  );
  let existingRows;

  try {
    existingRows = await runQuery((db) =>
      db
        .select({ referenceId: userScoreEvents.referenceId })
        .from(userScoreEvents)
        .where(
          and(
            eq(userScoreEvents.userId, userId),
            eq(userScoreEvents.tenantId, tenantId),
            eq(userScoreEvents.eventType, "vote_cast"),
            inArray(userScoreEvents.referenceId, referenceIds)
          )
        )
    );
  } catch (error) {
    if (isMissingUserScoreEventsTableError(error)) {
      return;
    }

    throw error;
  }
  const existingReferenceIds = new Set(existingRows.map((row) => row.referenceId).filter((row): row is string => Boolean(row)));

  const missingRows = recentVoteEvents.flatMap((event) => {
    const createdAt = event.createdAt.toISOString();
    const referenceId = buildVoteCastScoreReference({
      tenantId,
      promiseId: event.promiseId,
      userId,
      createdAt,
      eventType: event.eventType as "created" | "changed"
    });

    if (existingReferenceIds.has(referenceId)) {
      return [];
    }

    return [{
      id: buildScoreEventId(referenceId),
      userId,
      tenantId,
      eventType: "vote_cast" as const,
      delta: voteCastDelta,
      referenceId,
      metadata: {
        promiseId: event.promiseId,
        voteValue: event.newValue,
        voteEventType: event.eventType
      },
      createdAt: event.createdAt
    }];
  });

  if (missingRows.length === 0) {
    return;
  }

  try {
    await runQuery((db) => db.insert(userScoreEvents).values(missingRows));
  } catch (error) {
    if (isMissingUserScoreEventsTableError(error)) {
      return;
    }

    throw error;
  }
}

function isMissingUserScoreEventsTableError(error: unknown): boolean {
  const visited = new WeakSet<object>();

  const inspect = (value: unknown): boolean => {
    if (!value || typeof value !== "object") {
      return false;
    }

    if (visited.has(value)) {
      return false;
    }

    visited.add(value);

    const code = (value as { code?: unknown }).code;
    const message = (value as { message?: unknown }).message;
    if (code === "42P01" && typeof message === "string" && message.includes("user_score_events")) {
      return true;
    }

    const cause = (value as { cause?: unknown }).cause;
    if (inspect(cause)) {
      return true;
    }

    return false;
  };

  return inspect(error);
}

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

function resolveScoringConfig(tenantId: string): ScoringConfig {
  const override = getTenantConfigOverride(tenantId);
  const tenantScoring = (override as { scoring?: Partial<ScoringConfig> })?.scoring;
  if (!tenantScoring) return scoringDefaults;
  // Deep merge: tenant can override individual fields
  return {
    ...scoringDefaults,
    ...tenantScoring,
    weights: { ...scoringDefaults.weights, ...tenantScoring.weights },
    windowCaps: { ...scoringDefaults.windowCaps, ...tenantScoring.windowCaps },
    halvingSchedule: tenantScoring.halvingSchedule ?? scoringDefaults.halvingSchedule
  };
}

export function getVoteCastScoreWeight(tenantId: string): number {
  return resolveScoringConfig(tenantId).weights.voteCast;
}

/**
 * Resolve the current rolling window length in days.
 * If autoAdjust is true, counts active registered users for the tenant and
 * walks the halvingSchedule to find the right window. Otherwise returns
 * the fixed windowDays value.
 */
export async function resolveWindowDays(tenantId: string): Promise<number> {
  const config = resolveScoringConfig(tenantId);

  if (!config.autoAdjust) {
    return config.windowDays;
  }

  const [{ value: activeUserCount }] = await runQuery((db) =>
    db
      .select({ value: count() })
      .from(users)
      .where(
        and(
          // count users that have interacted with this tenant — approximated as
          // all non-suspended, non-guest DB users. Adjust when tenant-user join
          // table is introduced.
          inArray(users.state, ["verified", "moderator_approved", "readonly", "unverified"] as AccountState[])
        )
      )
  );

  const userCount = Number(activeUserCount);
  const schedule = [...config.halvingSchedule].sort((a, b) => b.atUserCount - a.atUserCount);
  const entry = schedule.find((e) => userCount >= e.atUserCount);
  return entry?.windowDays ?? config.windowDays;
}

// ---------------------------------------------------------------------------
// Score computation
// ---------------------------------------------------------------------------

/**
 * Compute the rolling-window score for a user.
 * - Static events (email_verified, account_age, account_state, abuse_flag,
 *   review_opened, review_closed, suspension) are always included regardless
 *   of age.
 * - Activity events are restricted to the rolling window and capped per window.
 */
export async function computeUserScore(userId: string, tenantId: string): Promise<UserScoreBreakdown> {
  const config = resolveScoringConfig(tenantId);
  const windowDays = await resolveWindowDays(tenantId);
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  await backfillVoteCastScoreEvents(userId, tenantId, config.weights.voteCast, windowStart);

  let allEvents;

  try {
    allEvents = await runQuery((db) =>
      db
        .select()
        .from(userScoreEvents)
        .where(and(eq(userScoreEvents.userId, userId), eq(userScoreEvents.tenantId, tenantId)))
        .orderBy(userScoreEvents.createdAt)
    );
  } catch (error) {
    if (isMissingUserScoreEventsTableError(error)) {
      return buildEmptyUserScoreBreakdown(userId, tenantId, config, windowDays);
    }

    throw error;
  }

  // Split events: static (all time) vs activity (within rolling window)
  const staticEvents = allEvents.filter((e) => !ACTIVITY_EVENT_TYPES.has(e.eventType as ScoreEventType));
  const activityEvents = allEvents.filter(
    (e) => ACTIVITY_EVENT_TYPES.has(e.eventType as ScoreEventType) && e.createdAt >= windowStart
  );
  const effectiveStaticEvents = staticEvents.length > 0
    ? staticEvents.map((event) => ({
      eventType: event.eventType as ScoreEventType,
      delta: event.delta,
      metadata: event.metadata as Record<string, unknown>
    }))
    : await getCurrentStaticScoreEvents(userId, tenantId);

  // --- Static signal total ---
  const staticTotal = effectiveStaticEvents.reduce((sum, event) => sum + event.delta, 0);

  // --- Activity signals capped per window ---
  const caps: Record<string, number> = {
    vote_cast: config.windowCaps.voteCast,
    vote_aligned: config.windowCaps.voteAligned,
    flag_acted: config.windowCaps.flagActed,
    witnessed_approval: config.windowCaps.witnessedApproval,
    endorsement_received: config.windowCaps.endorsementReceived
  };

  // Accumulate per-category totals, respecting caps
  const categoryTotals: Record<string, number> = {};
  for (const e of activityEvents) {
    const cat = e.eventType;
    const cap = caps[cat] ?? Infinity;
    const current = categoryTotals[cat] ?? 0;
    const available = cap - current;
    if (available > 0) {
      categoryTotals[cat] = current + Math.min(e.delta, available);
    }
  }
  const activityTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const totalScore = staticTotal + activityTotal;

  // Build human-readable signal breakdown
  const signals: ScoreSignal[] = [
    ...effectiveStaticEvents.map((event) => ({
      eventType: event.eventType,
      delta: event.delta,
      windowCapped: false,
      description: buildEventDescription(event.eventType, event.delta, event.metadata)
    })),
    ...Object.entries(categoryTotals).map(([eventType, delta]) => ({
      eventType: eventType as ScoreEventType,
      delta,
      windowCapped: true,
      description: `${delta} pts from ${eventType.replace(/_/g, " ")} (last ${windowDays}d, cap ${caps[eventType]})`
    }))
  ];

  return {
    userId,
    tenantId,
    totalScore,
    promotionThreshold: config.promotionThreshold,
    windowDays,
    eligible: totalScore >= config.promotionThreshold,
    signals
  };
}

export async function getVoteCastPointSummaryForUser(userId: string, tenantId: string): Promise<VoteCastPointSummary> {
  const config = resolveScoringConfig(tenantId);
  const windowDays = await resolveWindowDays(tenantId);
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  await backfillVoteCastScoreEvents(userId, tenantId, config.weights.voteCast, windowStart);

  const events = await runQuery((db) =>
    db
      .select()
      .from(userScoreEvents)
      .where(
        and(
          eq(userScoreEvents.userId, userId),
          eq(userScoreEvents.tenantId, tenantId),
          eq(userScoreEvents.eventType, "vote_cast"),
          gte(userScoreEvents.createdAt, windowStart)
        )
      )
      .orderBy(userScoreEvents.createdAt)
  );

  const promisePoints = new Map<string, VoteCastPointBreakdown>();
  let remainingCap = config.windowCaps.voteCast;

  for (const event of events) {
    if (remainingCap <= 0) {
      break;
    }

    const metadata = event.metadata as Record<string, unknown>;
    const promiseIdCandidate = metadata.promiseId;
    const promiseId = typeof promiseIdCandidate === "string"
      ? promiseIdCandidate
      : typeof event.referenceId === "string" && !event.referenceId.startsWith("vote_cast:")
        ? event.referenceId
        : null;

    if (!promiseId) {
      continue;
    }

    const effectiveDelta = Math.max(0, Math.min(event.delta, remainingCap));
    if (effectiveDelta <= 0) {
      continue;
    }

    remainingCap -= effectiveDelta;
    const existing = promisePoints.get(promiseId);
    if (existing) {
      existing.points += effectiveDelta;
      existing.actionCount += 1;
      existing.lastEarnedAt = event.createdAt.toISOString();
      continue;
    }

    promisePoints.set(promiseId, {
      tenantId,
      promiseId,
      points: effectiveDelta,
      actionCount: 1,
      lastEarnedAt: event.createdAt.toISOString()
    });
  }

  return {
    tenantId,
    windowDays,
    windowCap: config.windowCaps.voteCast,
    promisePoints: Array.from(promisePoints.values())
  };
}

export async function getUserScoreHistoryForUser(userId: string, tenantId: string): Promise<UserScoreHistory> {
  const config = resolveScoringConfig(tenantId);
  const windowDays = await resolveWindowDays(tenantId);
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  await backfillVoteCastScoreEvents(userId, tenantId, config.weights.voteCast);

  let allEvents;

  try {
    allEvents = await runQuery((db) =>
      db
        .select()
        .from(userScoreEvents)
        .where(and(eq(userScoreEvents.userId, userId), eq(userScoreEvents.tenantId, tenantId)))
        .orderBy(userScoreEvents.createdAt)
    );
  } catch (error) {
    if (isMissingUserScoreEventsTableError(error)) {
      return {
        userId,
        tenantId,
        windowDays,
        entries: []
      };
    }

    throw error;
  }

  return {
    userId,
    tenantId,
    windowDays,
    entries: [...allEvents]
      .reverse()
      .map((event) => ({
        id: event.id,
        tenantId: event.tenantId,
        eventType: event.eventType as ScoreEventType,
        delta: event.delta,
        description: buildEventDescription(event.eventType as ScoreEventType, event.delta, event.metadata as Record<string, unknown>),
        createdAt: event.createdAt.toISOString(),
        referenceId: event.referenceId ?? null,
        metadata: event.metadata as Record<string, unknown>,
        countsTowardCurrentScore: !ACTIVITY_EVENT_TYPES.has(event.eventType as ScoreEventType) || event.createdAt >= windowStart
      }))
  };
}

function buildEventDescription(eventType: ScoreEventType, delta: number, metadata: Record<string, unknown>): string {
  switch (eventType) {
    case "vote_cast": {
      const verb = metadata.voteEventType === "changed" ? "Vote updated" : "Vote cast";
      const rawVoteValue = typeof metadata.voteValue === "string" ? metadata.voteValue : null;
      const voteValue = rawVoteValue ? rawVoteValue.replace(/_/g, " ") : null;
      return `${verb}${voteValue ? `: ${voteValue}` : ""} (${delta > 0 ? "+" : ""}${delta})`;
    }
    case "email_verified":
      return delta > 0 ? "Email verified (+15)" : "Email not verified";
    case "account_age":
      return `Account age: ${metadata.ageDays ?? "?"} days (${delta > 0 ? "+" : ""}${delta})`;
    case "account_state":
      return `Account state: ${metadata.state ?? "?"} (${delta > 0 ? "+" : ""}${delta})`;
    case "abuse_flag":
      return `Abuse flag recorded (${delta})`;
    case "review_opened":
      return `Moderation review opened against user (${delta})`;
    case "review_closed":
      return `Moderation review closed, penalty lifted (+${Math.abs(delta)})`;
    case "suspension":
      return `Account was suspended (${delta})`;
    default:
      return `${eventType.replace(/_/g, " ")} (${delta > 0 ? "+" : ""}${delta})`;
  }
}

async function getCurrentStaticScoreEvents(userId: string, tenantId: string): Promise<StaticScoreEvent[]> {
  const config = resolveScoringConfig(tenantId);
  const [user] = await runQuery((db) =>
    db.select().from(users).where(eq(users.id, userId)).limit(1)
  );

  if (!user) {
    return [];
  }

  const ageDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const events: StaticScoreEvent[] = [
    {
      eventType: "email_verified",
      delta: user.emailVerified ? config.weights.emailVerified : -Math.abs(config.weights.emailVerified),
      metadata: { emailVerified: user.emailVerified }
    },
    {
      eventType: "account_age",
      delta: ageDays >= 90 ? config.weights.accountAge90d : ageDays >= 30 ? config.weights.accountAge30d : 0,
      metadata: { ageDays }
    },
    {
      eventType: "account_state",
      delta:
        user.state === "moderator_approved"
          ? config.weights.stateModeratorApproved
          : user.state === "verified"
            ? config.weights.stateVerified
            : user.state === "readonly"
              ? config.weights.openReviewPenalty
              : 0,
      metadata: { state: user.state }
    }
  ];

  if (user.state === "suspended") {
    events.push({
      eventType: "suspension",
      delta: config.weights.suspensionPenalty,
      metadata: { state: user.state }
    });
  }

  return events.filter((event) => event.delta !== 0);
}

// ---------------------------------------------------------------------------
// Score event recording
// ---------------------------------------------------------------------------

export async function recordScoreEvent({
  userId,
  tenantId,
  eventType,
  delta,
  referenceId,
  metadata = {},
  now = new Date()
}: {
  userId: string;
  tenantId: string;
  eventType: ScoreEventType;
  delta: number;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  now?: Date;
}): Promise<void> {
  const id = `score:${eventType}:${userId}:${now.toISOString()}:${Math.random().toString(36).slice(2, 8)}`;
  await runQuery((db) =>
    db.insert(userScoreEvents).values({
      id,
      userId,
      tenantId,
      eventType,
      delta,
      referenceId: referenceId ?? null,
      metadata,
      createdAt: now
    })
  );
}

// ---------------------------------------------------------------------------
// Static signal bootstrap
// ---------------------------------------------------------------------------

/**
 * Emit static score events for a user based on their current account properties.
 * Idempotent — replaces any existing static events by deleting and reinserting.
 * Called after signup completion, email verification, state changes, flag additions.
 */
export async function refreshStaticScoreEvents(
  userId: string,
  tenantId: string,
  now = new Date()
): Promise<void> {
  const staticTypes: ScoreEventType[] = [
    "email_verified",
    "account_age",
    "account_state",
    "abuse_flag",
    "suspension"
  ];

  // Remove old static events for this user/tenant
  await runQuery((db) =>
    db.delete(userScoreEvents).where(
      and(
        eq(userScoreEvents.userId, userId),
        eq(userScoreEvents.tenantId, tenantId),
        inArray(userScoreEvents.eventType, staticTypes)
      )
    )
  );

  const events = await getCurrentStaticScoreEvents(userId, tenantId);

  for (const e of events) {
    await recordScoreEvent({ userId, tenantId, ...e, now });
  }
}

// ---------------------------------------------------------------------------
// Auto-promotion
// ---------------------------------------------------------------------------

/**
 * Check if the user's score meets the threshold and auto-promote them to
 * `moderator_approved` if they are currently `verified`.
 * Returns true if promotion occurred.
 */
export async function checkAndAutoPromote(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const breakdown = await computeUserScore(userId, tenantId);
  if (!breakdown.eligible) return false;

  const [user] = await runQuery((db) =>
    db.select().from(users).where(eq(users.id, userId)).limit(1)
  );
  if (!user || user.state !== "verified") return false;

  const now = new Date().toISOString();
  await runQuery((db) =>
    db.update(users).set({ state: "moderator_approved", updatedAt: new Date(now) }).where(eq(users.id, userId))
  );

  // Refresh static events to reflect new state
  await refreshStaticScoreEvents(userId, tenantId, new Date(now));

  await appendAuditLog({
    tenantId,
    actorId: null,
    action: "community_score.auto_promoted",
    entityType: "account",
    entityId: userId,
    metadata: {
      totalScore: breakdown.totalScore,
      threshold: breakdown.promotionThreshold,
      windowDays: breakdown.windowDays
    },
    createdAt: now
  });

  return true;
}

// ---------------------------------------------------------------------------
// Endorsement helpers (used by API routes)
// ---------------------------------------------------------------------------

export async function getActiveEndorsementsForSubject(subjectId: string, tenantId: string) {
  return runQuery((db) =>
    db
      .select()
      .from(communityEndorsements)
      .where(
        and(
          eq(communityEndorsements.subjectId, subjectId),
          eq(communityEndorsements.tenantId, tenantId),
          eq(communityEndorsements.status, "active")
        )
      )
  );
}

export async function getEndorsementById(endorsementId: string) {
  const [row] = await runQuery((db) =>
    db
      .select()
      .from(communityEndorsements)
      .where(eq(communityEndorsements.id, endorsementId))
      .limit(1)
  );
  return row ?? null;
}
