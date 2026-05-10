import type { ApiUserContext, CreatePromiseRequest, ResolveModerationReviewRequest, VoteRequest } from "@/modules/api/contracts";
import {
    handleCastVote,
    handleCreatePromise,
    handleResolveModerationReview,
    type ApiErrorPayload,
    type ApiHandlerResult,
    type CreatePromisePayload,
    type ResolveModerationPayload,
    type VotePayload
} from "@/modules/api/handlers";
import { API_USER_CONTEXT_HEADER, encodeApiUserContext } from "@/modules/api/user-context";

type WebApiClient = {
    castVote(body: unknown, user: ApiUserContext): Promise<ApiHandlerResult<VotePayload>>;
    createPromise(body: unknown, user: ApiUserContext): Promise<ApiHandlerResult<CreatePromisePayload>>;
    resolveModerationReview(
        reviewId: string,
        body: unknown,
        user: ApiUserContext
    ): Promise<ApiHandlerResult<ResolveModerationPayload>>;
};

function normalizeBaseUrl(baseUrl: string) {
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

async function postJson<TPayload>(path: string, body: unknown, user: ApiUserContext): Promise<ApiHandlerResult<TPayload>> {
    const baseUrl = normalizeBaseUrl(
        process.env.TRACK_PROMISES_API_BASE_URL ?? `http://localhost:${process.env.API_PORT ?? "4300"}`
    );
    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            [API_USER_CONTEXT_HEADER]: encodeApiUserContext(user)
        },
        body: JSON.stringify(body),
        cache: "no-store"
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
        ? ((await response.json()) as TPayload | ApiErrorPayload)
        : ({ error: "Unexpected API response." } satisfies ApiErrorPayload);

    return {
        status: response.status,
        payload
    };
}

function createLocalWebApiClient(): WebApiClient {
    return {
        async castVote(body: unknown, user: ApiUserContext) {
            return handleCastVote(body, user);
        },
        async createPromise(body: unknown, user: ApiUserContext) {
            return handleCreatePromise(body, user);
        },
        async resolveModerationReview(reviewId: string, body: unknown, user: ApiUserContext) {
            return handleResolveModerationReview(reviewId, body, user);
        }
    };
}

function createRemoteWebApiClient(): WebApiClient {
    return {
        async castVote(body: unknown, user: ApiUserContext) {
            return postJson<VotePayload>("/votes", body, user);
        },
        async createPromise(body: unknown, user: ApiUserContext) {
            return postJson<CreatePromisePayload>("/admin/promises", body, user);
        },
        async resolveModerationReview(reviewId: string, body: unknown, user: ApiUserContext) {
            return postJson<ResolveModerationPayload>(`/admin/moderation/reviews/${reviewId}`, body, user);
        }
    };
}

export function getWebApiClient(): WebApiClient {
    return process.env.TRACK_PROMISES_API_TRANSPORT === "remote" ? createRemoteWebApiClient() : createLocalWebApiClient();
}

export type { WebApiClient, VoteRequest, CreatePromiseRequest, ResolveModerationReviewRequest };