import { and, count, desc, ilike, ne, or, sql } from "drizzle-orm";

import { runQuery } from "@/db/client";
import { auditLogs, moderationReviews, promises, users, votes } from "@/db/schema";
import type { AccountState, UserRole } from "@/lib/permissions";
import { listTenants } from "@/modules/tenants/data";

const REGISTERED_USER_ROLES: Exclude<UserRole, "guest">[] = ["user", "promise_editor", "moderator", "tenant_admin", "platform_admin"];
const REGISTERED_USER_STATES: AccountState[] = ["unverified", "verified", "readonly", "suspended", "moderator_approved"];

export type AdminUserSearchResult = {
    id: string;
    email: string;
    phone: string | null;
    displayName: string;
    role: Exclude<UserRole, "guest">;
    state: AccountState;
    trustScore: number;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AdminTenantSummary = {
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    promiseCount: number;
    voteCount: number;
    distinctVoterCount: number;
    openModerationCount: number;
    resolvedModerationCount: number;
    auditLogCount: number;
    latestActivityAt: string | null;
};

export type AdminReportSummary = {
    totalUsers: number;
    recentUsers: number;
    stateCounts: Record<AccountState, number>;
    roleCounts: Record<Exclude<UserRole, "guest">, number>;
    tenantSummaries: AdminTenantSummary[];
};

function toNumber(value: unknown): number {
    return Number(value ?? 0);
}

function normalizeTimestamp(value: unknown): string | null {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (typeof value === "string") {
        return new Date(value).toISOString();
    }

    return null;
}

function resolveLatestTimestamp(...values: Array<string | null>) {
    return values.reduce<string | null>((latest, current) => {
        if (!current) {
            return latest;
        }

        if (!latest) {
            return current;
        }

        return new Date(current).getTime() > new Date(latest).getTime() ? current : latest;
    }, null);
}

export async function getAdminReportSummary(): Promise<AdminReportSummary> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

    return runQuery(async (db) => {
        const [
            [totalUsersRow],
            [recentUsersRow],
            stateRows,
            roleRows,
            promiseRows,
            voteRows,
            moderationRows,
            auditRows
        ] = await Promise.all([
            db.select({ value: count() }).from(users).where(ne(users.role, "guest")),
            db.select({ value: count() }).from(users).where(and(ne(users.role, "guest"), sql`${users.createdAt} >= ${thirtyDaysAgoIso}`)),
            db
                .select({ state: users.state, value: count() })
                .from(users)
                .where(ne(users.role, "guest"))
                .groupBy(users.state),
            db
                .select({ role: users.role, value: count() })
                .from(users)
                .where(ne(users.role, "guest"))
                .groupBy(users.role),
            db
                .select({
                    tenantId: promises.tenantId,
                    promiseCount: count(),
                    latestPromiseAt: sql<Date | string | null>`max(${promises.updatedAt})`
                })
                .from(promises)
                .groupBy(promises.tenantId),
            db
                .select({
                    tenantId: votes.tenantId,
                    voteCount: count(),
                    distinctVoterCount: sql<number>`count(distinct ${votes.userId})`,
                    latestVoteAt: sql<Date | string | null>`max(${votes.updatedAt})`
                })
                .from(votes)
                .groupBy(votes.tenantId),
            db
                .select({
                    tenantId: moderationReviews.tenantId,
                    openModerationCount: sql<number>`count(*) filter (where ${moderationReviews.status} <> 'resolved')`,
                    resolvedModerationCount: sql<number>`count(*) filter (where ${moderationReviews.status} = 'resolved')`,
                    latestReviewAt: sql<Date | string | null>`max(${moderationReviews.updatedAt})`
                })
                .from(moderationReviews)
                .groupBy(moderationReviews.tenantId),
            db
                .select({
                    tenantId: auditLogs.tenantId,
                    auditLogCount: count(),
                    latestAuditAt: sql<Date | string | null>`max(${auditLogs.createdAt})`
                })
                .from(auditLogs)
                .where(sql`${auditLogs.tenantId} is not null`)
                .groupBy(auditLogs.tenantId)
        ]);

        const stateCounts = Object.fromEntries(
            REGISTERED_USER_STATES.map((state) => [state, 0])
        ) as Record<AccountState, number>;

        for (const row of stateRows) {
            stateCounts[row.state as AccountState] = toNumber(row.value);
        }

        const roleCounts = Object.fromEntries(
            REGISTERED_USER_ROLES.map((role) => [role, 0])
        ) as Record<Exclude<UserRole, "guest">, number>;

        for (const row of roleRows) {
            if (row.role !== "guest") {
                roleCounts[row.role as Exclude<UserRole, "guest">] = toNumber(row.value);
            }
        }

        const promiseByTenant = new Map(
            promiseRows.map((row) => [
                row.tenantId,
                {
                    promiseCount: toNumber(row.promiseCount),
                    latestPromiseAt: normalizeTimestamp(row.latestPromiseAt)
                }
            ])
        );

        const votesByTenant = new Map(
            voteRows.map((row) => [
                row.tenantId,
                {
                    voteCount: toNumber(row.voteCount),
                    distinctVoterCount: toNumber(row.distinctVoterCount),
                    latestVoteAt: normalizeTimestamp(row.latestVoteAt)
                }
            ])
        );

        const moderationByTenant = new Map(
            moderationRows.map((row) => [
                row.tenantId,
                {
                    openModerationCount: toNumber(row.openModerationCount),
                    resolvedModerationCount: toNumber(row.resolvedModerationCount),
                    latestReviewAt: normalizeTimestamp(row.latestReviewAt)
                }
            ])
        );

        const auditByTenant = new Map(
            auditRows
                .filter((row) => typeof row.tenantId === "string")
                .map((row) => [
                    row.tenantId as string,
                    {
                        auditLogCount: toNumber(row.auditLogCount),
                        latestAuditAt: normalizeTimestamp(row.latestAuditAt)
                    }
                ])
        );

        const tenantSummaries = listTenants()
            .map((tenant) => {
                const promiseSummary = promiseByTenant.get(tenant.id);
                const voteSummary = votesByTenant.get(tenant.id);
                const moderationSummary = moderationByTenant.get(tenant.id);
                const auditSummary = auditByTenant.get(tenant.id);

                return {
                    tenantId: tenant.id,
                    tenantName: tenant.name,
                    tenantSlug: tenant.slug,
                    promiseCount: promiseSummary?.promiseCount ?? 0,
                    voteCount: voteSummary?.voteCount ?? 0,
                    distinctVoterCount: voteSummary?.distinctVoterCount ?? 0,
                    openModerationCount: moderationSummary?.openModerationCount ?? 0,
                    resolvedModerationCount: moderationSummary?.resolvedModerationCount ?? 0,
                    auditLogCount: auditSummary?.auditLogCount ?? 0,
                    latestActivityAt: resolveLatestTimestamp(
                        promiseSummary?.latestPromiseAt ?? null,
                        voteSummary?.latestVoteAt ?? null,
                        moderationSummary?.latestReviewAt ?? null,
                        auditSummary?.latestAuditAt ?? null
                    )
                };
            })
            .sort((left, right) => right.voteCount - left.voteCount || right.promiseCount - left.promiseCount || left.tenantName.localeCompare(right.tenantName));

        return {
            totalUsers: toNumber(totalUsersRow?.value),
            recentUsers: toNumber(recentUsersRow?.value),
            stateCounts,
            roleCounts,
            tenantSummaries
        };
    });
}

export async function searchAdminUsers(query: string, limit = 25): Promise<AdminUserSearchResult[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        return [];
    }

    const wildcardQuery = `%${trimmedQuery.replace(/\s+/g, "%")}%`;

    const rows = await runQuery((db) =>
        db
            .select()
            .from(users)
            .where(
                and(
                    ne(users.role, "guest"),
                    or(
                        ilike(users.displayName, wildcardQuery),
                        ilike(users.email, wildcardQuery),
                        ilike(sql<string>`coalesce(${users.phone}, '')`, wildcardQuery),
                        ilike(users.id, wildcardQuery)
                    )
                )
            )
            .orderBy(desc(users.updatedAt), desc(users.createdAt))
            .limit(limit)
    );

    return rows.map((row) => ({
        id: row.id,
        email: row.email,
        phone: row.phone,
        displayName: row.displayName,
        role: row.role as Exclude<UserRole, "guest">,
        state: row.state,
        trustScore: row.trustScore,
        emailVerified: row.emailVerified,
        phoneVerified: row.phoneVerified,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
    }));
}