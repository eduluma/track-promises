import { and, eq } from "drizzle-orm";

import { createDbClient } from "@/db/client";
import { voteSnapshots } from "@/db/schema";
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

function createSnapshotId(tenantId: string, promiseId: string, snapshotAt: string) {
    return `snapshot:${tenantId}:${promiseId}:${snapshotAt}`;
}

async function computeVoteAggregate(tenantId: string, promiseId: string) {
    const votes = await listVotesForPromise(tenantId, promiseId);
    const totalVotes = votes.length;
    const weightedTotal = votes.reduce((total, vote) => total + getVoteOption(vote.value).weight, 0);

    return {
        totalVotes,
        completionPercent: totalVotes === 0 ? 0 : Math.round(weightedTotal / totalVotes)
    };
}

export async function listVoteSnapshotsForPromise(tenantId: string, promiseId: string): Promise<VoteSnapshotRecord[]> {
    const db = createDbClient();
    const rows = await db
        .select()
        .from(voteSnapshots)
        .where(and(eq(voteSnapshots.tenantId, tenantId), eq(voteSnapshots.promiseId, promiseId)));

    return rows
        .map((row) => ({
            id: row.id,
            tenantId: row.tenantId,
            promiseId: row.promiseId,
            totalVotes: row.totalVotes,
            completionPercent: row.completionPercent,
            snapshotAt: row.snapshotAt.toISOString(),
            generationSource: row.generationSource as VoteSnapshotRecord["generationSource"]
        }))
        .sort((a, b) => a.snapshotAt.localeCompare(b.snapshotAt));
}

export async function captureVoteSnapshotForPromise({
    tenantId,
    promiseId,
    snapshotAt = new Date().toISOString(),
    generationSource = "worker"
}: {
    tenantId: string;
    promiseId: string;
    snapshotAt?: string;
    generationSource?: VoteSnapshotRecord["generationSource"];
}): Promise<VoteSnapshotRecord> {
    const aggregate = await computeVoteAggregate(tenantId, promiseId);
    const id = createSnapshotId(tenantId, promiseId, snapshotAt);
    const record: VoteSnapshotRecord = {
        id,
        tenantId,
        promiseId,
        snapshotAt,
        generationSource,
        ...aggregate
    };

    const db = createDbClient();
    await db
        .insert(voteSnapshots)
        .values({
            id,
            tenantId,
            promiseId,
            totalVotes: aggregate.totalVotes,
            completionPercent: aggregate.completionPercent,
            snapshotAt: new Date(snapshotAt),
            generationSource
        })
        .onConflictDoUpdate({
            target: [voteSnapshots.id],
            set: {
                totalVotes: aggregate.totalVotes,
                completionPercent: aggregate.completionPercent
            }
        });

    await appendAuditLog({
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

export async function captureVoteSnapshotsForTenant(tenantId: string, snapshotAt = new Date().toISOString()): Promise<VoteSnapshotRecord[]> {
    const promises = await listPromisesForTenant(tenantId);
    const results: VoteSnapshotRecord[] = [];
    for (const promise of promises) {
        results.push(await captureVoteSnapshotForPromise({ tenantId, promiseId: promise.id, snapshotAt, generationSource: "worker" }));
    }
    return results;
}

export async function captureVoteSnapshotsForAllTenants(snapshotAt = new Date().toISOString()): Promise<VoteSnapshotRecord[]> {
    const results: VoteSnapshotRecord[] = [];
    for (const tenant of listTenants()) {
        const tenantResults = await captureVoteSnapshotsForTenant(tenant.id, snapshotAt);
        results.push(...tenantResults);
    }
    return results;
}

export async function reconcileVoteAggregateForPromise(tenantId: string, promiseId: string): Promise<VoteAggregateReconciliation> {
    const [currentAggregate, snapshots, events] = await Promise.all([
        computeVoteAggregate(tenantId, promiseId),
        listVoteSnapshotsForPromise(tenantId, promiseId),
        listVoteEventsForPromise(tenantId, promiseId)
    ]);
    const latestSnapshot = snapshots.at(-1) ?? null;
    const voteEventCount = events.length;

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

export async function reconcileVoteAggregatesForTenant(tenantId: string): Promise<VoteAggregateReconciliation[]> {
    const promises = await listPromisesForTenant(tenantId);
    return Promise.all(promises.map((p) => reconcileVoteAggregateForPromise(tenantId, p.id)));
}

export async function reconcileVoteAggregatesForAllTenants(): Promise<VoteAggregateReconciliation[]> {
    const results: VoteAggregateReconciliation[] = [];
    for (const tenant of listTenants()) {
        const r = await reconcileVoteAggregatesForTenant(tenant.id);
        results.push(...r);
    }

    const createdAt = new Date().toISOString();
    await appendAuditLog({
        tenantId: null,
        actorId: null,
        action: "votes.reconciliation_completed",
        entityType: "system",
        entityId: "vote-aggregates",
        metadata: {
            reconciledPromises: results.length,
            driftedPromises: results.filter((item) => item.status === "drift_detected").length,
            missingSnapshots: results.filter((item) => item.status === "missing_snapshot").length
        },
        createdAt
    });

    return results;
}

// Kept for backwards-compat — seed no longer needs snapshots seeded in-memory
export function seedVoteSnapshots(): VoteSnapshotRecord[] {
    return [];
}

// Unused type kept to avoid import errors in workers that may reference it
export type { VoteSnapshotStore };