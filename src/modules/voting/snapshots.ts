import { listPromisesForTenant } from "@/modules/promises/repository";
import { listTenants } from "@/modules/tenants/data";
import { appendAuditLog } from "@/modules/audit/logs";
import { getVoteOption } from "@/modules/voting/assessment";
import { listVoteEventsForPromise, listVotesForPromise } from "@/modules/voting/store";

export type VoteSnapshotRecord = {
    id: string;
    tenantId: string;
    promiseId: string;
    totalVotes: number;
    completionPercent: number;
    snapshotAt: string;
    generationSource: "seed" | "worker" | "reconciliation";
};

export type VoteAggregateReconciliation = {
    tenantId: string;
    promiseId: string;
    snapshotAt: string | null;
    currentTotalVotes: number;
    currentCompletionPercent: number;
    snapshotTotalVotes: number | null;
    snapshotCompletionPercent: number | null;
    drift: {
        totalVotes: number;
        completionPercent: number;
    };
    voteEventCount: number;
    status: "aligned" | "drift_detected" | "missing_snapshot";
};

type VoteSnapshotStore = {
    records: VoteSnapshotRecord[];
};

const seedSnapshots: VoteSnapshotRecord[] = [
    {
        id: "snapshot:tenant-tamilnadu:promise-power:2026-04-15",
        tenantId: "tenant-tamilnadu",
        promiseId: "promise-power",
        totalVotes: 2,
        completionPercent: 38,
        snapshotAt: "2026-04-15T00:00:00.000Z",
        generationSource: "seed"
    },
    {
        id: "snapshot:tenant-tamilnadu:promise-school-meals:2026-05-01",
        tenantId: "tenant-tamilnadu",
        promiseId: "promise-school-meals",
        totalVotes: 1,
        completionPercent: 100,
        snapshotAt: "2026-05-01T00:00:00.000Z",
        generationSource: "seed"
    }
];

const globalForSnapshots = globalThis as typeof globalThis & {
    __trackPromisesVoteSnapshotStore?: VoteSnapshotStore;
};

function createInitialStore(): VoteSnapshotStore {
    return {
        records: [...seedSnapshots]
    };
}

function createSnapshotId(tenantId: string, promiseId: string, snapshotAt: string) {
    return `snapshot:${tenantId}:${promiseId}:${snapshotAt}`;
}

function computeVoteAggregate(tenantId: string, promiseId: string) {
    const votes = listVotesForPromise(tenantId, promiseId);
    const totalVotes = votes.length;
    const weightedTotal = votes.reduce((total, vote) => total + getVoteOption(vote.value).weight, 0);

    return {
        totalVotes,
        completionPercent: totalVotes === 0 ? 0 : Math.round(weightedTotal / totalVotes)
    };
}

export function getVoteSnapshotStore() {
    if (!globalForSnapshots.__trackPromisesVoteSnapshotStore) {
        globalForSnapshots.__trackPromisesVoteSnapshotStore = createInitialStore();
    }

    return globalForSnapshots.__trackPromisesVoteSnapshotStore;
}

export function listVoteSnapshotsForPromise(tenantId: string, promiseId: string) {
    return getVoteSnapshotStore()
        .records.filter((record) => record.tenantId === tenantId && record.promiseId === promiseId)
        .sort((left, right) => left.snapshotAt.localeCompare(right.snapshotAt));
}

export function captureVoteSnapshotForPromise({
    tenantId,
    promiseId,
    snapshotAt = new Date().toISOString(),
    generationSource = "worker"
}: {
    tenantId: string;
    promiseId: string;
    snapshotAt?: string;
    generationSource?: VoteSnapshotRecord["generationSource"];
}) {
    const aggregate = computeVoteAggregate(tenantId, promiseId);
    const record: VoteSnapshotRecord = {
        id: createSnapshotId(tenantId, promiseId, snapshotAt),
        tenantId,
        promiseId,
        snapshotAt,
        generationSource,
        ...aggregate
    };

    getVoteSnapshotStore().records.push(record);

    appendAuditLog({
        tenantId,
        actorId: null,
        action: "votes.snapshot_captured",
        entityType: "promise",
        entityId: promiseId,
        metadata: {
            snapshotAt,
            aggregate,
            generationSource
        },
        createdAt: snapshotAt
    });

    return record;
}

export function captureVoteSnapshotsForTenant(tenantId: string, snapshotAt = new Date().toISOString()) {
    return listPromisesForTenant(tenantId).map((promise) =>
        captureVoteSnapshotForPromise({
            tenantId,
            promiseId: promise.id,
            snapshotAt,
            generationSource: "worker"
        })
    );
}

export function captureVoteSnapshotsForAllTenants(snapshotAt = new Date().toISOString()) {
    return listTenants().flatMap((tenant) => captureVoteSnapshotsForTenant(tenant.id, snapshotAt));
}

export function reconcileVoteAggregateForPromise(tenantId: string, promiseId: string): VoteAggregateReconciliation {
    const currentAggregate = computeVoteAggregate(tenantId, promiseId);
    const snapshots = listVoteSnapshotsForPromise(tenantId, promiseId);
    const latestSnapshot = snapshots.at(-1) ?? null;
    const voteEventCount = listVoteEventsForPromise(tenantId, promiseId).length;

    if (!latestSnapshot) {
        return {
            tenantId,
            promiseId,
            snapshotAt: null,
            currentTotalVotes: currentAggregate.totalVotes,
            currentCompletionPercent: currentAggregate.completionPercent,
            snapshotTotalVotes: null,
            snapshotCompletionPercent: null,
            drift: {
                totalVotes: currentAggregate.totalVotes,
                completionPercent: currentAggregate.completionPercent
            },
            voteEventCount,
            status: "missing_snapshot"
        };
    }

    const drift = {
        totalVotes: currentAggregate.totalVotes - latestSnapshot.totalVotes,
        completionPercent: currentAggregate.completionPercent - latestSnapshot.completionPercent
    };

    return {
        tenantId,
        promiseId,
        snapshotAt: latestSnapshot.snapshotAt,
        currentTotalVotes: currentAggregate.totalVotes,
        currentCompletionPercent: currentAggregate.completionPercent,
        snapshotTotalVotes: latestSnapshot.totalVotes,
        snapshotCompletionPercent: latestSnapshot.completionPercent,
        drift,
        voteEventCount,
        status: drift.totalVotes === 0 && drift.completionPercent === 0 ? "aligned" : "drift_detected"
    };
}

export function reconcileVoteAggregatesForTenant(tenantId: string) {
    return listPromisesForTenant(tenantId).map((promise) => reconcileVoteAggregateForPromise(tenantId, promise.id));
}

export function reconcileVoteAggregatesForAllTenants() {
    const reconciliations = listTenants().flatMap((tenant) => reconcileVoteAggregatesForTenant(tenant.id));

    const createdAt = new Date().toISOString();
    appendAuditLog({
        tenantId: null,
        actorId: null,
        action: "votes.reconciliation_completed",
        entityType: "system",
        entityId: "vote-aggregates",
        metadata: {
            reconciledPromises: reconciliations.length,
            driftedPromises: reconciliations.filter((item) => item.status === "drift_detected").length,
            missingSnapshots: reconciliations.filter((item) => item.status === "missing_snapshot").length
        },
        createdAt
    });

    return reconciliations;
}

export function seedVoteSnapshots() {
    return seedSnapshots;
}