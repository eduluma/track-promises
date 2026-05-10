import { readFile } from "node:fs/promises";
import path from "node:path";

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

export async function loadTimelineContent(tenantSlug: string, timelineSlug: string): Promise<TimelineContent | null> {
    const baseDirectory = path.join(process.cwd(), "content", "timelines", tenantSlug, timelineSlug);
    const htmlPath = path.join(baseDirectory, "index.html");

    try {
        const html = await readFile(htmlPath, "utf8");
        return {
            format: "html",
            html,
            sourcePath: htmlPath
        };
    } catch {
        const markdownPath = path.join(baseDirectory, "README.md");

        try {
            const markdown = await readFile(markdownPath, "utf8");
            return {
                format: "markdown",
                html: renderMarkdownToHtml(markdown),
                sourcePath: markdownPath
            };
        } catch {
            return null;
        }
    }
}

export type { TimelineContent };