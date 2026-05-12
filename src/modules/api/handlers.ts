import { canAccessTenant, canManagePromises, canReviewModeration } from "@/lib/permissions";
import {
    createPromiseRequestSchema,
    resolveModerationReviewRequestSchema,
    voteRequestSchema,
    type ApiUserContext,
    type CreatePromiseRequest,
    type ResolveModerationReviewRequest
} from "@/modules/api/contracts";
import { getModerationReviewById, resolveModerationReview, type ModerationReview } from "@/modules/moderation/reviews";
import { createPromise } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";
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

type VotePayload = ReturnType<typeof castVote>;
type CreatePromisePayload = { promise: ReturnType<typeof createPromise>; tenantSlug: string; timelineSlug: string };
type ResolveModerationPayload = { review: ModerationReview };

function unauthorized(message: string): ApiHandlerResult<never> {
    return {
        status: 401,
        payload: {
            error: message
        }
    };
}

export function handleCastVote(body: unknown, user: ApiUserContext | null): ApiHandlerResult<VotePayload> {
    const parsed = voteRequestSchema.safeParse(body);

    if (!parsed.success) {
        return { status: 400, payload: { error: "Invalid vote payload." } };
    }

    const tenant = getTenantBySlug(parsed.data.tenantSlug);

    if (!tenant) {
        return { status: 404, payload: { error: "Unknown tenant." } };
    }

    // Registered non-guest users must belong to the tenant (or be platform_admin).
    // Guest users (role === "guest" or no user) may vote in any tenant.
    const isGuest = !user || user.role === "guest";
    if (!isGuest && !canAccessTenant(user, tenant.id)) {
        return { status: 403, payload: { error: "This account cannot vote in that tenant." } };
    }

    try {
        return {
            status: 200,
            payload: castVote({
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

export function handleCreatePromise(body: unknown, user: ApiUserContext | null): ApiHandlerResult<CreatePromisePayload> {
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

function createPromiseForTenant(
    body: CreatePromiseRequest,
    user: ApiUserContext
): ApiHandlerResult<CreatePromisePayload> {
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

    const promise = createPromise({
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

export function handleResolveModerationReview(
    reviewId: string,
    body: unknown,
    user: ApiUserContext | null
): ApiHandlerResult<ResolveModerationPayload> {
    if (!user) {
        return unauthorized("Sign in is required.");
    }

    if (!canReviewModeration(user)) {
        return { status: 403, payload: { error: "This account cannot review moderation items." } };
    }

    const review = getModerationReviewById(reviewId);

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

function resolveModerationReviewForUser(
    reviewId: string,
    body: ResolveModerationReviewRequest,
    user: ApiUserContext
): ApiHandlerResult<ResolveModerationPayload> {
    const review = resolveModerationReview({
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

export type { ApiErrorPayload, ApiHandlerResult, CreatePromisePayload, ResolveModerationPayload, VotePayload };