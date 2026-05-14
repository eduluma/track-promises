import { describe, expect, it } from "vitest";

import { canAccessTenant, canManagePromises, canReviewModeration, canUserVote, getVoteCategory } from "@/lib/permissions";

describe("permission rules", () => {
    it("allows verified and moderator-approved accounts to vote", () => {
        expect(
            canUserVote({
                id: "verified-user",
                email: "verified@example.com",
                emailVerified: true,
                state: "verified"
            })
        ).toBe(true);

        expect(
            canUserVote({
                id: "approved-user",
                email: "approved@example.com",
                emailVerified: true,
                state: "moderator_approved"
            })
        ).toBe(true);
    });

    it("blocks readonly accounts from voting even after email verification", () => {
        expect(
            canUserVote({
                id: "limited-user",
                email: "limited@example.com",
                emailVerified: true,
                state: "readonly"
            })
        ).toBe(false);
    });

    it("counts phone-verified accounts as verified votes once the account state is cleared", () => {
        expect(
            getVoteCategory({
                id: "phone-user",
                email: "phone:919876543210@signup.local",
                emailVerified: false,
                phoneVerified: true,
                state: "verified"
            })
        ).toBe("verified");
    });

    it("only allows promise_editor and admin roles to create promises", () => {
        expect(
            canManagePromises({
                id: "editor-user",
                emailVerified: true,
                state: "moderator_approved",
                role: "promise_editor"
            })
        ).toBe(true);

        expect(
            canManagePromises({
                id: "moderator-user",
                emailVerified: true,
                state: "moderator_approved",
                role: "moderator"
            })
        ).toBe(false);
    });

    it("restricts tenant access to assigned tenants unless the user is a platform admin", () => {
        expect(
            canAccessTenant(
                {
                    id: "tenant-editor",
                    emailVerified: true,
                    state: "moderator_approved",
                    role: "promise_editor",
                    tenantIds: ["tenant-tamilnadu"]
                },
                "tenant-tamilnadu"
            )
        ).toBe(true);

        expect(
            canAccessTenant(
                {
                    id: "tenant-editor",
                    emailVerified: true,
                    state: "moderator_approved",
                    role: "promise_editor",
                    tenantIds: ["tenant-tamilnadu"]
                },
                "tenant-india-2029"
            )
        ).toBe(false);

        expect(
            canAccessTenant(
                {
                    id: "platform-admin",
                    emailVerified: true,
                    state: "moderator_approved",
                    role: "platform_admin",
                    tenantIds: []
                },
                "tenant-india-2029"
            )
        ).toBe(true);
    });

    it("allows moderator roles to review moderation queues", () => {
        expect(
            canReviewModeration({
                id: "moderator-user",
                emailVerified: true,
                state: "moderator_approved",
                role: "moderator"
            })
        ).toBe(true);
    });
});