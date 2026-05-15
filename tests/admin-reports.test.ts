import { describe, expect, it } from "vitest";

import { createPersistedUser } from "@/modules/auth/user-store";
import { getAdminReportSummary, searchAdminUsers } from "@/modules/admin/reports";
import { listTenants } from "@/modules/tenants/data";

describe("admin reports", () => {
    it("aggregates registered users and tenant activity", async () => {
        const before = await getAdminReportSummary();
        const userId = `admin-report-${crypto.randomUUID().slice(0, 8)}`;

        await createPersistedUser({
            id: userId,
            email: `${userId}@example.com`,
            phone: "+919876543210",
            displayName: "Admin Report Search User",
            passwordHash: "hash-not-used",
            emailVerified: true,
            state: "verified",
            role: "tenant_admin",
            trustScore: 42
        });

        const summary = await getAdminReportSummary();
        const tamilNaduSummary = summary.tenantSummaries.find((tenant) => tenant.tenantId === "tenant-tamilnadu");

        expect(summary.totalUsers).toBe(before.totalUsers + 1);
        expect(summary.stateCounts.verified).toBe(before.stateCounts.verified + 1);
        expect(summary.roleCounts.tenant_admin).toBe(before.roleCounts.tenant_admin + 1);
        expect(summary.tenantSummaries).toHaveLength(listTenants().length);
        expect(tamilNaduSummary).toBeDefined();
        expect(tamilNaduSummary?.promiseCount).toBeGreaterThan(0);
        expect(tamilNaduSummary?.voteCount).toBeGreaterThan(0);
    });

    it("searches users by name, email, phone, and id", async () => {
        const userId = `admin-search-${crypto.randomUUID().slice(0, 8)}`;

        await createPersistedUser({
            id: userId,
            email: `${userId}@example.com`,
            phone: "+919812345678",
            displayName: "Searchable Admin Person",
            passwordHash: "hash-not-used",
            state: "moderator_approved",
            role: "user",
            trustScore: 17
        });

        expect(await searchAdminUsers("")).toEqual([]);

        const byName = await searchAdminUsers("Searchable Admin");
        const byEmail = await searchAdminUsers(`${userId}@example.com`);
        const byPhone = await searchAdminUsers("9812345678");
        const byId = await searchAdminUsers(userId);

        for (const results of [byName, byEmail, byPhone, byId]) {
            expect(results).toContainEqual(
                expect.objectContaining({
                    id: userId,
                    email: `${userId}@example.com`,
                    displayName: "Searchable Admin Person"
                })
            );
        }
    });
});