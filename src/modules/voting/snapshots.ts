import { listPromisesForTenant } from "@/modules/promises/repository";
import { listTenants } from "@/modules/tenants/data";
import { appendAuditLog } from "@/modules/audit/logs";
import { listVoteEventsForPromise, listVotesForPromise } from "@/modules/voting/store";

export type VoteSnapshotRecord = {
    id: string;
    tenantId: string;
    promiseId: string;
    upvotes: number;
    downvotes: number;
    score: number;
    snapshotAt: string;
    generationSource: "seed" | "worker" | "reconciliation";
};

export type VoteAggregateReconciliation = {
    tenantId: string;
    promiseId: string;
    snapshotAt: string | null;
    currentUpvotes: number;
    currentDownvotes: number;
    currentScore: number;
    snapshotUpvotes: number | null;
    snapshotDownvotes: number | null;
    snapshotScore: number | null;
    drift: {
        upvotes: number;
        downvotes: number;
        score: number;
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
        upvotes: 1,
        downvotes: 1,
        score: 0,
        snapshotAt: "2026-04-15T00:00:00.000Z",
        generationSource: "seed"
    },
    {
        id: "snapshot:tenant-tamilnadu:promise-school-meals:2026-05-01",
        tenantId: "tenant-tamilnadu",
        promiseId: "promise-school-meals",
        upvotes: 1,
        downvotes: 0,
        score: 1,
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
    const upvotes = votes.filter((vote) => vote.value === "up").length;
    const downvotes = votes.filter((vote) => vote.value === "down").length;

    return {
        upvotes,
        downvotes,
        score: upvotes - downvotes
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
            currentUpvotes: currentAggregate.upvotes,
            currentDownvotes: currentAggregate.downvotes,
            currentScore: currentAggregate.score,
            snapshotUpvotes: null,
            snapshotDownvotes: null,
            snapshotScore: null,
            drift: {
                upvotes: currentAggregate.upvotes,
                downvotes: currentAggregate.downvotes,
                score: currentAggregate.score
            },
            voteEventCount,
            status: "missing_snapshot"
        };
    }

    const drift = {
        upvotes: currentAggregate.upvotes - latestSnapshot.upvotes,
        downvotes: currentAggregate.downvotes - latestSnapshot.downvotes,
        score: currentAggregate.score - latestSnapshot.score
    };

    return {
        tenantId,
        promiseId,
        snapshotAt: latestSnapshot.snapshotAt,
        currentUpvotes: currentAggregate.upvotes,
        currentDownvotes: currentAggregate.downvotes,
        currentScore: currentAggregate.score,
        snapshotUpvotes: latestSnapshot.upvotes,
        snapshotDownvotes: latestSnapshot.downvotes,
        snapshotScore: latestSnapshot.score,
        drift,
        voteEventCount,
        status: drift.upvotes === 0 && drift.downvotes === 0 && drift.score === 0 ? "aligned" : "drift_detected"
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