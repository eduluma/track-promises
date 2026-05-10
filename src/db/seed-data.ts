import { platformDefaults } from "@/config/defaults";
import { seedAuditLogRecords } from "@/modules/audit/logs";
import { demoUsers } from "@/modules/auth/demo-users";
import { moderationReviews as moderationReviewSeed } from "@/modules/moderation/reviews";
import { promiseRecords } from "@/modules/promises/data";
import { getTenantConfigOverride, listTenants } from "@/modules/tenants/data";
import { listTimelinesForTenant } from "@/modules/timelines/data";
import { seedVoteSnapshots } from "@/modules/voting/snapshots";
import { seedVotes } from "@/modules/voting/store";

function toSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function parseTimelineYear(slug: string) {
    const year = Number.parseInt(slug, 10);

    return Number.isNaN(year) ? 0 : year;
}

export function getFoundationSeedData() {
    const tenants = listTenants();
    const timelines = tenants.flatMap((tenant) =>
        listTimelinesForTenant(tenant.id).map((timeline) => ({
            id: timeline.id,
            tenantId: timeline.tenantId,
            slug: timeline.slug,
            year: parseTimelineYear(timeline.slug),
            title: timeline.title,
            electionLabel: timeline.title,
            summary: timeline.summary,
            officeTitle: timeline.officeTitle,
            officeHolder: timeline.officeHolder,
            isDefault: timeline.default
        }))
    );

    const timelinesByKey = new Map(timelines.map((timeline) => [`${timeline.tenantId}:${timeline.slug}`, timeline]));

    const alliances = Array.from(
        new Map(
            promiseRecords.map((promise) => {
                const slug = toSlug(promise.personParty);

                return [
                    `${promise.tenantId}:${slug}`,
                    {
                        id: `alliance:${promise.tenantId}:${slug}`,
                        tenantId: promise.tenantId,
                        slug,
                        name: promise.personParty,
                        shortName: null as string | null,
                        allianceType: "campaign",
                        metadata: {}
                    }
                ];
            })
        ).values()
    );

    const alliancesByKey = new Map(alliances.map((alliance) => [`${alliance.tenantId}:${alliance.slug}`, alliance]));

    const timelineAlliances = Array.from(
        new Map(
            promiseRecords.map((promise) => {
                const allianceSlug = toSlug(promise.personParty);
                const timeline = timelinesByKey.get(`${promise.tenantId}:${promise.timelineSlug}`);
                const alliance = alliancesByKey.get(`${promise.tenantId}:${allianceSlug}`);

                if (!timeline || !alliance) {
                    throw new Error(`Unable to derive timeline alliance for promise ${promise.id}.`);
                }

                return [
                    `${timeline.id}:${alliance.id}`,
                    {
                        id: `timeline-alliance:${timeline.id}:${alliance.slug}`,
                        tenantId: promise.tenantId,
                        timelineId: timeline.id,
                        allianceId: alliance.id,
                        ballotLabel: promise.personParty,
                        manifestoUrl: promise.sources[0]?.url ?? null,
                        notes: `Derived from seeded promise records for ${timeline.title}.`
                    }
                ];
            })
        ).values()
    );

    const timelineAlliancesByKey = new Map(
        timelineAlliances.map((timelineAlliance) => [`${timelineAlliance.timelineId}:${timelineAlliance.ballotLabel}`, timelineAlliance])
    );

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
        timelines,
        alliances,
        timelineAlliances,
        tenantConfigs,
        promises: promiseRecords.map((promise) => {
            const timeline = timelinesByKey.get(`${promise.tenantId}:${promise.timelineSlug}`);

            if (!timeline) {
                throw new Error(`Unable to find timeline ${promise.timelineSlug} for promise ${promise.id}.`);
            }

            const timelineAlliance = timelineAlliancesByKey.get(`${timeline.id}:${promise.personParty}`);

            if (!timelineAlliance) {
                throw new Error(`Unable to find timeline alliance for promise ${promise.id}.`);
            }

            return {
                ...promise,
                timelineId: timeline.id,
                timelineAllianceId: timelineAlliance.id
            };
        }),
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