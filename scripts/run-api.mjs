import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
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
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        process.env[key] = value;
    }
}

loadEnvFile(path.join(process.cwd(), ".env"));

const mode = process.argv[2] ?? "dev";

if (process.env.PORT === undefined && process.env.API_PORT) {
    process.env.PORT = process.env.API_PORT;
}

const command =
    mode === "dev"
        ? ["tsx", "watch", "apps/api/src/server.ts"]
        : mode === "start"
            ? ["tsx", "apps/api/src/server.ts"]
            : mode === "openapi"
                ? ["tsx", "apps/api/src/write-openapi.ts"]
                : null;

if (!command) {
    console.error(`Unknown api mode: ${mode}`);
    process.exit(1);
}

const child = spawn("npx", command, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32"
});

child.on("error", (error) => {
    console.error(error);
    process.exit(1);
});

child.on("exit", (code) => {
    process.exit(code ?? 0);
});