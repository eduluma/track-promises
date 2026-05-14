import { describe, expect, it } from "vitest";

import { listPromisesForTenant } from "@/modules/promises/repository";
import { loadTimelineContent } from "@/modules/timelines/content";
import { getDefaultTimelineForTenant, getTimelineBySlug } from "@/modules/timelines/data";
import { getTimelineScoreProjection } from "@/modules/timelines/score";

describe("timeline routing model", () => {
    it("returns the default timeline for a tenant", () => {
        const timeline = getDefaultTimelineForTenant("tenant-tamilnadu");

        expect(timeline?.slug).toBe("2026");
    });

    it("filters promises by timeline slug", async () => {
        const promises = await listPromisesForTenant("tenant-tamilnadu", { timelineSlug: "2026" });

        expect(promises).toHaveLength(38);
        expect(promises.every((promise) => promise.timelineSlug === "2026")).toBe(true);
    });

    it("resolves localized timeline and promise content with fallback", async () => {
        const timeline = getTimelineBySlug("tenant-tamilnadu", "2026", "ta");
        const promises = await listPromisesForTenant("tenant-tamilnadu", {
            timelineSlug: "2026",
            locale: "ta"
        });
        const localizedPromise = promises.find((promise) => promise.id === "tn-2026-tvk-women-income-support");

        expect(timeline?.title).toBe("தமிழ்நாடு 2026");
        expect(timeline?.officeTitle).toBe("முதல்வர்");
        expect(localizedPromise?.title).toContain("பெண் குடும்பத் தலைவர்களுக்கு");
        expect(localizedPromise?.sources[0]?.excerpt).toContain("பெண் குடும்பத் தலைவர்களுக்கு");
    });

    it("loads markdown or html overview content for a timeline", async () => {
        const markdownContent = await loadTimelineContent("tamilnadu", "2026", "en");
        const localizedMarkdownContent = await loadTimelineContent("tamilnadu", "2026", "ta");
        const htmlContent = await loadTimelineContent("india", "2029");
        const timeline = getTimelineBySlug("tenant-india-2029", "2029");

        expect(timeline?.title).toBe("India 2029");
        expect(markdownContent?.html).toContain("Tamil Nadu 2026");
        expect(markdownContent?.sourcePath).toContain("README.md");
        expect(localizedMarkdownContent?.html).toContain("தமிழ்நாடு 2026");
        expect(localizedMarkdownContent?.sourcePath).toContain("README.ta.md");
        expect(htmlContent?.html).toContain("India 2029");
    });

    it("derives a timeline score projection with term metadata", async () => {
        const score = await getTimelineScoreProjection({
            tenantId: "tenant-tamilnadu",
            timelineSlug: "2026",
            now: new Date("2026-05-10T00:00:00.000Z")
        });
        const timeline = getTimelineBySlug("tenant-tamilnadu", "2026");

        expect(score.score).toBeGreaterThan(0);
        expect(score.termLengthMonths).toBe(60);
        expect(score.assessedPromiseCount).toBeGreaterThan(0);
        expect(score.termElapsedPercent).toBe(0);
        expect(timeline?.resultsPublishedAt).toBe("2026-05-04T00:00:00.000Z");
        expect(timeline?.termStartAt).toBe("2026-05-10T00:00:00.000Z");
    });
});