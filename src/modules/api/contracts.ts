import { z } from "zod";

import { promiseStatusSchema } from "@/config/schemas";
import { localeSchema } from "@/modules/i18n/config";
import { voteValueOrder } from "@/modules/voting/assessment";

const accountStateValues = ["unverified", "verified", "readonly", "suspended", "moderator_approved"] as const;
const userRoleValues = ["guest", "user", "promise_editor", "moderator", "tenant_admin", "platform_admin"] as const;

export const apiUserContextSchema = z.object({
    id: z.string().min(1),
    email: z.string().email().nullable().optional(),
    emailVerified: z.boolean(),
    phoneVerified: z.boolean().default(false),
    state: z.enum(accountStateValues),
    role: z.enum(userRoleValues).optional(),
    tenantIds: z.array(z.string()).default([])
});

export const voteRequestSchema = z.object({
    promiseId: z.string().min(1),
    tenantSlug: z.string().min(1),
    value: z.enum(voteValueOrder)
});

export const createPromiseRequestSchema = z.object({
    tenantSlug: z.string().min(1),
    timelineSlug: z.string().min(1),
    title: z.string().min(5),
    description: z.string().min(20),
    category: z.string().min(1),
    jurisdiction: z.string().min(2),
    election: z.string().min(2),
    personParty: z.string().min(2),
    status: promiseStatusSchema
});

export const resolveModerationReviewRequestSchema = z.object({
    decision: z.enum(["approve_account", "limit_account", "dismiss"])
});

export const updateTenantLocalizationRequestSchema = z.object({
    tenantSlug: z.string().min(1),
    defaultLocale: localeSchema
});

export type ApiUserContext = z.infer<typeof apiUserContextSchema>;
export type VoteRequest = z.infer<typeof voteRequestSchema>;
export type CreatePromiseRequest = z.infer<typeof createPromiseRequestSchema>;
export type ResolveModerationReviewRequest = z.infer<typeof resolveModerationReviewRequestSchema>;
export type UpdateTenantLocalizationRequest = z.infer<typeof updateTenantLocalizationRequestSchema>;