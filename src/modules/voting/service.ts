import { resolveTenantConfig } from "@/config/resolve-config";
import { canUserVote, getVoteCategory, type DemoUser, type VoteCategory } from "@/lib/permissions";
import { getPromiseById } from "@/modules/promises/repository";
import { appendAuditLog } from "@/modules/audit/logs";
import { calculateVoteAggregate, type VoteValue } from "@/modules/voting/assessment";
import { upsertTimelineScoreProjection } from "@/modules/timelines/score";
import {
  appendVoteEvent,
  getVoteForUser,
  listVoteEventsForPromise,
  listVotesForPromise,
  upsertVote,
  type VoteEventRecord,
  type VoteRecord
} from "@/modules/voting/store";

export type VotingState = "scheduled" | "open" | "frozen" | "closed";

export type VoteSummary = {
  counts: Record<VoteValue, number>;
  categoryCounts: Record<VoteCategory, number>;
  completionPercent: number;
  dominantVote: VoteValue | null;
  currentVote: VoteValue | null;
  totalVotes: number;
  eventCount: number;
};

type VotingWindow = {
  startAt: string;
  freezeAt: string;
  endAt: string;
};

type CastVoteInput = {
  tenantId: string;
  promiseId: string;
  /** null for unauthenticated guest voters */
  user: DemoUser | null;
  value: VoteValue;
  now?: Date;
};

type VoteSummaryInput = {
  tenantId: string;
  promiseId: string;
  userId?: string | null;
};

export class VoteError extends Error {
  constructor(
    public code: "FORBIDDEN" | "NOT_FOUND" | "WINDOW_CLOSED",
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export function resolveVotingState(window: VotingWindow, now: Date = new Date()): VotingState {
  const currentTime = now.getTime();
  const startAt = new Date(window.startAt).getTime();
  const freezeAt = new Date(window.freezeAt).getTime();
  const endAt = new Date(window.endAt).getTime();

  if (currentTime < startAt) {
    return "scheduled";
  }

  if (currentTime >= endAt) {
    return "closed";
  }

  if (currentTime >= freezeAt) {
    return "frozen";
  }

  return "open";
}

export function getVotingWindowStatusForPromise({ tenantId, promiseId, now = new Date() }: { tenantId: string; promiseId: string; now?: Date }) {
  const promise = getPromiseById(tenantId, promiseId);
  if (!promise) {
    throw new VoteError("NOT_FOUND", "Promise not found.", 404);
  }

  const config = resolveTenantConfig(tenantId);
  const state = resolveVotingState(
    {
      startAt: config.votingWindows.defaultStartAt,
      freezeAt: config.votingWindows.defaultFreezeAt,
      endAt: config.votingWindows.defaultEndAt
    },
    now
  );

  return {
    state,
    window: config.votingWindows
  };
}

export function getPromiseVoteSummary({ tenantId, promiseId, userId }: VoteSummaryInput) {
  const votes = listVotesForPromise(tenantId, promiseId);
  const currentVote = userId ? getVoteForUser(tenantId, promiseId, userId) : null;
  const aggregate = calculateVoteAggregate(votes);

  const categoryCounts: Record<VoteCategory, number> = { verified: 0, unverified: 0, guest: 0 };
  for (const vote of votes) {
    categoryCounts[vote.voteCategory] += 1;
  }

  return {
    counts: aggregate.counts,
    categoryCounts,
    completionPercent: aggregate.completionPercent,
    dominantVote: aggregate.dominantVote,
    currentVote: currentVote?.value ?? null,
    totalVotes: aggregate.totalVotes,
    eventCount: listVoteEventsForPromise(tenantId, promiseId).length
  } satisfies VoteSummary;
}

export function castVote({ tenantId, promiseId, user, value, now = new Date() }: CastVoteInput) {
  const promise = getPromiseById(tenantId, promiseId);
  if (!promise) {
    throw new VoteError("NOT_FOUND", "Promise not found.", 404);
  }

  if (!canUserVote(user)) {
    throw new VoteError("FORBIDDEN", "This account is not eligible to vote.", 403);
  }

  const votingWindow = getVotingWindowStatusForPromise({ tenantId, promiseId, now });
  if (votingWindow.state !== "open") {
    throw new VoteError("WINDOW_CLOSED", `Voting is ${votingWindow.state} for this promise.`, 409);
  }

  const userId = user?.id ?? "guest";
  const voteCategory = getVoteCategory(user);
  const existingVote = getVoteForUser(tenantId, promiseId, userId);
  const timestamp = now.toISOString();

  if (existingVote?.value === value) {
    return {
      summary: getPromiseVoteSummary({ tenantId, promiseId, userId }),
      event: null
    };
  }

  const voteRecord: VoteRecord = {
    tenantId,
    promiseId,
    userId,
    value,
    voteCategory,
    createdAt: existingVote?.createdAt ?? timestamp,
    updatedAt: timestamp
  };

  const eventRecord: VoteEventRecord = {
    tenantId,
    promiseId,
    userId,
    previousValue: existingVote?.value ?? null,
    newValue: value,
    voteCategory,
    eventType: existingVote ? "changed" : "created",
    createdAt: timestamp
  };

  upsertVote(voteRecord);
  appendVoteEvent(eventRecord);
  appendAuditLog({
    tenantId,
    actorId: userId,
    action: existingVote ? "vote.changed" : "vote.created",
    entityType: "promise",
    entityId: promiseId,
    metadata: {
      previousValue: eventRecord.previousValue,
      newValue: eventRecord.newValue,
      voteCategory
    },
    createdAt: timestamp
  });
  const projection = upsertTimelineScoreProjection({ tenantId, timelineSlug: promise.timelineSlug, now });
  appendAuditLog({
    tenantId,
    actorId: userId,
    action: "timeline_score.recalculated",
    entityType: "timeline",
    entityId: promise.timelineSlug,
    metadata: {
      score: projection.score,
      assessedPromiseCount: projection.assessedPromiseCount,
      promiseCount: projection.promiseCount,
      totalVotes: projection.totalVotes,
      termElapsedPercent: projection.termElapsedPercent,
      formulaVersion: projection.formulaVersion,
      triggerPromiseId: promiseId
    },
    createdAt: timestamp
  });

  return {
    summary: getPromiseVoteSummary({ tenantId, promiseId, userId }),
    event: eventRecord
  };
}
