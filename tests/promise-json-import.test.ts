import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { importPromisesFromJson, parsePromiseDataset } from "@/modules/promises/json";

describe("promise json import", () => {
    it("parses the Tamil Nadu dataset into import rows", () => {
        const jsonText = readFileSync(resolve(process.cwd(), "data/election/2026/tamilnadu-2026-tvk-promises.json"), "utf8");
        const dataset = parsePromiseDataset(jsonText);

        expect(dataset.tenant.slug).toBe("tamilnadu");
        expect(dataset.timeline.slug).toBe("2026");
        expect(dataset.recentElectionOverview).toEqual(
            expect.objectContaining({
                winnerName: "Tamilaga Vettri Kazhagam and allies",
                winnerParty: "TVK+",
                year: 2026
            })
        );
        expect(dataset.rows).toHaveLength(38);
        expect(dataset.alliances).toEqual([
            expect.objectContaining({ slug: "tvk", promiseCount: 38 })
        ]);
        expect(dataset.rows[0]?.sources.length).toBeGreaterThan(0);
        expect(dataset.rows.find((row) => row.title.includes("200 units of free electricity"))?.deliveryPlan).toEqual(
            expect.objectContaining({
                model: "recurring",
                cadenceLabel: "Monthly billing cycle"
            })
        );
    });

    it("imports json rows and preserves source evidence", async () => {
        const imported = await importPromisesFromJson({
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
                                deliveryPlan: {
                                    model: "recurring",
                                    summary: "Track this promise every month after the dashboard launches.",
                                    cadenceLabel: "Monthly",
                                    targetLabel: "One dashboard refresh per month",
                                    checkpoints: [
                                        {
                                            label: "Launch dashboard",
                                            dueAt: "2026-06-01T00:00:00.000Z",
                                            status: "planned"
                                        }
                                    ]
                                },
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
        expect(imported[0]?.deliveryPlan).toEqual(
            expect.objectContaining({
                model: "recurring",
                cadenceLabel: "Monthly"
            })
        );
    });

    it("imports localized promise and source content without duplicating templates", async () => {
        const imported = await importPromisesFromJson({
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
                        id: "tn-2026-localized-front",
                        slug: "localized-front",
                        name: "Localized Front",
                        memberParties: ["Localized Party"],
                        promises: [
                            {
                                id: "tn-2026-localized-housing",
                                title: "Build district housing dashboards",
                                titleTranslations: {
                                    ta: "மாவட்ட வீட்டு வசதி டாஷ்போர்டுகளை உருவாக்கு"
                                },
                                description: "Publish district-level housing progress dashboards.",
                                descriptionTranslations: {
                                    ta: "மாவட்ட அளவிலான வீட்டு வசதி முன்னேற்ற டாஷ்போர்டுகளை வெளியிடு."
                                },
                                category: "Housing",
                                state: "Tamil Nadu",
                                election: "Tamil Nadu Assembly Election 2026",
                                personParty: "Localized Party",
                                status: "planned",
                                sources: [
                                    {
                                        publisher: "Localized Manifesto",
                                        url: "https://example.org/localized-manifesto",
                                        excerpt: "District dashboards will be published.",
                                        excerptTranslations: {
                                            ta: "மாவட்ட டாஷ்போர்டுகள் வெளியிடப்படும்."
                                        }
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

        expect(imported[0]?.titleTranslations).toEqual(
            expect.objectContaining({
                ta: "மாவட்ட வீட்டு வசதி டாஷ்போர்டுகளை உருவாக்கு"
            })
        );
        expect(imported[0]?.sources[0]?.excerptTranslations).toEqual(
            expect.objectContaining({
                ta: "மாவட்ட டாஷ்போர்டுகள் வெளியிடப்படும்."
            })
        );
    });
});