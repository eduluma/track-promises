import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";

import {
    handleCastVote,
    handleCreatePromise,
    handleResolveModerationReview,
    type ApiHandlerResult
} from "@/modules/api/handlers";
import { API_USER_CONTEXT_HEADER, decodeApiUserContext } from "@/modules/api/user-context";

function getRequestUser(request: FastifyRequest) {
    const rawHeader = request.headers[API_USER_CONTEXT_HEADER];
    const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    return decodeApiUserContext(headerValue);
}

function sendResult(reply: FastifyReply, result: ApiHandlerResult<unknown>) {
    return reply.code(result.status).send(result.payload);
}

export function buildApiApp() {
    const app = Fastify({ logger: false });

    app.get("/health", async () => ({ status: "ok", service: "track-promises-api" }));

    app.post("/votes", async (request, reply) => {
        return sendResult(reply, handleCastVote(request.body, getRequestUser(request)));
    });

    app.post("/admin/promises", async (request, reply) => {
        return sendResult(reply, handleCreatePromise(request.body, getRequestUser(request)));
    });

    app.post("/admin/moderation/reviews/:reviewId", async (request, reply) => {
        const params = request.params as { reviewId: string };

        return sendResult(reply, handleResolveModerationReview(params.reviewId, request.body, getRequestUser(request)));
    });

    return app;
}