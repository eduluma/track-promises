import { promiseRecords } from "@/modules/promises/data";
import { getPromiseVoteSummary } from "@/modules/voting/service";

export function listPromisesForTenant(tenantId: string) {
  return promiseRecords
    .filter((promise) => promise.tenantId === tenantId)
    .map((promise) => ({
      ...promise,
      voteSummary: getPromiseVoteSummary({ tenantId, promiseId: promise.id, userId: "demo-user" })
    }));
}

export function getPromiseById(tenantId: string, promiseId: string) {
  return promiseRecords.find((promise) => promise.tenantId === tenantId && promise.id === promiseId) ?? null;
}
