import { getDemoUserById } from "@/modules/auth/demo-users";
import { listModerationReviewsForTenant } from "@/modules/moderation/reviews";

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
    band: "high" | "medium" | "low";
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

export function getTrustProfileForUser(userId: string, tenantId: string) {
    const user = getDemoUserById(userId);

    if (!user) {
        return null;
    }

    const accountAgeDays = Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const openReviewCount = listModerationReviewsForTenant(tenantId).filter(
        (review) => review.status !== "resolved" && (review.metadata.userId === userId || review.subjectId === userId)
    ).length;

    const signals: TrustSignal[] = [
        {
            label: "Email verification",
            delta: user.emailVerified ? 15 : -20,
            description: user.emailVerified ? "Voting starts only after verified email." : "Unverified email blocks voting."
        },
        {
            label: "Account age",
            delta: accountAgeDays >= 90 ? 20 : accountAgeDays >= 30 ? 10 : 0,
            description: `${accountAgeDays} days since account creation.`
        },
        {
            label: "Account state",
            delta: user.state === "moderator_approved" ? 20 : user.state === "verified" ? 10 : user.state === "limited" ? -25 : -10,
            description: `Current state is ${user.state.replaceAll("_", " ")}.`
        },
        {
            label: "Open moderation reviews",
            delta: openReviewCount === 0 ? 5 : -15 * openReviewCount,
            description: `${openReviewCount} open moderation review${openReviewCount === 1 ? "" : "s"}.`
        },
        {
            label: "Abuse flags",
            delta: user.abuseFlags.length === 0 ? 5 : -10 * user.abuseFlags.length,
            description: user.abuseFlags.length === 0 ? "No abuse flags recorded." : user.abuseFlags.join(", ")
        }
    ];

    const recommendedScore = signals.reduce((total, signal) => total + signal.delta, 0);

    return {
        userId: user.id,
        displayName: user.displayName,
        currentScore: user.trustScore,
        recommendedScore,
        band: getTrustBand(recommendedScore),
        openReviewCount,
        signals,
        abuseFlags: user.abuseFlags
    };
}