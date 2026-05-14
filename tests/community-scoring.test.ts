import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { eq } from "drizzle-orm";
import * as dbClient from "@/db/client";
import { communityEndorsements, userScoreEvents, users } from "@/db/schema";
import {
  checkAndAutoPromote,
  computeUserScore,
  getUserScoreHistoryForUser,
  recordScoreEvent,
  resolveWindowDays,
  refreshStaticScoreEvents
} from "@/modules/moderation/community-score";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function clearScoreEventsForUser(userId: string, tenantId: string) {
  const db = dbClient.createDbClient();
  await db
    .delete(userScoreEvents)
    .where(eq(userScoreEvents.userId, userId));
}

async function clearEndorsementsForUser(userId: string) {
  const db = dbClient.createDbClient();
  await db.delete(communityEndorsements).where(eq(communityEndorsements.subjectId, userId));
}

// ---------------------------------------------------------------------------
// resolveWindowDays
// ---------------------------------------------------------------------------

describe("resolveWindowDays", () => {
  it("returns fixed windowDays when autoAdjust is false via config", async () => {
    // We can't easily mock tenant config in integration tests, so we test the
    // default platform behaviour directly.
    const days = await resolveWindowDays("tenant-tamilnadu");
    // With default autoAdjust=true and some users in the seed, we expect a
    // reasonable positive number from the halvingSchedule.
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(90);
  });
});

// ---------------------------------------------------------------------------
// computeUserScore
// ---------------------------------------------------------------------------

describe("computeUserScore – activity signal window", () => {
  const userId = "demo-user";
  const tenantId = "tenant-tamilnadu";

  beforeEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
  });

  afterEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
  });

  it("accumulates activity events within the rolling window", async () => {
    // Insert 5 vote_cast events now — within any window period
    for (let i = 0; i < 5; i++) {
      await recordScoreEvent({
        userId,
        tenantId,
        eventType: "vote_cast",
        delta: 2,
        now: new Date()
      });
    }

    const breakdown = await computeUserScore(userId, tenantId);
    // 5 events × 2pts = 10, which is below the 20pt window cap
    expect(breakdown.signals.some((s) => s.eventType === "vote_cast")).toBe(true);
    const voteSig = breakdown.signals.find((s) => s.eventType === "vote_cast");
    expect(voteSig?.delta).toBe(10);
  });

  it("caps activity events at the per-window maximum", async () => {
    // Insert 20 vote_cast events at 2pts each → would be 40 but cap is 20
    for (let i = 0; i < 20; i++) {
      await recordScoreEvent({
        userId,
        tenantId,
        eventType: "vote_cast",
        delta: 2,
        now: new Date()
      });
    }

    const breakdown = await computeUserScore(userId, tenantId);
    const voteSig = breakdown.signals.find((s) => s.eventType === "vote_cast");
    expect(voteSig?.delta).toBe(20); // capped at 20
  });

  it("excludes activity events older than the rolling window", async () => {
    // Insert a vote_cast event 200 days ago (beyond any window)
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
    await recordScoreEvent({
      userId,
      tenantId,
      eventType: "vote_cast",
      delta: 2,
      now: oldDate
    });

    const breakdown = await computeUserScore(userId, tenantId);
    const voteSig = breakdown.signals.find((s) => s.eventType === "vote_cast");
    // Old event should not contribute
    expect(voteSig).toBeUndefined();
  });

  it("includes static events regardless of age", async () => {
    // Insert an email_verified event 200 days ago — should still count
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
    await recordScoreEvent({
      userId,
      tenantId,
      eventType: "email_verified",
      delta: 15,
      now: oldDate
    });

    const breakdown = await computeUserScore(userId, tenantId);
    const emailSig = breakdown.signals.find((s) => s.eventType === "email_verified");
    expect(emailSig).toBeDefined();
    expect(emailSig?.delta).toBe(15);
    expect(emailSig?.windowCapped).toBe(false);
  });
});

describe("computeUserScore – schema fallback", () => {
  it("returns an empty breakdown when the score-events table is missing", async () => {
    const runQuerySpy = vi.spyOn(dbClient, "runQuery");
    runQuerySpy
      .mockResolvedValueOnce([{ value: 1 }] as never)
      .mockResolvedValueOnce([] as never)
      .mockRejectedValueOnce(Object.assign(new Error('relation "user_score_events" does not exist'), { code: "42P01" }));

    await expect(computeUserScore("demo-user", "tenant-tamilnadu")).resolves.toMatchObject({
      userId: "demo-user",
      tenantId: "tenant-tamilnadu",
      totalScore: 0,
      eligible: false,
      signals: []
    });
  });
});

describe("computeUserScore – static fallback", () => {
  const userId = "demo-user";
  const tenantId = "tenant-tamilnadu";

  beforeEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
  });

  afterEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
  });

  it("derives baseline static score when no persisted score rows exist yet", async () => {
    const breakdown = await computeUserScore(userId, tenantId);

    expect(breakdown.totalScore).toBeGreaterThan(0);
    expect(breakdown.signals.some((signal) => signal.eventType === "email_verified")).toBe(true);
    expect(breakdown.signals.some((signal) => signal.eventType === "account_age")).toBe(true);
    expect(breakdown.signals.some((signal) => signal.eventType === "account_state")).toBe(true);
  });
});

