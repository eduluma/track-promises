import { NextResponse } from "next/server";

import { getWebApiClient } from "@/modules/api/client";
import { getCurrentUser } from "@/modules/auth/session";

type ReviewRouteProps = {
    params: Promise<{ reviewId: string }>;
};

export async function POST(request: Request, { params }: ReviewRouteProps) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
    }

    const { reviewId } = await params;
    const body = await request.json();
    const result = await getWebApiClient().resolveModerationReview(reviewId, body, user);

    return NextResponse.json(result.payload, { status: result.status });
}