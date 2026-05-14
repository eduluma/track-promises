import { NextResponse } from "next/server";

import { getWebApiClient } from "@/modules/api/client";
import { getCurrentUser } from "@/modules/auth/session";

export async function POST(request: Request) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
    }

    const body = await request.json();
    const result = await getWebApiClient().updateTenantLocalization(body, user);

    return NextResponse.json(result.payload, { status: result.status });
}