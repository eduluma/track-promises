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

        if (!key || process.env[key] !== undefined) {
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

const command = process.argv[2] ?? "dev";
const nextArguments = process.argv.slice(3);
const port = process.env.APP_PORT ?? "3000";
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, command, "--port", port, ...nextArguments], {
    stdio: "inherit",
    env: process.env
});

child.on("error", (error) => {
    console.error(error);
    process.exit(1);
});

child.on("exit", (code) => {
    process.exit(code ?? 0);
});