import { getFoundationSeedData } from "@/db/seed-data";
import { createDbClient } from "@/db/client";
import {
    alliances,
    auditLogs,
    moderationReviews,
    promiseSources,
    promiseStatusHistory,
    promises,
    tenantConfigs,
    tenants,
    timelineAlliances,
    timelines,
    users,
    voteEvents,
    voteSnapshots,
    votes,
    votingWindows
} from "@/db/schema";

function toDate(value: string) {
    return new Date(value);
}

async function seed() {
    const db = createDbClient();
    const data = getFoundationSeedData();

    await db.delete(auditLogs);
    await db.delete(moderationReviews);
    await db.delete(voteSnapshots);
    await db.delete(voteEvents);
    await db.delete(votes);
    await db.delete(promiseStatusHistory);
    await db.delete(promiseSources);
    await db.delete(promises);
    await db.delete(timelineAlliances);
    await db.delete(alliances);
    await db.delete(timelines);
    await db.delete(votingWindows);
    await db.delete(tenantConfigs);
    await db.delete(users);
    await db.delete(tenants);

    await db.insert(tenants).values(
        data.tenants.map((tenant) => ({
            ...tenant,
            defaultLocale: "en"
        }))
    );

    await db.insert(users).values(
        data.users.map((user) => ({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            passwordHash: user.password,
            emailVerified: user.emailVerified,
            state: user.state,
            role: user.role,
            trustScore: user.trustScore
        }))
    );

    if (data.tenantConfigs.length > 0) {
        await db.insert(tenantConfigs).values(data.tenantConfigs);
    }

    if (data.timelines.length > 0) {
        await db.insert(timelines).values(data.timelines);
    }

    if (data.alliances.length > 0) {
        await db.insert(alliances).values(data.alliances);
    }

    if (data.timelineAlliances.length > 0) {
        await db.insert(timelineAlliances).values(data.timelineAlliances);
    }

    await db.insert(promises).values(
        data.promises.map((promise) => ({
            ...promise,
            createdBy: null,
            createdAt: toDate(promise.createdAt),
            updatedAt: toDate(promise.updatedAt)
        }))
    );

    await db.insert(promiseSources).values(
        data.sources.map((source) => ({
            ...source,
            capturedAt: toDate(source.capturedAt)
        }))
    );

    await db.insert(votingWindows).values(
        data.votingWindows.map((window) => ({
            ...window,
            startAt: toDate(window.startAt),
            freezeAt: toDate(window.freezeAt),
            endAt: toDate(window.endAt)
        }))
    );

    if (data.votes.length > 0) {
        await db.insert(votes).values(
            data.votes.map((vote) => ({
                id: `${vote.tenantId}:${vote.promiseId}:${vote.userId}`,
                ...vote,
                createdAt: toDate(vote.createdAt),
                updatedAt: toDate(vote.updatedAt)
            }))
        );
    }

    if (data.voteEvents.length > 0) {
        await db.insert(voteEvents).values(
            data.voteEvents.map((event) => ({
                ...event,
                createdAt: toDate(event.createdAt)
            }))
        );
    }

    if (data.voteSnapshots.length > 0) {
        await db.insert(voteSnapshots).values(
            data.voteSnapshots.map((snapshot) => ({
                ...snapshot,
                snapshotAt: toDate(snapshot.snapshotAt)
            }))
        );
    }

    if (data.statusHistory.length > 0) {
        await db.insert(promiseStatusHistory).values(
            data.statusHistory.map((entry) => ({
                ...entry,
                createdAt: toDate(entry.createdAt)
            }))
        );
    }

    if (data.moderationReviews.length > 0) {
        await db.insert(moderationReviews).values(
            data.moderationReviews.map((review) => ({
                ...review,
                status: review.status,
                assignedModeratorId: review.assignedModeratorId,
                decision: review.decision,
                metadata: review.metadata,
                createdAt: toDate(review.createdAt),
                updatedAt: toDate(review.updatedAt)
            }))
        );
    }

    if (data.auditLogs.length > 0) {
        await db.insert(auditLogs).values(
            data.auditLogs.map((log) => ({
                ...log,
                createdAt: toDate(log.createdAt)
            }))
        );
    }

    console.log(`Seeded ${data.tenants.length} tenants, ${data.promises.length} promises, and ${data.users.length} users.`);
}

seed().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});