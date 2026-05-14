import { z } from "zod";

import { promiseStatusSchema } from "@/config/schemas";
import { supportedLocaleCodes } from "@/modules/i18n/config";
import { createPromise } from "@/modules/promises/repository";
import type { PromiseDeliveryPlan, PromiseSource } from "@/modules/promises/data";

const localizedTextSchema = z
    .object(
        Object.fromEntries(supportedLocaleCodes.map((locale) => [locale, z.string().min(1).optional()])) as Record<
            (typeof supportedLocaleCodes)[number],
            z.ZodOptional<z.ZodString>
        >
    )
    .refine((value) => Object.values(value).some(Boolean), {
        message: "Localized content must include at least one translated value."
    });

const promiseSourceInputSchema = z.object({
    publisher: z.string().min(1),
    url: z.string().url(),
    excerpt: z.string().min(1),
    excerptTranslations: localizedTextSchema.optional(),
    capturedAt: z.string().datetime().optional(),
    verificationStatus: z.enum(["verified", "pending"]).optional()
});

const recentElectionSourceSchema = z.object({
    label: z.string().min(1),
    url: z.string().url()
});

const recentElectionResultSchema = z.object({
    label: z.string().min(1),
    alliance: z.string().min(1).optional(),
    party: z.string().min(1).optional(),
    votes: z.number().int().nonnegative(),
    voteSharePercent: z.number().nonnegative(),
    seats: z.number().int().nonnegative().optional(),
    isWinner: z.boolean().optional()
});

const recentElectionOverviewSchema = z.object({
    election: z.string().min(1),
    year: z.number().int(),
    summary: z.string().min(1),
    summaryTranslations: localizedTextSchema.optional(),
    winnerTitle: z.string().min(1),
    winnerTitleTranslations: localizedTextSchema.optional(),
    winnerName: z.string().min(1),
    winnerParty: z.string().min(1),
    totalVotesCast: z.number().int().nonnegative(),
    turnoutPercent: z.number().nonnegative(),
    registeredVoters: z.number().int().nonnegative(),
    resultBreakdown: z.array(recentElectionResultSchema).min(1),
    sources: z.array(recentElectionSourceSchema).min(1)
});

const deliveryCheckpointSchema = z.object({
    label: z.string().min(1),
    description: z.string().min(1).optional(),
    dueAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().nullable().optional(),
    status: z.enum(["planned", "in_progress", "met", "missed"])
});

const deliveryPlanSchema = z.object({
    model: z.enum(["one_time", "milestone", "recurring"]),
    summary: z.string().min(1),
    cadenceLabel: z.string().min(1).optional(),
    targetLabel: z.string().min(1).optional(),
    currentPhaseLabel: z.string().min(1).optional(),
    checkpoints: z.array(deliveryCheckpointSchema).default([])
});

const datasetPromiseSchema = z
    .object({
        id: z.string().min(1).optional(),
        routeSlugTranslations: localizedTextSchema.optional(),
        title: z.string().min(1),
        titleTranslations: localizedTextSchema.optional(),
        description: z.string().min(1),
        descriptionTranslations: localizedTextSchema.optional(),
        category: z.string().min(1),
        jurisdiction: z.string().min(1).optional(),
        state: z.string().min(1).optional(),
        year: z.number().int().optional(),
        election: z.string().min(1),
        alliance: z.string().min(1).optional(),
        personParty: z.string().min(1),
        status: promiseStatusSchema,
        deliveryPlan: deliveryPlanSchema.optional(),
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
    recentElectionOverview: recentElectionOverviewSchema.optional(),
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
    Partial<Pick<PromiseSource, "capturedAt" | "verificationStatus" | "excerptTranslations">>;

type JsonPromiseRow = {
    routeSlugTranslations?: PromiseSource["excerptTranslations"];
    title: string;
    titleTranslations?: PromiseSource["excerptTranslations"];
    description: string;
    descriptionTranslations?: PromiseSource["excerptTranslations"];
    category: string;
    jurisdiction: string;
    election: string;
    personParty: string;
    status: z.infer<typeof promiseStatusSchema>;
    deliveryPlan?: PromiseDeliveryPlan;
    sources: JsonPromiseSource[];
};

type JsonRecentElectionOverview = z.infer<typeof recentElectionOverviewSchema>;

export function parsePromiseDataset(jsonText: string) {
    const dataset = promiseDatasetSchema.parse(JSON.parse(jsonText));
    const rows: JsonPromiseRow[] = dataset.alliances.flatMap((alliance) =>
        alliance.promises.map((promise) => ({
            routeSlugTranslations: promise.routeSlugTranslations,
            title: promise.title,
            titleTranslations: promise.titleTranslations,
            description: promise.description,
            descriptionTranslations: promise.descriptionTranslations,
            category: promise.category,
            jurisdiction: promise.jurisdiction ?? promise.state!,
            election: promise.election,
            personParty: promise.personParty,
            status: promise.status,
            deliveryPlan: promise.deliveryPlan,
            sources: promise.sources
        }))
    );

    return {
        tenant: dataset.tenant,
        timeline: dataset.timeline,
        recentElectionOverview: (dataset.recentElectionOverview ?? null) as JsonRecentElectionOverview | null,
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

export async function importPromisesFromJson({
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
    return Promise.all(
        parsePromiseDataset(jsonText).rows.map((row) =>
            createPromise({
                tenantId,
                timelineSlug,
                actorId,
                ...row
            })
        )
    );
}

export type { JsonPromiseRow, JsonPromiseSource, JsonRecentElectionOverview };