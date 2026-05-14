import { execSync } from "node:child_process";

function resolveGitVersion() {
    try {
        const commitCount = execSync("git rev-list --count HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
        const shortHash = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();

        if (commitCount && shortHash) {
            return `v${commitCount}.${shortHash}`;
        }
    } catch {
        // Fall through to the static fallback.
    }

    return "v0.local";
}

const resolvedAppVersion = process.env.APP_VERSION?.trim() || resolveGitVersion();

export function getAppVersion() {
    return resolvedAppVersion;
}