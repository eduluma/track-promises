import { describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { createDbClient } from "@/db/client";
import { users } from "@/db/schema";
import {
    createCommunityAttestationRequest,
    submitCommunityAttestation
} from "@/modules/auth/community-attestations";
import { createPersistedUser, resolvePersistedUserIdentity } from "@/modules/auth/user-store";

describe("community attestation workflow", () => {
    it("auto-approves an account after two local moderator-approved witnesses", async () => {
        const targetId = `attestation-target-${crypto.randomUUID().slice(0, 8)}`;

        await createPersistedUser({
            id: targetId,
            email: `${targetId}@example.com`,
            displayName: "Attestation Target",
            passwordHash: "hash-not-used"
        });

        const request = await createCommunityAttestationRequest({
            tenantId: "tenant-tamilnadu",
            userId: targetId,
            city: "Chennai",
            locality: "Velachery",
            postalCode: "600042",
            address: "12 Lake View Road, near ward office",
            statement: "Known in the neighborhood and local civic meetings."
        });

        expect(request).not.toBeNull();
        expect(request?.status).toBe("open");
        expect(request?.request.address).toBe("12 Lake View Road, near ward office");

        const firstWitness = await submitCommunityAttestation({
            reviewId: request!.reviewId,
            witnessUserId: "editor-user",
            relationship: "neighbor",
            city: "Chennai",
            locality: "Velachery",
            postalCode: "600042",
            note: "We volunteer in the same ward meetings."
        });

        expect(firstWitness?.localityMatchedWitnessCount).toBe(1);
        expect(firstWitness?.status).toBe("open");

        const secondWitness = await submitCommunityAttestation({
            reviewId: request!.reviewId,
            witnessUserId: "moderator-user",
            relationship: "family_friend",
            city: "Chennai",
            locality: "Velachery",
            postalCode: "600042",
            note: "Known to our family for years."
        });

        expect(secondWitness?.localityMatchedWitnessCount).toBe(2);
        expect(secondWitness?.status).toBe("resolved");
        expect(secondWitness?.decision).toBe("approve_account");

        const db = createDbClient();
        const [user] = await db.select().from(users).where(eq(users.id, targetId));
        expect(user?.state).toBe("moderator_approved");
    });

    it("allows an already verified user to request promotion for local attestation", async () => {
        const targetId = `attestation-promote-${crypto.randomUUID().slice(0, 8)}`;

        await createPersistedUser({
            id: targetId,
            email: `${targetId}@example.com`,
            displayName: "Promotion Candidate",
            passwordHash: "hash-not-used",
            emailVerified: true,
            state: "verified"
        });

        const request = await createCommunityAttestationRequest({
            tenantId: "tenant-tamilnadu",
            userId: targetId,
            city: "Chennai",
            locality: "Velachery",
            postalCode: "600042",
            address: "Ward 178, near bus stand",
            statement: "Requesting promotion so I can verify nearby accounts."
        });

        expect(request).not.toBeNull();
        expect(request?.status).toBe("open");
        expect(request?.subjectUserId).toBe(targetId);
    });

    it("falls back to session email when the session id is stale", async () => {
        const targetId = `attestation-fallback-${crypto.randomUUID().slice(0, 8)}`;

        const createdUser = await createPersistedUser({
            id: targetId,
            email: `${targetId}@example.com`,
            displayName: "Fallback User",
            passwordHash: "hash-not-used"
        });

        const resolvedUser = await resolvePersistedUserIdentity({
            id: "stale-session-id",
            email: createdUser.email.toUpperCase()
        });

        expect(resolvedUser?.id).toBe(createdUser.id);
        expect(resolvedUser?.email).toBe(createdUser.email);
    });
});
