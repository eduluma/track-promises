import { describe, expect, it } from "vitest";

import { getFoundationSeedData } from "@/db/seed-data";

describe("foundation seed data", () => {
    it("derives timeline and alliance rows for seeded promises", () => {
        const data = getFoundationSeedData();
        const tamilNaduPromises = data.promises.filter((promise) => promise.tenantId === "tenant-tamilnadu");

        expect(data.timelines.map((timeline) => timeline.slug)).toEqual(expect.arrayContaining(["2026", "2029", "demo"]));
        expect(data.alliances.map((alliance) => alliance.name)).toEqual(
            expect.arrayContaining(["Alliance for Growth", "Forward India", "Tamilaga Vettri Kazhagam"])
        );
        expect(data.timelineAlliances.length).toBeGreaterThanOrEqual(3);
        expect(tamilNaduPromises.every((promise) => Boolean(promise.timelineId))).toBe(true);
        expect(tamilNaduPromises.every((promise) => Boolean(promise.timelineAllianceId))).toBe(true);
        expect(new Set(tamilNaduPromises.map((promise) => promise.timelineAllianceId)).size).toBeGreaterThanOrEqual(2);
    });
});