import { describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";
import { createDbClient } from "@/db/client";
import { users } from "@/db/schema";
import { getModerationReviewById, resolveModerationReview } from "@/modules/moderation/reviews";
import { getTrustProfileForUser } from "@/modules/moderation/trust";

describe("moderation workflow", () => {
    it("builds trust profiles from review backlog, account age, and abuse signals", async () => {
        const profile = await getTrustProfileForUser("limited-user", "tenant-tamilnadu");

        expect(profile).not.toBeNull();
        expect(profile?.openReviewCount).toBeGreaterThan(0);
        expect(profile?.abuseFlags).toContain("velocity_anomaly");
    });

    it("resolves an account review and updates the underlying demo account", async () => {
        const updated = await resolveModerationReview({
            reviewId: "review-1",
            moderatorId: "moderator-user",
            decision: "approve_account",
            now: "2026-06-04T00:00:00.000Z"
        });

        expect(updated?.status).toBe("resolved");
        expect(updated?.decision).toBe("approve_account");

        const db = createDbClient();
        const [user] = await db.select().from(users).where(eq(users.id, "limited-user"));
        expect(user?.state).toBe("verified");
    });

    it("keeps vote reviews addressable by id", async () => {
        expect((await getModerationReviewById("review-2"))?.subjectType).toBe("vote");
    });
});