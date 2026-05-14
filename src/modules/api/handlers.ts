import { canAccessTenant, canManagePromises, canReviewModeration } from "@/lib/permissions";
import {
    createPromiseRequestSchema,
    resolveModerationReviewRequestSchema,
    updateTenantLocalizationRequestSchema,
    voteRequestSchema,
    type ApiUserContext,
    type CreatePromiseRequest,
    type ResolveModerationReviewRequest,
    type UpdateTenantLocalizationRequest
} from "@/modules/api/contracts";
import { getModerationReviewById, resolveModerationReview, type ModerationReview } from "@/modules/moderation/reviews";
import { createPromise } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";
import { TenantSettingsError, updateTenantDefaultLocale } from "@/modules/tenants/settings";
import { getTimelineBySlug } from "@/modules/timelines/data";
import { VoteError, castVote } from "@/modules/voting/service";

type ApiErrorPayload = {
    error: string;
    code?: string;
};

type ApiHandlerResult<TPayload> = {
    status: number;
    payload: TPayload | ApiErrorPayload;
};

type VotePayload = Awaited<ReturnType<typeof castVote>>;
type CreatePromisePayload = { promise: Awaited<ReturnType<typeof createPromise>>; tenantSlug: string; timelineSlug: string };
type ResolveModerationPayload = { review: ModerationReview };
type UpdateTenantLocalizationPayload = { tenantSlug: string; defaultLocale: string };

function unauthorized(message: string): ApiHandlerResult<never> {
    return {
        status: 401,
        payload: {
            error: message
        }
    };
}

export async function handleCastVote(body: unknown, user: ApiUserContext | null): Promise<ApiHandlerResult<VotePayload>> {
    const parsed = voteRequestSchema.safeParse(body);

    if (!parsed.success) {
        return { status: 400, payload: { error: "Invalid vote payload." } };
    }

    const tenant = getTenantBySlug(parsed.data.tenantSlug);

    if (!tenant) {
        return { status: 404, payload: { error: "Unknown tenant." } };
    }

    try {
        return {
            status: 200,
            payload: await castVote({
                tenantId: tenant.id,
                promiseId: parsed.data.promiseId,
                user: user ?? null,
                value: parsed.data.value
            })
        };
    } catch (error) {
        if (error instanceof VoteError) {
            return {
                status: error.status,
                payload: {
                    error: error.message,
                    code: error.code
                }
            };
        }

        throw error;
    }
}

export async function handleCreatePromise(body: unknown, user: ApiUserContext | null): Promise<ApiHandlerResult<CreatePromisePayload>> {
    if (!user) {
        return unauthorized("Sign in is required.");
    }

    if (!canManagePromises(user)) {
        return { status: 403, payload: { error: "This account cannot create promises." } };
    }

    const parsed = createPromiseRequestSchema.safeParse(body);

    if (!parsed.success) {
        return { status: 400, payload: { error: "Invalid promise payload." } };
    }

    return createPromiseForTenant(parsed.data, user);
}

async function createPromiseForTenant(
    body: CreatePromiseRequest,
    user: ApiUserContext
): Promise<ApiHandlerResult<CreatePromisePayload>> {
    const tenant = getTenantBySlug(body.tenantSlug);

    if (!tenant) {
        return { status: 404, payload: { error: "Unknown tenant." } };
    }

    if (!canAccessTenant(user, tenant.id)) {
        return { status: 403, payload: { error: "This account cannot manage that tenant." } };
    }

    const timeline = getTimelineBySlug(tenant.id, body.timelineSlug);

    if (!timeline) {
        return { status: 404, payload: { error: "Unknown timeline." } };
    }

    const promise = await createPromise({
        tenantId: tenant.id,
        timelineSlug: timeline.slug,
        title: body.title,
        description: body.description,
        category: body.category,
        jurisdiction: body.jurisdiction,
        election: body.election,
        personParty: body.personParty,
        status: body.status,
        actorId: user.id
    });

    return {
        status: 201,
        payload: {
            promise,
            tenantSlug: tenant.slug,
            timelineSlug: timeline.slug
        }
    };
}

export async function handleResolveModerationReview(
    reviewId: string,
    body: unknown,
    user: ApiUserContext | null
): Promise<ApiHandlerResult<ResolveModerationPayload>> {
    if (!user) {
        return unauthorized("Sign in is required.");
    }

    if (!canReviewModeration(user)) {
        return { status: 403, payload: { error: "This account cannot review moderation items." } };
    }

    const review = await getModerationReviewById(reviewId);

    if (!review) {
        return { status: 404, payload: { error: "Unknown moderation review." } };
    }

    if (!canAccessTenant(user, review.tenantId)) {
        return { status: 403, payload: { error: "This account cannot access that tenant." } };
    }

    const parsed = resolveModerationReviewRequestSchema.safeParse(body);

    if (!parsed.success) {
        return { status: 400, payload: { error: "Invalid moderation payload." } };
    }

    return resolveModerationReviewForUser(reviewId, parsed.data, user);
}

export async function handleUpdateTenantLocalization(
    body: unknown,
    user: ApiUserContext | null
): Promise<ApiHandlerResult<UpdateTenantLocalizationPayload>> {
    if (!user) {
        return unauthorized("Sign in is required.");
    }

    if (!canManagePromises(user)) {
        return { status: 403, payload: { error: "This account cannot manage tenant settings." } };
    }

    const parsed = updateTenantLocalizationRequestSchema.safeParse(body);

    if (!parsed.success) {
        return { status: 400, payload: { error: "Invalid tenant localization payload." } };
    }

    return updateTenantLocalizationForUser(parsed.data, user);
}

async function resolveModerationReviewForUser(
    reviewId: string,
    body: ResolveModerationReviewRequest,
    user: ApiUserContext
): Promise<ApiHandlerResult<ResolveModerationPayload>> {
    const review = await resolveModerationReview({
        reviewId,
        moderatorId: user.id,
        decision: body.decision
    });

    if (!review) {
        return { status: 400, payload: { error: "Unable to update review." } };
    }

    return {
        status: 200,
        payload: {
            review
        }
    };
}

async function updateTenantLocalizationForUser(
    body: UpdateTenantLocalizationRequest,
    user: ApiUserContext
): Promise<ApiHandlerResult<UpdateTenantLocalizationPayload>> {
    const tenant = getTenantBySlug(body.tenantSlug);

    if (!tenant) {
        return { status: 404, payload: { error: "Unknown tenant." } };
    }

    if (!canAccessTenant(user, tenant.id)) {
        return { status: 403, payload: { error: "This account cannot manage that tenant." } };
    }

    try {
        const updatedTenant = await updateTenantDefaultLocale({
            tenantId: tenant.id,
            defaultLocale: body.defaultLocale,
            actorId: user.id
        });

        return {
            status: 200,
            payload: {
                tenantSlug: updatedTenant.slug,
                defaultLocale: updatedTenant.defaultLocale
            }
        };
    } catch (error) {
        if (error instanceof TenantSettingsError) {
            return {
                status: error.status,
                payload: {
                    error: error.message,
                    code: error.code
                }
            };
        }

        throw error;
    }
}

export type {
    ApiErrorPayload,
    ApiHandlerResult,
    CreatePromisePayload,
    ResolveModerationPayload,
    UpdateTenantLocalizationPayload,
    VotePayload
};