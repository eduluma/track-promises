import { promiseRecords } from "@/modules/promises/data";
import { getPromiseVoteSummary } from "@/modules/voting/service";
import type { PromiseStatus } from "@/config/schemas";

type PromiseFilters = {
  userId?: string | null;
  category?: string | null;
  status?: PromiseStatus | null;
};

type CreatePromiseInput = {
  tenantId: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  election: string;
  personParty: string;
  status: PromiseStatus;
  actorId: string;
};

export function listPromisesForTenant(tenantId: string, filters: PromiseFilters = {}) {
  return promiseRecords
    .filter((promise) => promise.tenantId === tenantId)
    .filter((promise) => (filters.category ? promise.category === filters.category : true))
    .filter((promise) => (filters.status ? promise.status === filters.status : true))
    .map((promise) => ({
      ...promise,
      voteSummary: getPromiseVoteSummary({ tenantId, promiseId: promise.id, userId: filters.userId ?? null })
    }));
}

export function getPromiseById(tenantId: string, promiseId: string) {
  return promiseRecords.find((promise) => promise.tenantId === tenantId && promise.id === promiseId) ?? null;
}

export function createPromise(input: CreatePromiseInput) {
  const timestamp = new Date().toISOString();
  const id = `promise-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;
  const promise = {
    id,
    tenantId: input.tenantId,
    title: input.title,
    description: input.description,
    category: input.category,
    jurisdiction: input.jurisdiction,
    election: input.election,
    personParty: input.personParty,
    status: input.status,
    createdAt: timestamp,
    updatedAt: timestamp,
    sources: [],
    statusHistory: [
      {
        previousStatus: null,
        newStatus: input.status,
        reason: `Promise created by ${input.actorId}.`,
        changedAt: timestamp
      }
    ]
  };

  promiseRecords.unshift(promise);
  return promise;
}
