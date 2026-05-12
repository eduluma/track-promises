import { NextResponse } from "next/server";

import { createDbClient } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setEmailVerified } from "@/modules/auth/demo-users";
import { consumeVerificationToken } from "@/modules/auth/verification-tokens";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") ?? "";

    const record = consumeVerificationToken(token);

    if (!record) {
        return NextResponse.redirect(
            new URL("/account?verified=invalid", request.url)
        );
    }

    // Update in-memory store
    const ok = setEmailVerified(record.userId);

    if (!ok) {
        return NextResponse.redirect(new URL("/account?verified=error", request.url));
    }

    // Update DB (best-effort)
    try {
        const db = createDbClient();
        await db
            .update(users)
            .set({ emailVerified: true, state: "verified" })
            .where(eq(users.id, record.userId));
    } catch (err) {
        console.warn("[verify-email] DB update failed:", err);
    }

    return NextResponse.redirect(new URL("/account?verified=1", request.url));
}
