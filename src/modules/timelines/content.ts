import { readFile } from "node:fs/promises";
import path from "node:path";

import type { SupportedLocale } from "@/modules/i18n/config";

type TimelineContent = {
    format: "html" | "markdown";
    html: string;
    sourcePath: string;
};

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderMarkdownBlock(block: string) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.length === 0) {
        return "";
    }

    const headingMatch = lines[0]?.match(/^(#{1,3})\s+(.*)$/);

    if (headingMatch) {
        const level = headingMatch[1].length;
        return `<h${level}>${escapeHtml(headingMatch[2])}</h${level}>`;
    }

    if (lines.every((line) => line.startsWith("- "))) {
        return `<ul>${lines.map((line) => `<li>${escapeHtml(line.slice(2))}</li>`).join("")}</ul>`;
    }

    return `<p>${escapeHtml(lines.join(" "))}</p>`;
}

function renderMarkdownToHtml(markdown: string) {
    return markdown
        .split(/\n\s*\n/)
        .map((block) => renderMarkdownBlock(block.trim()))
        .filter(Boolean)
        .join("");
}

export async function loadTimelineContent(
    tenantSlug: string,
    timelineSlug: string,
    locale?: SupportedLocale | null
): Promise<TimelineContent | null> {
    const baseDirectory = path.join(process.cwd(), "content", "timelines", tenantSlug, timelineSlug);
    const candidateFiles = locale
        ? [`index.${locale}.html`, `README.${locale}.md`, "index.html", "README.md"]
        : ["index.html", "README.md"];

    for (const candidateFile of candidateFiles) {
        const candidatePath = path.join(baseDirectory, candidateFile);

        try {
            const fileContent = await readFile(candidatePath, "utf8");

            if (candidateFile.endsWith(".html")) {
                return {
                    format: "html",
                    html: fileContent,
                    sourcePath: candidatePath
                };
            }

            return {
                format: "markdown",
                html: renderMarkdownToHtml(fileContent),
                sourcePath: candidatePath
            };
        } catch {
            continue;
        }
    }

    return null;
}

export type { TimelineContent };