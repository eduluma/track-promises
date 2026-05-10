import { NextResponse } from "next/server";
import { z } from "zod";

import { canAccessTenant, canReviewModeration } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getModerationReviewById, resolveModerationReview } from "@/modules/moderation/reviews";

const resolveReviewSchema = z.object({
    decision: z.enum(["approve_account", "limit_account", "dismiss"])
});

type ReviewRouteProps = {
    params: Promise<{ reviewId: string }>;
};

export async function POST(request: Request, { params }: ReviewRouteProps) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
    }

    if (!canReviewModeration(user)) {
        return NextResponse.json({ error: "This account cannot review moderation items." }, { status: 403 });
    }

    const { reviewId } = await params;
    const review = getModerationReviewById(reviewId);

    if (!review) {
        return NextResponse.json({ error: "Unknown moderation review." }, { status: 404 });
    }

    if (!canAccessTenant(user, review.tenantId)) {
        return NextResponse.json({ error: "This account cannot access that tenant." }, { status: 403 });
    }

    const parsed = resolveReviewSchema.safeParse(await request.json());

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid moderation payload." }, { status: 400 });
    }

    const updatedReview = resolveModerationReview({
        reviewId,
        moderatorId: user.id,
        decision: parsed.data.decision
    });

    if (!updatedReview) {
        return NextResponse.json({ error: "Unable to update review." }, { status: 400 });
    }

    return NextResponse.json({ review: updatedReview });
}