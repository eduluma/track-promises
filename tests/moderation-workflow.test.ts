import { describe, expect, it } from "vitest";

import { getDemoUserById } from "@/modules/auth/demo-users";
import { getModerationReviewById, resolveModerationReview } from "@/modules/moderation/reviews";
import { getTrustProfileForUser } from "@/modules/moderation/trust";

describe("moderation workflow", () => {
    it("builds trust profiles from review backlog, account age, and abuse signals", () => {
        const profile = getTrustProfileForUser("limited-user", "tenant-tamilnadu");

        expect(profile).not.toBeNull();
        expect(profile?.openReviewCount).toBeGreaterThan(0);
        expect(profile?.abuseFlags).toContain("velocity_anomaly");
    });

    it("resolves an account review and updates the underlying demo account", () => {
        const updated = resolveModerationReview({
            reviewId: "review-1",
            moderatorId: "moderator-user",
            decision: "approve_account",
            now: "2026-06-04T00:00:00.000Z"
        });

        expect(updated?.status).toBe("resolved");
        expect(updated?.decision).toBe("approve_account");
        expect(getDemoUserById("limited-user")?.state).toBe("verified");
    });

    it("keeps vote reviews addressable by id", () => {
        expect(getModerationReviewById("review-2")?.subjectType).toBe("vote");
    });
});