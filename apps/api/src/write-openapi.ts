import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { buildApiApp } from "./app";

async function main() {
    const app = buildApiApp();

    const response = await app.inject({ method: "GET", url: "/openapi.json" });

    if (response.statusCode !== 200) {
        throw new Error(`Failed to generate OpenAPI document: ${response.statusCode} ${response.body}`);
    }

    const outputPath = resolve(process.cwd(), "apps/api/openapi.json");

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(response.json(), null, 2)}\n`, "utf8");
    await app.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});