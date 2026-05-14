import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";

import {
    handleCastVote,
    handleCreatePromise,
    handleResolveModerationReview,
    handleUpdateTenantLocalization,
    type ApiHandlerResult
} from "@/modules/api/handlers";
import { API_USER_CONTEXT_HEADER, decodeApiUserContext } from "@/modules/api/user-context";
import {
    createPromiseRouteSchema,
    healthRouteSchema,
    registerApiDocumentation,
    resolveModerationRouteSchema,
    updateTenantLocalizationRouteSchema,
    voteRouteSchema
} from "./openapi";

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

    app.register((api, _options, done) => {
        registerApiDocumentation(api);

        api.after(() => {
            api.get("/health", { schema: healthRouteSchema }, async () => ({ status: "ok", service: "track-promises-api" }));

            api.get("/openapi.json", { schema: { hide: true } }, async () => {
                return api.swagger();
            });

            api.post("/votes", { schema: voteRouteSchema }, async (request, reply) => {
                return sendResult(reply, await handleCastVote(request.body, getRequestUser(request)));
            });

            api.post("/admin/promises", { schema: createPromiseRouteSchema }, async (request, reply) => {
                return sendResult(reply, await handleCreatePromise(request.body, getRequestUser(request)));
            });

            api.post("/admin/moderation/reviews/:reviewId", { schema: resolveModerationRouteSchema }, async (request, reply) => {
                const params = request.params as { reviewId: string };

                return sendResult(reply, await handleResolveModerationReview(params.reviewId, request.body, getRequestUser(request)));
            });

            api.post("/admin/tenants/localization", { schema: updateTenantLocalizationRouteSchema }, async (request, reply) => {
                return sendResult(reply, await handleUpdateTenantLocalization(request.body, getRequestUser(request)));
            });
        });

        done();
    });

    return app;
}