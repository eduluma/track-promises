import { platformDefaults } from "@/config/defaults";
import { seedAuditLogRecords } from "@/modules/audit/logs";
import { demoUsers } from "@/modules/auth/demo-users";
import { moderationReviews as moderationReviewSeed } from "@/modules/moderation/reviews";
import { promiseRecords } from "@/modules/promises/data";
import { getTenantConfigOverride, listTenants } from "@/modules/tenants/data";
import { seedVoteSnapshots } from "@/modules/voting/snapshots";
import { seedVotes } from "@/modules/voting/store";

export function getFoundationSeedData() {
    const tenants = listTenants();
    const tenantConfigs = tenants.flatMap((tenant) => {
        const override = getTenantConfigOverride(tenant.id);

        if (!override) {
            return [];
        }

        return Object.entries(override).map(([configKey, configValue]) => ({
            id: `${tenant.id}:${configKey}`,
            tenantId: tenant.id,
            configKey,
            configValue,
            schemaVersion: 1,
            updatedBy: null as string | null
        }));
    });

    const votingWindows = tenants.map((tenant) => {
        const override = getTenantConfigOverride(tenant.id);
        const window = {
            ...platformDefaults.votingWindows,
            ...override?.votingWindows
        };

        return {
            id: `voting-window:${tenant.id}`,
            tenantId: tenant.id,
            scopeType: "tenant" as const,
            scopeId: tenant.id,
            startAt: window.defaultStartAt,
            freezeAt: window.defaultFreezeAt,
            endAt: window.defaultEndAt,
            rules: {
                voteMeaning: override?.voteMeaning ?? platformDefaults.voteMeaning
            }
        };
    });

    const sources = promiseRecords.flatMap((promise) =>
        promise.sources.map((source) => ({
            ...source,
            tenantId: promise.tenantId,
            promiseId: promise.id
        }))
    );

    const statusHistory = promiseRecords.flatMap((promise) =>
        promise.statusHistory.map((entry, index) => ({
            id: `${promise.id}:status:${index + 1}`,
            tenantId: promise.tenantId,
            promiseId: promise.id,
            previousStatus: entry.previousStatus,
            newStatus: entry.newStatus,
            changedBy: null as string | null,
            reason: entry.reason,
            sourceId: promise.sources[0]?.id ?? null,
            createdAt: entry.changedAt
        }))
    );

    const voteEvents = seedVotes.map((vote) => ({
        id: `${vote.tenantId}:${vote.promiseId}:${vote.userId}:created`,
        tenantId: vote.tenantId,
        promiseId: vote.promiseId,
        userId: vote.userId,
        previousValue: null,
        newValue: vote.value,
        eventType: "created",
        requestMetadataHash: null as string | null,
        createdAt: vote.createdAt
    }));

    return {
        tenants,
        users: demoUsers,
        tenantConfigs,
        promises: promiseRecords,
        sources,
        votingWindows,
        votes: seedVotes,
        voteEvents,
        voteSnapshots: seedVoteSnapshots(),
        statusHistory,
        moderationReviews: moderationReviewSeed,
        auditLogs: seedAuditLogRecords()
    };
}