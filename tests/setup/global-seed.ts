/**
 * Vitest global setup: force-reseed the test database before any tests run.
 * This ensures a clean, predictable state for integration tests.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadEnvFile(filePath: string) {
    if (!existsSync(filePath)) {
        return;
    }

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmed.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();

        if (!key) {
            continue;
        }

        let value = trimmed.slice(separatorIndex + 1);

        if (
            (value.startsWith('"') && value.endsWith('"'))
            || (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        process.env[key] = value;
    }
}

export async function setup() {
    loadEnvFile(path.join(process.cwd(), ".env"));
    execSync("npm run db:seed -- --force", { stdio: "inherit" });
}
