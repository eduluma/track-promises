import { computeUserScore } from "@/modules/moderation/community-score";
import { listModerationReviewsForTenant } from "@/modules/moderation/reviews";
import { isVerifiedAccount } from "@/modules/auth/identifiers";
import { getPersistedUserById } from "@/modules/auth/user-store";

export type TrustSignal = {
    label: string;
    delta: number;
    description: string;
};

export type TrustProfile = {
    userId: string;
    displayName: string;
    currentScore: number;
    recommendedScore: number;
    communityScore: number;
    promotionThreshold: number;
    windowDays: number;
    band: "high" | "medium" | "low";
    communityEligible: boolean;
    openReviewCount: number;
    signals: TrustSignal[];
    abuseFlags: string[];
};

function getTrustBand(score: number): TrustProfile["band"] {
    if (score >= 70) {
        return "high";
    }

    if (score >= 30) {
        return "medium";
    }

    return "low";
}

export async function getTrustProfileForUser(userId: string, tenantId: string) {
    const user = await getPersistedUserById(userId);

    if (!user) {
        return null;
    }

    const accountAgeDays = Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const allReviews = await listModerationReviewsForTenant(tenantId);
    const openReviewCount = allReviews.filter(
        (review) => review.status !== "resolved" && (review.metadata.userId === userId || review.subjectId === userId)
    ).length;
    const abuseFlags = Array.from(
        new Set(
            allReviews.flatMap((review) =>
                review.metadata.userId === userId || review.subjectId === userId
                    ? (review.metadata.abuseSignals ?? [])
                    : []
            )
        )
    );

    const signals: TrustSignal[] = [
        {
            label: "Verification path",
            delta: isVerifiedAccount(user) ? 15 : -20,
            description: isVerifiedAccount(user)
                ? "Verified contact details or community attestation helps the account count as trusted."
                : "Votes stay unverified until a contact method or community attestation clears the account."
        },
        {
            label: "Account age",
            delta: accountAgeDays >= 90 ? 20 : accountAgeDays >= 30 ? 10 : 0,
            description: `${accountAgeDays} days since account creation.`
        },
        {
            label: "Account state",
            delta: user.state === "moderator_approved" ? 20 : user.state === "verified" ? 10 : user.state === "readonly" ? -25 : -10,
            description: `Current state is ${user.state.replaceAll("_", " ")}.`
        },
        {
            label: "Open moderation reviews",
            delta: openReviewCount === 0 ? 5 : -15 * openReviewCount,
            description: `${openReviewCount} open moderation review${openReviewCount === 1 ? "" : "s"}.`
        },
        {
            label: "Abuse flags",
            delta: abuseFlags.length === 0 ? 5 : -10 * abuseFlags.length,
            description: abuseFlags.length === 0 ? "No abuse flags recorded." : abuseFlags.join(", ")
        }
    ];

    const recommendedScore = signals.reduce((total, signal) => total + signal.delta, 0);

    // Fetch rolling-window community score
    const communityBreakdown = await computeUserScore(userId, tenantId);

    return {
        userId: user.id,
        displayName: user.displayName,
        currentScore: user.trustScore,
        recommendedScore,
        communityScore: communityBreakdown.totalScore,
        promotionThreshold: communityBreakdown.promotionThreshold,
        windowDays: communityBreakdown.windowDays,
        communityEligible: communityBreakdown.eligible,
        band: getTrustBand(recommendedScore),
        openReviewCount,
        signals,
        abuseFlags
    };
}