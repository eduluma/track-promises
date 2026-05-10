import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { importPromisesFromJson, parsePromiseDataset } from "@/modules/promises/json";

describe("promise json import", () => {
    it("parses the Tamil Nadu dataset into import rows", () => {
        const jsonText = readFileSync(resolve(process.cwd(), "docs/tamilnadu-2026-tvk-promises.json"), "utf8");
        const dataset = parsePromiseDataset(jsonText);

        expect(dataset.tenant.slug).toBe("tamilnadu");
        expect(dataset.timeline.slug).toBe("2026");
        expect(dataset.rows).toHaveLength(38);
        expect(dataset.alliances).toEqual([
            expect.objectContaining({ slug: "tvk", promiseCount: 38 })
        ]);
        expect(dataset.rows[0]?.sources.length).toBeGreaterThan(0);
    });

    it("imports json rows and preserves source evidence", () => {
        const imported = importPromisesFromJson({
            jsonText: JSON.stringify({
                tenant: {
                    slug: "tamilnadu",
                    name: "Tamil Nadu",
                    jurisdiction: "Tamil Nadu",
                    country: "India"
                },
                timeline: {
                    slug: "2026",
                    year: 2026,
                    election: "Tamil Nadu Assembly Election 2026"
                },
                alliances: [
                    {
                        id: "tn-2026-test-front",
                        slug: "test-front",
                        name: "Test Front",
                        memberParties: ["Test Party"],
                        promises: [
                            {
                                id: "tn-2026-test-water",
                                title: "Publish water reservoir dashboards",
                                description: "Publish monthly reservoir and drinking water dashboards across every district.",
                                category: "Infrastructure",
                                state: "Tamil Nadu",
                                year: 2026,
                                election: "Tamil Nadu Assembly Election 2026",
                                alliance: "Test Front",
                                personParty: "Test Party",
                                status: "planned",
                                sources: [
                                    {
                                        publisher: "Test Manifesto",
                                        url: "https://example.org/test-manifesto",
                                        excerpt: "We will publish monthly reservoir dashboards for every district.",
                                        verificationStatus: "verified"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }),
            tenantId: "tenant-tamilnadu",
            timelineSlug: "2026",
            actorId: "editor-user"
        });

        expect(imported).toHaveLength(1);
        expect(imported[0]?.sources).toEqual([
            expect.objectContaining({
                publisher: "Test Manifesto",
                url: "https://example.org/test-manifesto",
                verificationStatus: "verified"
            })
        ]);
    });
});