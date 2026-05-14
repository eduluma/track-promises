import { describe, expect, it } from "vitest";

import { and, eq } from "drizzle-orm";
import * as dbClient from "@/db/client";
import { userScoreEvents } from "@/db/schema";
import { getTimelineScoreProjection } from "@/modules/timelines/score";
import { getVoteForUser } from "@/modules/voting/store";
import { VoteError, castVote, getPromiseVoteSummary, resolveVotingState } from "@/modules/voting/service";

async function clearScoreEventsForUser(userId: string, tenantId: string) {
  const db = dbClient.createDbClient();
  await db.delete(userScoreEvents).where(and(eq(userScoreEvents.userId, userId), eq(userScoreEvents.tenantId, tenantId)));
}

describe("voting rules", () => {
  it("reports open windows before freeze time", () => {
    expect(
      resolveVotingState(
        {
          startAt: "2026-01-01T00:00:00.000Z",
          freezeAt: "2026-12-31T00:00:00.000Z",
          endAt: "2027-03-01T00:00:00.000Z"
        },
        new Date("2026-06-01T00:00:00.000Z")
      )
    ).toBe("open");
  });

  it("appends a vote event when a user changes a vote", async () => {
    const before = await getPromiseVoteSummary({
      tenantId: "tenant-tamilnadu",
      promiseId: "promise-power",
      userId: "demo-user"
    });

    const result = await castVote({
      tenantId: "tenant-tamilnadu",
      promiseId: "promise-power",
      user: {
        id: "demo-user",
        email: "demo@track-promises.local",
        emailVerified: true,
        state: "verified"
      },
      value: "completed",
      now: new Date("2026-06-01T00:00:00.000Z")
    });

    expect(result.event?.eventType).toBe("changed");
    expect(result.summary.currentVote).toBe("completed");
    expect(result.summary.completionPercent).toBeGreaterThan(before.completionPercent);
    expect(result.summary.eventCount).toBe(before.eventCount + 1);
  });

  it("does not change the guest score when a registered user votes", async () => {
    const promiseId = "tn-2026-tvk-women-income-support";

    const guestVote = await castVote({
      tenantId: "tenant-tamilnadu",
      promiseId,
      user: {
        id: "guest-regression-user",
        email: null,
        emailVerified: false,
        state: "unverified",
        role: "guest"
      },
      value: "started",
      now: new Date("2026-05-16T00:00:00.000Z")
    });

    expect(guestVote.summary.guestVotes).toBe(1);
    expect(guestVote.summary.guestCompletionPercent).toBe(20);
    expect(guestVote.summary.registeredVotes).toBe(0);

    const registeredVote = await castVote({
      tenantId: "tenant-tamilnadu",
      promiseId,
      user: {
        id: "demo-user",
        email: "demo@track-promises.local",
        emailVerified: true,
        state: "verified"
      },
      value: "completed",
      now: new Date("2026-05-16T00:05:00.000Z")
    });

    expect(registeredVote.summary.guestVotes).toBe(1);
    expect(registeredVote.summary.guestCompletionPercent).toBe(20);
    expect(registeredVote.summary.guestCounts.started).toBe(1);
    expect(registeredVote.summary.registeredVotes).toBe(1);
    expect(registeredVote.summary.registeredCounts.completed).toBe(1);
    expect(registeredVote.summary.registeredCompletionPercent).toBe(100);
    expect(registeredVote.summary.verifiedCompletionPercent).toBe(100);
  });

  it("rejects votes after freeze", async () => {
    await expect(() =>
      castVote({
        tenantId: "tenant-tamilnadu",
        promiseId: "promise-power",
        user: {
          id: "demo-user",
          email: "demo@track-promises.local",
          emailVerified: true,
          state: "verified"
        },
        value: "in_progress",
        now: new Date("2027-01-02T00:00:00.000Z")
      })
    ).rejects.toThrowError(VoteError);
  });

  it("refreshes the timeline score projection when a vote changes", async () => {
    const before = await getTimelineScoreProjection({
      tenantId: "tenant-tamilnadu",
      timelineSlug: "2026",
      now: new Date("2026-05-15T00:00:00.000Z")
    });

    await castVote({
      tenantId: "tenant-tamilnadu",
      promiseId: "tn-2026-tvk-free-electricity-200-units",
      user: {
        id: "observer-2",
        email: "observer-2@track-promises.local",
        emailVerified: true,
        state: "verified"
      },
      value: "completed",
      now: new Date("2026-05-15T00:00:00.000Z")
    });

    const after = await getTimelineScoreProjection({
      tenantId: "tenant-tamilnadu",
      timelineSlug: "2026",
      now: new Date("2026-05-15T00:00:00.000Z")
    });

    expect(after.score).toBeGreaterThan(before.score);
    expect(after.totalVotes).toBe(before.totalVotes + 1);
  });

  it("records vote-cast score events with promise metadata", async () => {
    const tenantId = "tenant-tamilnadu";
    const userId = "observer-2";
    const promiseId = "promise-power";
    const now = new Date("2026-05-18T00:00:00.000Z");
    const existingVote = await getVoteForUser(tenantId, promiseId, userId);
    const nextValue = existingVote?.value === "completed" ? "started" : "completed";

    await clearScoreEventsForUser(userId, tenantId);

    await castVote({
      tenantId,
      promiseId,
      user: {
        id: userId,
        email: "observer-2@track-promises.local",
        emailVerified: true,
        state: "verified"
      },
      value: nextValue,
      now
    });

    const db = dbClient.createDbClient();
    const rows = await db
      .select()
      .from(userScoreEvents)
      .where(and(eq(userScoreEvents.userId, userId), eq(userScoreEvents.tenantId, tenantId), eq(userScoreEvents.eventType, "vote_cast")));

    const recordedRow = rows.find((row) => row.referenceId?.includes(`${promiseId}:${userId}:${now.toISOString()}`));

    expect(recordedRow).toBeDefined();
    expect(recordedRow?.delta).toBe(2);
    expect(recordedRow?.referenceId).toContain(promiseId);
    expect((recordedRow?.metadata as { promiseId?: string }).promiseId).toBe(promiseId);

    await clearScoreEventsForUser(userId, tenantId);
  });
});
