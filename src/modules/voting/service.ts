import { resolveTenantConfig } from "@/config/resolve-config";
import { canUserVote, type DemoUser } from "@/lib/permissions";
import { getPromiseById } from "@/modules/promises/repository";
import {
  appendVoteEvent,
  getVoteForUser,
  listVoteEventsForPromise,
  listVotesForPromise,
  upsertVote,
  type VoteEventRecord,
  type VoteRecord
} from "@/modules/voting/store";

export type VoteValue = "up" | "down";
export type VotingState = "scheduled" | "open" | "frozen" | "closed";

type VotingWindow = {
  startAt: string;
  freezeAt: string;
  endAt: string;
};

type CastVoteInput = {
  tenantId: string;
  promiseId: string;
  user: DemoUser;
  value: VoteValue;
  now?: Date;
};

type VoteSummaryInput = {
  tenantId: string;
  promiseId: string;
  userId: string;
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
  const currentVote = getVoteForUser(tenantId, promiseId, userId);
  const upvotes = votes.filter((vote) => vote.value === "up").length;
  const downvotes = votes.filter((vote) => vote.value === "down").length;

  return {
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    currentVote: currentVote?.value ?? null,
    eventCount: listVoteEventsForPromise(tenantId, promiseId).length
  };
}

export function castVote({ tenantId, promiseId, user, value, now = new Date() }: CastVoteInput) {
  const promise = getPromiseById(tenantId, promiseId);
  if (!promise) {
    throw new VoteError("NOT_FOUND", "Promise not found.", 404);
  }

  if (!canUserVote(user)) {
    throw new VoteError("FORBIDDEN", "This account is not eligible to vote yet.", 403);
  }

  const votingWindow = getVotingWindowStatusForPromise({ tenantId, promiseId, now });
  if (votingWindow.state !== "open") {
    throw new VoteError("WINDOW_CLOSED", `Voting is ${votingWindow.state} for this promise.`, 409);
  }

  const existingVote = getVoteForUser(tenantId, promiseId, user.id);
  const timestamp = now.toISOString();

  if (existingVote?.value === value) {
    return {
      summary: getPromiseVoteSummary({ tenantId, promiseId, userId: user.id }),
      event: null
    };
  }

  const voteRecord: VoteRecord = {
    tenantId,
    promiseId,
    userId: user.id,
    value,
    createdAt: existingVote?.createdAt ?? timestamp,
    updatedAt: timestamp
  };

  const eventRecord: VoteEventRecord = {
    tenantId,
    promiseId,
    userId: user.id,
    previousValue: existingVote?.value ?? null,
    newValue: value,
    eventType: existingVote ? "changed" : "created",
    createdAt: timestamp
  };

  upsertVote(voteRecord);
  appendVoteEvent(eventRecord);

  return {
    summary: getPromiseVoteSummary({ tenantId, promiseId, userId: user.id }),
    event: eventRecord
  };
}
