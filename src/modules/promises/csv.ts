import { promiseStatusSchema, type PromiseStatus } from "@/config/schemas";
import { createPromise } from "@/modules/promises/repository";

type CsvPromiseRow = {
    title: string;
    description: string;
    category: string;
    jurisdiction: string;
    election: string;
    personParty: string;
    status: PromiseStatus;
};

function parseCsvLine(line: string) {
    const values: string[] = [];
    let currentValue = "";
    let isQuoted = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];

        if (character === '"') {
            if (isQuoted && line[index + 1] === '"') {
                currentValue += '"';
                index += 1;
            } else {
                isQuoted = !isQuoted;
            }
            continue;
        }

        if (character === "," && !isQuoted) {
            values.push(currentValue.trim());
            currentValue = "";
            continue;
        }

        currentValue += character;
    }

    values.push(currentValue.trim());
    return values;
}

export function parsePromiseCsv(csvText: string) {
    const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) {
        return [];
    }

    const [headerLine, ...rows] = lines;
    const headers = parseCsvLine(headerLine);

    return rows.map((row, rowIndex) => {
        const values = parseCsvLine(row);
        const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
        const status = promiseStatusSchema.parse(record.status);

        if (!record.title || !record.description || !record.category || !record.jurisdiction || !record.election || !record.personParty) {
            throw new Error(`Row ${rowIndex + 2} is missing one or more required columns.`);
        }

        return {
            title: record.title,
            description: record.description,
            category: record.category,
            jurisdiction: record.jurisdiction,
            election: record.election,
            personParty: record.personParty,
            status
        } satisfies CsvPromiseRow;
    });
}

export function importPromisesFromCsv({
    csvText,
    tenantId,
    timelineSlug,
    actorId
}: {
    csvText: string;
    tenantId: string;
    timelineSlug: string;
    actorId: string;
}) {
    return parsePromiseCsv(csvText).map((row) =>
        createPromise({
            tenantId,
            timelineSlug,
            actorId,
            ...row
        })
    );
}

export type { CsvPromiseRow };