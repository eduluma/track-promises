import type { VoteValue } from "@/modules/voting/assessment";

export type VoteRecord = {
  tenantId: string;
  promiseId: string;
  userId: string;
  value: VoteValue;
  createdAt: string;
  updatedAt: string;
};

export type VoteEventRecord = {
  tenantId: string;
  promiseId: string;
  userId: string;
  previousValue: VoteValue | null;
  newValue: VoteValue;
  eventType: "created" | "changed";
  createdAt: string;
};

type VoteStore = {
  votes: Map<string, VoteRecord>;
  events: VoteEventRecord[];
};

const seedVotes: VoteRecord[] = [
  {
    tenantId: "tenant-tamilnadu",
    promiseId: "promise-power",
    userId: "demo-user",
    value: "in_progress",
    createdAt: "2026-04-13T00:00:00.000Z",
    updatedAt: "2026-04-13T00:00:00.000Z"
  },
  {
    tenantId: "tenant-tamilnadu",
    promiseId: "promise-power",
    userId: "observer-1",
    value: "started",
    createdAt: "2026-04-13T00:00:00.000Z",
    updatedAt: "2026-04-13T00:00:00.000Z"
  },
  {
    tenantId: "tenant-tamilnadu",
    promiseId: "promise-school-meals",
    userId: "observer-2",
    value: "completed",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  }
];

export { seedVotes };

function keyForVote(vote: Pick<VoteRecord, "tenantId" | "promiseId" | "userId">) {
  return `${vote.tenantId}:${vote.promiseId}:${vote.userId}`;
}

function createInitialStore(): VoteStore {
  return {
    votes: new Map(seedVotes.map((vote) => [keyForVote(vote), vote])),
    events: seedVotes.map((vote) => ({
      tenantId: vote.tenantId,
      promiseId: vote.promiseId,
      userId: vote.userId,
      previousValue: null,
      newValue: vote.value,
      eventType: "created",
      createdAt: vote.createdAt
    }))
  };
}

const globalForVotes = globalThis as typeof globalThis & {
  __trackPromisesVoteStore?: VoteStore;
};

export function getVoteStore() {
  if (!globalForVotes.__trackPromisesVoteStore) {
    globalForVotes.__trackPromisesVoteStore = createInitialStore();
  }

  return globalForVotes.__trackPromisesVoteStore;
}

export function upsertVote(record: VoteRecord) {
  const store = getVoteStore();
  store.votes.set(keyForVote(record), record);
}

export function appendVoteEvent(record: VoteEventRecord) {
  const store = getVoteStore();
  store.events.push(record);
}

export function listVotesForPromise(tenantId: string, promiseId: string) {
  return Array.from(getVoteStore().votes.values()).filter(
    (vote) => vote.tenantId === tenantId && vote.promiseId === promiseId
  );
}

export function getVoteForUser(tenantId: string, promiseId: string, userId: string) {
  return getVoteStore().votes.get(keyForVote({ tenantId, promiseId, userId })) ?? null;
}

export function listVoteEventsForPromise(tenantId: string, promiseId: string) {
  return getVoteStore().events.filter((event) => event.tenantId === tenantId && event.promiseId === promiseId);
}
