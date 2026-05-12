/**
 * Vitest global setup: force-reseed the test database before any tests run.
 * This ensures a clean, predictable state for integration tests.
 */
import { execSync } from "node:child_process";

export async function setup() {
    execSync("npm run db:seed -- --force", { stdio: "inherit" });
}
