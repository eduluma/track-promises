import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";

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
    const force = process.argv.includes("--force");
    const db = createDbClient();
    const data = getFoundationSeedData();

    if (force) {
        console.log("--force: wiping all tables before seeding.");
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
    }

    await db.insert(tenants).values(
        data.tenants.map((tenant) => ({
            ...tenant,
            defaultLocale: tenant.defaultLocale
        }))
    ).onConflictDoNothing();

    const seededUserRows = data.users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        passwordHash: hashSync(user.password, 12),
        emailVerified: user.emailVerified,
        state: user.state,
        role: user.role,
        trustScore: user.trustScore,
        createdAt: toDate(user.createdAt),
        updatedAt: toDate(user.createdAt)
    }));

    if (seededUserRows.length > 0) {
        await db.insert(users).values(seededUserRows).onConflictDoNothing();

        await Promise.all(
            seededUserRows.map((user) =>
                db
                    .update(users)
                    .set({
                        email: user.email,
                        displayName: user.displayName,
                        passwordHash: user.passwordHash,
                        emailVerified: user.emailVerified,
                        state: user.state,
                        role: user.role,
                        trustScore: user.trustScore,
                        createdAt: user.createdAt,
                        updatedAt: new Date()
                    })
                    .where(eq(users.id, user.id))
            )
        );
    }

    if (data.tenantConfigs.length > 0) {
        await db.insert(tenantConfigs).values(data.tenantConfigs).onConflictDoNothing();
    }

    if (data.timelines.length > 0) {
        await db.insert(timelines).values(data.timelines).onConflictDoNothing();
    }

    if (data.alliances.length > 0) {
        await db.insert(alliances).values(data.alliances).onConflictDoNothing();
    }

    if (data.timelineAlliances.length > 0) {
        await db.insert(timelineAlliances).values(data.timelineAlliances).onConflictDoNothing();
    }

    await db.insert(promises).values(
        data.promises.map((promise) => ({
            ...promise,
            createdBy: null,
            createdAt: toDate(promise.createdAt),
            updatedAt: toDate(promise.updatedAt)
        }))
    ).onConflictDoNothing();

    await db.insert(promiseSources).values(
        data.sources.map((source) => ({
            ...source,
            capturedAt: toDate(source.capturedAt)
        }))
    ).onConflictDoNothing();

    await db.insert(votingWindows).values(
        data.votingWindows.map((window) => ({
            ...window,
            startAt: toDate(window.startAt),
            freezeAt: toDate(window.freezeAt),
            endAt: toDate(window.endAt)
        }))
    ).onConflictDoNothing();

    if (data.votes.length > 0) {
        await db.insert(votes).values(
            data.votes.map((vote) => ({
                id: `${vote.tenantId}:${vote.promiseId}:${vote.userId}`,
                ...vote,
                createdAt: toDate(vote.createdAt),
                updatedAt: toDate(vote.updatedAt)
            }))
        ).onConflictDoNothing();
    }

    if (data.voteEvents.length > 0) {
        await db.insert(voteEvents).values(
            data.voteEvents.map((event) => ({
                ...event,
                createdAt: toDate(event.createdAt)
            }))
        ).onConflictDoNothing();
    }

    if (data.voteSnapshots.length > 0) {
        await db.insert(voteSnapshots).values(
            data.voteSnapshots.map((snapshot) => ({
                ...snapshot,
                snapshotAt: toDate(snapshot.snapshotAt)
            }))
        ).onConflictDoNothing();
    }

    if (data.statusHistory.length > 0) {
        await db.insert(promiseStatusHistory).values(
            data.statusHistory.map((entry) => ({
                ...entry,
                createdAt: toDate(entry.createdAt)
            }))
        ).onConflictDoNothing();
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
        ).onConflictDoNothing();
    }

    if (data.auditLogs.length > 0) {
        await db.insert(auditLogs).values(
            data.auditLogs.map((log) => ({
                ...log,
                createdAt: toDate(log.createdAt)
            }))
        ).onConflictDoNothing();
    }

    const mode = force ? " (forced wipe + reload)" : " (safe upsert — existing data preserved)";
    console.log(`Seeded ${data.tenants.length} tenants, ${data.promises.length} promises, and ${data.users.length} seed users.${mode}`);
}

seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });