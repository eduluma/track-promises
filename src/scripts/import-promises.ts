import { readFile } from "node:fs/promises";

import { importPromisesFromCsv } from "@/modules/promises/csv";
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
    const tenantSlug = getArg("--tenant");
    const timelineSlug = getArg("--timeline");
    const actorId = getArg("--actor") ?? "editor-user";

    if (!filePath || !tenantSlug) {
        throw new Error("Usage: npm run import:promises -- --file path/to/promises.csv --tenant tamilnadu [--timeline 2026] [--actor editor-user]");
    }

    const tenant = getTenantBySlug(tenantSlug);

    if (!tenant) {
        throw new Error(`Unknown tenant slug: ${tenantSlug}`);
    }

    const timeline = timelineSlug ? getTimelineBySlug(tenant.id, timelineSlug) : getDefaultTimelineForTenant(tenant.id);

    if (!timeline) {
        throw new Error(`Unknown timeline for tenant ${tenantSlug}: ${timelineSlug ?? "<default>"}`);
    }

    const csvText = await readFile(filePath, "utf8");
    const imported = importPromisesFromCsv({
        csvText,
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
