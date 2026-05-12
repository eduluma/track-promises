import { getRecentElectionOverview, promiseRecords, type PromiseDeliveryPlan, type PromiseSource } from "@/modules/promises/data";
import { getPromiseVoteSummary } from "@/modules/voting/service";
import type { PromiseStatus } from "@/config/schemas";
import { appendAuditLog } from "@/modules/audit/logs";

type PromiseFilters = {
  userId?: string | null;
  timelineSlug?: string | null;
  category?: string | null;
  status?: PromiseStatus | null;
};

type CreatePromiseInput = {
  tenantId: string;
  timelineSlug: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  election: string;
  personParty: string;
  status: PromiseStatus;
  deliveryPlan?: PromiseDeliveryPlan;
  sources?: CreatePromiseSourceInput[];
  actorId: string;
};

type CreatePromiseSourceInput = Pick<PromiseSource, "url" | "publisher" | "excerpt"> &
  Partial<Pick<PromiseSource, "capturedAt" | "verificationStatus">>;

export async function listPromisesForTenant(tenantId: string, filters: PromiseFilters = {}) {
  const filtered = promiseRecords
    .filter((promise) => promise.tenantId === tenantId)
    .filter((promise) => (filters.timelineSlug ? promise.timelineSlug === filters.timelineSlug : true))
    .filter((promise) => (filters.category ? promise.category === filters.category : true))
    .filter((promise) => (filters.status ? promise.status === filters.status : true));

  const withSummaries = await Promise.all(
    filtered.map(async (promise) => ({
      ...promise,
      voteSummary: await getPromiseVoteSummary({ tenantId, promiseId: promise.id, userId: filters.userId ?? null })
    }))
  );

  return withSummaries;
}

export function getPromiseById(tenantId: string, promiseId: string, timelineSlug?: string | null) {
  return (
    promiseRecords.find(
      (promise) =>
        promise.tenantId === tenantId &&
        promise.id === promiseId &&
        (timelineSlug ? promise.timelineSlug === timelineSlug : true)
    ) ?? null
  );
}

export function getRecentElectionOverviewForTimeline(tenantId: string, timelineSlug: string) {
  return getRecentElectionOverview(tenantId, timelineSlug);
}

export async function createPromise(input: CreatePromiseInput) {
  const timestamp = new Date().toISOString();
  const id = `promise-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;
  const sources = (input.sources ?? []).map((source, index) => ({
    id: `${id}-source-${index + 1}`,
    url: source.url,
    publisher: source.publisher,
    excerpt: source.excerpt,
    capturedAt: source.capturedAt ?? timestamp,
    verificationStatus: source.verificationStatus ?? "pending"
  }));
  const promise = {
    id,
    tenantId: input.tenantId,
    timelineSlug: input.timelineSlug,
    title: input.title,
    description: input.description,
    category: input.category,
    jurisdiction: input.jurisdiction,
    election: input.election,
    personParty: input.personParty,
    status: input.status,
    deliveryPlan: input.deliveryPlan,
    createdAt: timestamp,
    updatedAt: timestamp,
    sources,
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

  await appendAuditLog({
    tenantId: input.tenantId,
    actorId: input.actorId,
    action: "promise.created",
    entityType: "promise",
    entityId: id,
    metadata: {
      status: input.status,
      category: input.category,
      election: input.election,
      timelineSlug: input.timelineSlug,
      sourceCount: sources.length
    },
    createdAt: timestamp
  });

  return promise;
}
