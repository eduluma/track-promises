import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
    createPromiseRequestSchema,
    resolveModerationReviewRequestSchema,
    updateTenantLocalizationRequestSchema,
    voteRequestSchema
} from "@/modules/api/contracts";
import { API_USER_CONTEXT_HEADER } from "@/modules/api/user-context";
import { voteValueOrder } from "@/modules/voting/assessment";

const userContextHeaderSchema = {
    type: "object",
    properties: {
        [API_USER_CONTEXT_HEADER]: {
            type: "string",
            description: "Base64-encoded user context forwarded by the web runtime."
        }
    }
} as const;

const errorResponseSchema = {
    type: "object",
    required: ["error"],
    properties: {
        error: { type: "string" },
        code: { type: "string" }
    },
    additionalProperties: false
} as const;

const healthResponseSchema = {
    type: "object",
    required: ["status", "service"],
    properties: {
        status: { type: "string", enum: ["ok"] },
        service: { type: "string", enum: ["track-promises-api"] }
    },
    additionalProperties: false
} as const;

const voteSummarySchema = {
    type: "object",
    required: [
        "counts",
        "categoryCounts",
        "completionPercent",
        "registeredCompletionPercent",
        "registeredVotes",
        "registeredCounts",
        "verifiedCompletionPercent",
        "verifiedVotes",
        "guestCompletionPercent",
        "guestVotes",
        "guestCounts",
        "dominantVote",
        "currentVote",
        "totalVotes",
        "eventCount"
    ],
    properties: {
        counts: {
            type: "object",
            required: [...voteValueOrder],
            properties: Object.fromEntries(voteValueOrder.map((value) => [value, { type: "integer" }]))
        },
        categoryCounts: {
            type: "object",
            required: ["verified", "unverified", "guest"],
            properties: {
                verified: { type: "integer" },
                unverified: { type: "integer" },
                guest: { type: "integer" }
            }
        },
        completionPercent: { type: "integer" },
        registeredCompletionPercent: { type: "integer" },
        registeredVotes: { type: "integer" },
        registeredCounts: {
            type: "object",
            required: [...voteValueOrder],
            properties: Object.fromEntries(voteValueOrder.map((value) => [value, { type: "integer" }]))
        },
        verifiedCompletionPercent: { type: "integer" },
        verifiedVotes: { type: "integer" },
        guestCompletionPercent: { type: "integer" },
        guestVotes: { type: "integer" },
        guestCounts: {
            type: "object",
            required: [...voteValueOrder],
            properties: Object.fromEntries(voteValueOrder.map((value) => [value, { type: "integer" }]))
        },
        dominantVote: {
            anyOf: [{ type: "string", enum: [...voteValueOrder] }, { type: "null" }]
        },
        currentVote: {
            anyOf: [{ type: "string", enum: [...voteValueOrder] }, { type: "null" }]
        },
        totalVotes: { type: "integer" },
        eventCount: { type: "integer" }
    },
    additionalProperties: false
} as const;

const voteEventSchema = {
    type: "object",
    required: ["tenantId", "promiseId", "userId", "previousValue", "newValue", "eventType", "createdAt"],
    properties: {
        tenantId: { type: "string" },
        promiseId: { type: "string" },
        userId: { type: "string" },
        previousValue: {
            anyOf: [{ type: "string", enum: [...voteValueOrder] }, { type: "null" }]
        },
        newValue: { type: "string", enum: [...voteValueOrder] },
        eventType: { type: "string", enum: ["created", "changed"] },
        createdAt: { type: "string", format: "date-time" },
        voteCategory: { type: "string", enum: ["verified", "unverified", "guest"] }
    },
    additionalProperties: false
} as const;

const voteResponseSchema = {
    type: "object",
    required: ["summary", "event"],
    properties: {
        summary: voteSummarySchema,
        event: {
            anyOf: [voteEventSchema, { type: "null" }]
        }
    },
    additionalProperties: false
} as const;

const promiseRecordSchema = {
    type: "object",
    required: [
        "id",
        "tenantId",
        "timelineSlug",
        "title",
        "description",
        "category",
        "jurisdiction",
        "election",
        "personParty",
        "status",
        "createdAt",
        "updatedAt",
        "sources",
        "statusHistory"
    ],
    properties: {
        id: { type: "string" },
        tenantId: { type: "string" },
        timelineSlug: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        category: { type: "string" },
        jurisdiction: { type: "string" },
        election: { type: "string" },
        personParty: { type: "string" },
        status: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        sources: { type: "array", items: { type: "object", additionalProperties: true } },
        statusHistory: {
            type: "array",
            items: {
                type: "object",
                required: ["previousStatus", "newStatus", "reason", "changedAt"],
                properties: {
                    previousStatus: {
                        anyOf: [{ type: "string" }, { type: "null" }]
                    },
                    newStatus: { type: "string" },
                    reason: { type: "string" },
                    changedAt: { type: "string", format: "date-time" }
                },
                additionalProperties: false
            }
        }
    },
    additionalProperties: false
} as const;

