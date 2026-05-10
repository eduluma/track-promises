import { describe, expect, it } from "vitest";

import { VoteError, castVote, getPromiseVoteSummary, resolveVotingState } from "@/modules/voting/service";

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

  it("appends a vote event when a user changes a vote", () => {
    const before = getPromiseVoteSummary({
      tenantId: "tenant-tamilnadu",
      promiseId: "promise-power",
      userId: "demo-user"
    });

    const result = castVote({
      tenantId: "tenant-tamilnadu",
      promiseId: "promise-power",
      user: {
        id: "demo-user",
        email: "demo@track-promises.local",
        emailVerified: true,
        state: "verified"
      },
      value: "down",
      now: new Date("2026-06-01T00:00:00.000Z")
    });

    expect(result.event?.eventType).toBe("changed");
    expect(result.summary.currentVote).toBe("down");
    expect(result.summary.eventCount).toBe(before.eventCount + 1);
  });

  it("rejects votes after freeze", () => {
    expect(() =>
      castVote({
        tenantId: "tenant-tamilnadu",
        promiseId: "promise-power",
        user: {
          id: "demo-user",
          email: "demo@track-promises.local",
          emailVerified: true,
          state: "verified"
        },
        value: "up",
        now: new Date("2027-01-02T00:00:00.000Z")
      })
    ).toThrowError(VoteError);
  });
});
