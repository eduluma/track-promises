import { describe, expect, it } from "vitest";

import { listPromisesForTenant } from "@/modules/promises/repository";
import { loadTimelineContent } from "@/modules/timelines/content";
import { getDefaultTimelineForTenant, getTimelineBySlug } from "@/modules/timelines/data";

describe("timeline routing model", () => {
    it("returns the default timeline for a tenant", () => {
        const timeline = getDefaultTimelineForTenant("tenant-tamilnadu");

        expect(timeline?.slug).toBe("2026");
    });

    it("filters promises by timeline slug", () => {
        const promises = listPromisesForTenant("tenant-tamilnadu", { timelineSlug: "2026" });

        expect(promises).toHaveLength(38);
        expect(promises.every((promise) => promise.timelineSlug === "2026")).toBe(true);
    });

    it("loads markdown or html overview content for a timeline", async () => {
        const markdownContent = await loadTimelineContent("tamilnadu", "2026");
        const htmlContent = await loadTimelineContent("india", "2029");
        const timeline = getTimelineBySlug("tenant-india-2029", "2029");

        expect(timeline?.title).toBe("India 2029");
        expect(markdownContent?.html).toContain("Tamil Nadu 2026");
        expect(htmlContent?.html).toContain("India 2029");
    });
});