const createPromiseResponseSchema = {
    type: "object",
    required: ["promise", "tenantSlug", "timelineSlug"],
    properties: {
        promise: promiseRecordSchema,
        tenantSlug: { type: "string" },
        timelineSlug: { type: "string" }
    },
    additionalProperties: false
} as const;

const moderationReviewSchema = {
    type: "object",
    required: [
        "id",
        "tenantId",
        "subjectType",
        "subjectId",
        "reason",
        "status",
        "decision",
        "createdAt",
        "updatedAt",
        "assignedModeratorId",
        "metadata"
    ],
    properties: {
        id: { type: "string" },
        tenantId: { type: "string" },
        subjectType: { type: "string", enum: ["account", "vote", "source"] },
        subjectId: { type: "string" },
        reason: { type: "string" },
        status: { type: "string", enum: ["open", "in_review", "resolved"] },
        decision: {
            anyOf: [
                { type: "string", enum: ["approve_account", "limit_account", "dismiss"] },
                { type: "null" }
            ]
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        assignedModeratorId: {
            anyOf: [{ type: "string" }, { type: "null" }]
        },
        metadata: {
            type: "object",
            properties: {
                userId: { type: "string" },
                requestedState: { type: "string" },
                abuseSignals: { type: "array", items: { type: "string" } }
            },
            additionalProperties: false
        }
    },
    additionalProperties: false
} as const;

const moderationReviewResponseSchema = {
    type: "object",
    required: ["review"],
    properties: {
        review: moderationReviewSchema
    },
    additionalProperties: false
} as const;

const updateTenantLocalizationResponseSchema = {
    type: "object",
    required: ["tenantSlug", "defaultLocale"],
    properties: {
        tenantSlug: { type: "string" },
        defaultLocale: { type: "string", enum: ["en", "ta", "ml", "hi"] }
    },
    additionalProperties: false
} as const;

const reviewIdParamSchema = {
    type: "object",
    required: ["reviewId"],
    properties: {
        reviewId: { type: "string" }
    },
    additionalProperties: false
} as const;

function buildBodySchema(schema: Parameters<typeof zodToJsonSchema>[0]) {
    return zodToJsonSchema(schema, {
        target: "openApi3",
        $refStrategy: "none"
    });
}

const defaultErrorResponses = {
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema
} as const;

export const healthRouteSchema = {
    tags: ["system"],
    summary: "Health check",
    response: {
        200: healthResponseSchema
    }
} as const;

export const voteRouteSchema = {
    tags: ["votes"],
    summary: "Cast or change a vote",
    headers: userContextHeaderSchema,
    body: buildBodySchema(voteRequestSchema),
    response: {
        200: voteResponseSchema,
        409: errorResponseSchema,
        ...defaultErrorResponses
    }
} as const;

export const createPromiseRouteSchema = {
    tags: ["promises"],
    summary: "Create a promise",
    headers: userContextHeaderSchema,
    body: buildBodySchema(createPromiseRequestSchema),
    response: {
        201: createPromiseResponseSchema,
        ...defaultErrorResponses
    }
} as const;

export const resolveModerationRouteSchema = {
    tags: ["moderation"],
    summary: "Resolve a moderation review",
    headers: userContextHeaderSchema,
    params: reviewIdParamSchema,
    body: buildBodySchema(resolveModerationReviewRequestSchema),
    response: {
        200: moderationReviewResponseSchema,
        ...defaultErrorResponses
    }
} as const;

export const updateTenantLocalizationRouteSchema = {
    tags: ["tenants"],
    summary: "Update tenant default browsing language",
    headers: userContextHeaderSchema,
    body: buildBodySchema(updateTenantLocalizationRequestSchema),
    response: {
        200: updateTenantLocalizationResponseSchema,
        ...defaultErrorResponses
    }
} as const;

export function registerApiDocumentation(app: FastifyInstance) {
    const serverUrl = process.env.TRACK_PROMISES_API_BASE_URL ?? `http://localhost:${process.env.API_PORT ?? "4300"}`;

    app.register(swagger, {
        openapi: {
            openapi: "3.0.3",
            info: {
                title: "Track Promises API",
                version: "0.1.0",
                description: "Write-path API service for voting, promise administration, and moderation workflows."
            },
            servers: [{ url: serverUrl, description: "Local development" }],
            tags: [
                { name: "system", description: "Operational endpoints" },
                { name: "votes", description: "Vote submission endpoints" },
                { name: "promises", description: "Promise administration endpoints" },
                { name: "moderation", description: "Moderation workflow endpoints" },
                { name: "tenants", description: "Tenant settings endpoints" }
            ]
        }
    });

    app.register(swaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false
        }
    });
}