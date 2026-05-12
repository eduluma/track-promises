import { NextResponse } from "next/server";

import { createDbClient } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setEmailVerified } from "@/modules/auth/demo-users";
import { consumeVerificationToken } from "@/modules/auth/verification-tokens";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") ?? "";

    // Use NEXTAUTH_URL as the redirect base — request.url reflects the internal
    // bind address (0.0.0.0) which differs from the public-facing hostname.
    const baseUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3300").replace(/\/$/, "");
    const redirect = (path: string) => NextResponse.redirect(`${baseUrl}${path}`);

    const record = consumeVerificationToken(token);

    if (!record) {
        return redirect("/account?verified=invalid");
    }

    // Update in-memory store for demo users
    setEmailVerified(record.userId);

    // Update DB (best-effort — ECONNREFUSED in Next.js dev process is a known issue)
    try {
        const db = createDbClient();
        await db
            .update(users)
            .set({ emailVerified: true, state: "verified" })
            .where(eq(users.id, record.userId));
    } catch (err) {
        console.warn("[verify-email] DB update failed (best-effort):", (err as Error).message);
    }

    return redirect("/account?verified=1");
}
