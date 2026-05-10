import { afterAll, describe, expect, it } from "vitest";

import { buildApiApp } from "../apps/api/src/app";
import { encodeApiUserContext, API_USER_CONTEXT_HEADER } from "@/modules/api/user-context";
import { getDemoUserById } from "@/modules/auth/demo-users";

const app = buildApiApp();

afterAll(async () => {
    await app.close();
});

function getEncodedUser(userId: string) {
    const user = getDemoUserById(userId);

    if (!user) {
        throw new Error(`Expected demo user ${userId} to exist.`);
    }

    return encodeApiUserContext(user);
}

describe("Fastify API service", () => {
    it("serves a health endpoint", async () => {
        const response = await app.inject({ method: "GET", url: "/health" });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: "ok", service: "track-promises-api" });
    });

    it("serves an OpenAPI document for the write endpoints", async () => {
        const response = await app.inject({ method: "GET", url: "/openapi.json" });

        expect(response.statusCode).toBe(200);

        const payload = response.json();
        expect(payload.openapi).toBe("3.0.3");
        expect(payload.paths["/votes"]).toBeDefined();
        expect(payload.paths["/admin/promises"]).toBeDefined();
        expect(payload.paths["/admin/moderation/reviews/{reviewId}"]).toBeDefined();
    });

    it("casts a vote through the API service", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/votes",
            headers: {
                [API_USER_CONTEXT_HEADER]: getEncodedUser("demo-user")
            },
            payload: {
                tenantSlug: "tamilnadu",
                promiseId: "promise-power",
                value: "up"
            }
        });

        expect(response.statusCode).toBe(200);

        const payload = response.json();
        expect(payload.summary.currentVote).toBe("up");
        expect(typeof payload.summary.score).toBe("number");
    });

    it("creates a promise through the API service", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/admin/promises",
            headers: {
                [API_USER_CONTEXT_HEADER]: getEncodedUser("editor-user")
            },
            payload: {
                tenantSlug: "tamilnadu",
                timelineSlug: "2026",
                title: "Build coastal resilience dashboard",
                description: "Launch a public dashboard that tracks coastal resilience projects and delivery milestones.",
                category: "Infrastructure",
                jurisdiction: "Tamil Nadu",
                election: "2026 Assembly",
                personParty: "Example Party",
                status: "planned"
            }
        });

        expect(response.statusCode).toBe(201);

        const payload = response.json();
        expect(payload.tenantSlug).toBe("tamilnadu");
        expect(payload.timelineSlug).toBe("2026");
        expect(payload.promise.title).toBe("Build coastal resilience dashboard");
    });
});