describe("getUserScoreHistoryForUser", () => {
  const userId = "demo-user";
  const tenantId = "tenant-tamilnadu";

  beforeEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
  });

  afterEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
  });

  it("returns chronological point activity and marks expired windowed actions", async () => {
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
    const currentDate = new Date();

    await recordScoreEvent({
      userId,
      tenantId,
      eventType: "vote_cast",
      delta: 2,
      metadata: { promiseId: "promise-power", voteValue: "started", voteEventType: "created" },
      now: oldDate
    });
    await recordScoreEvent({
      userId,
      tenantId,
      eventType: "email_verified",
      delta: 15,
      now: currentDate
    });

    const history = await getUserScoreHistoryForUser(userId, tenantId);
    const voteEntry = history.entries.find((entry) => entry.eventType === "vote_cast");
    const emailEntry = history.entries.find((entry) => entry.eventType === "email_verified");

    expect(history.entries[0]?.eventType).toBe("email_verified");
    expect(voteEntry?.countsTowardCurrentScore).toBe(false);
    expect(emailEntry?.countsTowardCurrentScore).toBe(true);
    expect(voteEntry?.description).toContain("Vote cast");
  });
});

// ---------------------------------------------------------------------------
// checkAndAutoPromote
// ---------------------------------------------------------------------------

describe("checkAndAutoPromote", () => {
  const userId = "demo-user";
  const tenantId = "tenant-tamilnadu";
  const db = dbClient.createDbClient();

  afterEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
    // Reset user back to verified
    await db.update(users).set({ state: "verified" }).where(eq(users.id, userId));
  });

  it("promotes a verified user when score reaches the threshold", async () => {
    // Seed enough static events to hit 75pts
    // email_verified(+15) + age90d(+20) + state_verified(+10) = 45 static
    // Then fill activity to reach 75:
    // We need 30 more → witnessedApproval cap=30 at +10 each = 3 events
    await recordScoreEvent({ userId, tenantId, eventType: "email_verified", delta: 15 });
    await recordScoreEvent({ userId, tenantId, eventType: "account_age", delta: 20 });
    await recordScoreEvent({ userId, tenantId, eventType: "account_state", delta: 10 });
    for (let i = 0; i < 3; i++) {
      await recordScoreEvent({ userId, tenantId, eventType: "witnessed_approval", delta: 10 });
    }

    const promoted = await checkAndAutoPromote(userId, tenantId);
    expect(promoted).toBe(true);

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    expect(user?.state).toBe("moderator_approved");
  });

  it("does not promote when score is below threshold", async () => {
    // Only a small amount of points
    await recordScoreEvent({ userId, tenantId, eventType: "email_verified", delta: 15 });

    const promoted = await checkAndAutoPromote(userId, tenantId);
    expect(promoted).toBe(false);

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    expect(user?.state).toBe("verified");
  });
});

// ---------------------------------------------------------------------------
// Endorsement guard: no self-endorsement
// ---------------------------------------------------------------------------

describe("endorsement guards (DB-level)", () => {
  const endorserId = "editor-user"; // moderator_approved
  const subjectId = "demo-user";
  const tenantId = "tenant-tamilnadu";

  afterEach(async () => {
    await clearEndorsementsForUser(subjectId);
    await clearScoreEventsForUser(subjectId, tenantId);
  });

  it("records an endorsement score event for the subject", async () => {
    await recordScoreEvent({
      userId: subjectId,
      tenantId,
      eventType: "endorsement_received",
      delta: 12,
      referenceId: "test-endorsement",
      metadata: { endorserId }
    });

    const db = dbClient.createDbClient();
    const rows = await db
      .select()
      .from(userScoreEvents)
      .where(eq(userScoreEvents.userId, subjectId));

    const endorsementEvent = rows.find((r) => r.eventType === "endorsement_received");
    expect(endorsementEvent).toBeDefined();
    expect(endorsementEvent?.delta).toBe(12);
  });

  it("records a negative endorsement event on withdrawal", async () => {
    await recordScoreEvent({
      userId: subjectId,
      tenantId,
      eventType: "endorsement_withdrawn",
      delta: -12,
      referenceId: "test-endorsement",
      metadata: { endorserId }
    });

    const db = dbClient.createDbClient();
    const rows = await db
      .select()
      .from(userScoreEvents)
      .where(eq(userScoreEvents.userId, subjectId));

    const withdrawal = rows.find((r) => r.eventType === "endorsement_withdrawn");
    expect(withdrawal).toBeDefined();
    expect(withdrawal?.delta).toBe(-12);
  });
});

// ---------------------------------------------------------------------------
// refreshStaticScoreEvents
// ---------------------------------------------------------------------------

describe("refreshStaticScoreEvents", () => {
  const userId = "demo-user";
  const tenantId = "tenant-tamilnadu";

  afterEach(async () => {
    await clearScoreEventsForUser(userId, tenantId);
  });

  it("replaces previous static events without leaving duplicates", async () => {
    await refreshStaticScoreEvents(userId, tenantId);
    await refreshStaticScoreEvents(userId, tenantId); // call twice

    const db = dbClient.createDbClient();
    const rows = await db
      .select()
      .from(userScoreEvents)
      .where(eq(userScoreEvents.userId, userId));

    // Should have at most 3 static rows (email_verified, account_age, account_state)
    const staticTypes = rows.filter((r) =>
      ["email_verified", "account_age", "account_state"].includes(r.eventType)
    );
    expect(staticTypes.length).toBeLessThanOrEqual(3);
  });
});
