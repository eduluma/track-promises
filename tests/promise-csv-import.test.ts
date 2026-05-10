import { describe, expect, it } from "vitest";

import { importPromisesFromCsv, parsePromiseCsv } from "@/modules/promises/csv";
import { getPromiseById } from "@/modules/promises/repository";

describe("promise csv import", () => {
    it("parses csv rows into promise payloads", () => {
        const rows = parsePromiseCsv(`title,description,category,jurisdiction,election,personParty,status
Transit dashboard,Publish a city transit dashboard with monthly uptime data,Infrastructure,Tamil Nadu,State Election 2026,Alliance for Growth,planned`);

        expect(rows).toHaveLength(1);
        expect(rows[0]?.status).toBe("planned");
    });

    it("imports csv rows into the promise repository", () => {
        const imported = importPromisesFromCsv({
            csvText: `title,description,category,jurisdiction,election,personParty,status
Water audit,Publish annual district water audits with downloadable source data,Health,Tamil Nadu,State Election 2026,Alliance for Growth,in_progress`,
            tenantId: "tenant-tamilnadu",
            actorId: "editor-user"
        });

        expect(imported).toHaveLength(1);
        expect(getPromiseById("tenant-tamilnadu", imported[0]!.id)?.title).toBe("Water audit");
    });
});