import { readFile } from "node:fs/promises";

import { importPromisesFromCsv } from "@/modules/promises/csv";
import { getTenantBySlug } from "@/modules/tenants/data";

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
    const actorId = getArg("--actor") ?? "editor-user";

    if (!filePath || !tenantSlug) {
        throw new Error("Usage: npm run import:promises -- --file path/to/promises.csv --tenant tamilnadu [--actor editor-user]");
    }

    const tenant = getTenantBySlug(tenantSlug);

    if (!tenant) {
        throw new Error(`Unknown tenant slug: ${tenantSlug}`);
    }

    const csvText = await readFile(filePath, "utf8");
    const imported = importPromisesFromCsv({
        csvText,
        tenantId: tenant.id,
        actorId
    });

    console.log(`Imported ${imported.length} promises into ${tenant.slug}.`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
