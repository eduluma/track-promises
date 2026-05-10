import { readFile } from "node:fs/promises";

import { importPromisesFromCsv } from "@/modules/promises/csv";
import { importPromisesFromJson, parsePromiseDataset } from "@/modules/promises/json";
import { getTenantBySlug } from "@/modules/tenants/data";
import { getDefaultTimelineForTenant, getTimelineBySlug } from "@/modules/timelines/data";

function getArg(name: string) {
    const index = process.argv.indexOf(name);
    if (index === -1) {
        return null;
    }

    return process.argv[index + 1] ?? null;
}

async function main() {
    const filePath = getArg("--file");
    const tenantSlugArg = getArg("--tenant");
    const timelineSlugArg = getArg("--timeline");
    const actorId = getArg("--actor") ?? "editor-user";

    if (!filePath) {
        throw new Error("Usage: npm run import:promises -- --file path/to/promises.csv|json [--tenant tamilnadu] [--timeline 2026] [--actor editor-user]");
    }

    const fileText = await readFile(filePath, "utf8");
    const isJsonDataset = filePath.endsWith(".json");
    const dataset = isJsonDataset ? parsePromiseDataset(fileText) : null;
    const tenantSlug = tenantSlugArg ?? dataset?.tenant.slug ?? null;
    const timelineSlug = timelineSlugArg ?? dataset?.timeline.slug ?? null;

    if (!tenantSlug) {
        throw new Error("A tenant slug is required. JSON dataset files can provide it automatically via their top-level tenant.slug.");
    }

    if (dataset && tenantSlugArg && tenantSlugArg !== dataset.tenant.slug) {
        throw new Error(`Tenant mismatch: file is for ${dataset.tenant.slug} but --tenant was ${tenantSlugArg}.`);
    }

    if (dataset && timelineSlugArg && timelineSlugArg !== dataset.timeline.slug) {
        throw new Error(`Timeline mismatch: file is for ${dataset.timeline.slug} but --timeline was ${timelineSlugArg}.`);
    }

    const tenant = getTenantBySlug(tenantSlug);

    if (!tenant) {
        throw new Error(`Unknown tenant slug: ${tenantSlug}`);
    }

    const timeline = timelineSlug ? getTimelineBySlug(tenant.id, timelineSlug) : getDefaultTimelineForTenant(tenant.id);

    if (!timeline) {
        throw new Error(`Unknown timeline for tenant ${tenantSlug}: ${timelineSlug ?? "<default>"}`);
    }

    const imported = isJsonDataset
        ? importPromisesFromJson({
            jsonText: fileText,
            tenantId: tenant.id,
            timelineSlug: timeline.slug,
            actorId
        })
        : importPromisesFromCsv({
            csvText: fileText,
            tenantId: tenant.id,
            timelineSlug: timeline.slug,
            actorId
        });

    console.log(`Imported ${imported.length} promises into ${tenant.slug}/${timeline.slug}.`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
