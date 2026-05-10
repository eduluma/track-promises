import { z } from "zod";

import { promiseStatusSchema } from "@/config/schemas";
import { createPromise } from "@/modules/promises/repository";
import type { PromiseSource } from "@/modules/promises/data";

const promiseSourceInputSchema = z.object({
    publisher: z.string().min(1),
    url: z.string().url(),
    excerpt: z.string().min(1),
    capturedAt: z.string().datetime().optional(),
    verificationStatus: z.enum(["verified", "pending"]).optional()
});

const datasetPromiseSchema = z
    .object({
        id: z.string().min(1).optional(),
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.string().min(1),
        jurisdiction: z.string().min(1).optional(),
        state: z.string().min(1).optional(),
        year: z.number().int().optional(),
        election: z.string().min(1),
        alliance: z.string().min(1).optional(),
        personParty: z.string().min(1),
        status: promiseStatusSchema,
        sources: z.array(promiseSourceInputSchema).default([])
    })
    .refine((row) => Boolean(row.jurisdiction ?? row.state), {
        message: "Each promise row must include jurisdiction or state."
    });

const promiseDatasetSchema = z.object({
    tenant: z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        jurisdiction: z.string().min(1),
        country: z.string().min(1)
    }),
    timeline: z.object({
        slug: z.string().min(1),
        year: z.number().int(),
        election: z.string().min(1)
    }),
    alliances: z.array(
        z.object({
            id: z.string().min(1),
            slug: z.string().min(1),
            name: z.string().min(1),
            memberParties: z.array(z.string().min(1)).default([]),
            promises: z.array(datasetPromiseSchema).default([])
        })
    )
});

type JsonPromiseSource = Pick<PromiseSource, "publisher" | "url" | "excerpt"> &
    Partial<Pick<PromiseSource, "capturedAt" | "verificationStatus">>;

type JsonPromiseRow = {
    title: string;
    description: string;
    category: string;
    jurisdiction: string;
    election: string;
    personParty: string;
    status: z.infer<typeof promiseStatusSchema>;
    sources: JsonPromiseSource[];
};

export function parsePromiseDataset(jsonText: string) {
    const dataset = promiseDatasetSchema.parse(JSON.parse(jsonText));
    const rows: JsonPromiseRow[] = dataset.alliances.flatMap((alliance) =>
        alliance.promises.map((promise) => ({
            title: promise.title,
            description: promise.description,
            category: promise.category,
            jurisdiction: promise.jurisdiction ?? promise.state!,
            election: promise.election,
            personParty: promise.personParty,
            status: promise.status,
            sources: promise.sources
        }))
    );

    return {
        tenant: dataset.tenant,
        timeline: dataset.timeline,
        alliances: dataset.alliances.map((alliance) => ({
            id: alliance.id,
            slug: alliance.slug,
            name: alliance.name,
            memberParties: alliance.memberParties,
            promiseCount: alliance.promises.length
        })),
        rows
    };
}

export function importPromisesFromJson({
    jsonText,
    tenantId,
    timelineSlug,
    actorId
}: {
    jsonText: string;
    tenantId: string;
    timelineSlug: string;
    actorId: string;
}) {
    return parsePromiseDataset(jsonText).rows.map((row) =>
        createPromise({
            tenantId,
            timelineSlug,
            actorId,
            ...row
        })
    );
}

export type { JsonPromiseRow, JsonPromiseSource };