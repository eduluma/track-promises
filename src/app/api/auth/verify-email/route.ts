import { NextResponse } from "next/server";

import { consumeVerificationToken } from "@/modules/auth/verification-tokens";
import { getPersistedUserById, markPersistedUserEmailVerified } from "@/modules/auth/user-store";

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

    try {
        const dbUser = await getPersistedUserById(record.userId);

        if (!dbUser || dbUser.email.toLowerCase() !== record.email.toLowerCase()) {
            console.warn("[verify-email] Token subject did not match a persisted user:", record.userId);
            return redirect("/account?verified=invalid");
        }

        const updated = await markPersistedUserEmailVerified(record.userId, record.email);

        if (!updated) {
            console.warn("[verify-email] No user row updated for token subject:", record.userId);
            return redirect("/account?verified=error");
        }
    } catch (err) {
        console.error("[verify-email] DB update failed:", err);
        return redirect("/account?verified=error");
    }

    return redirect("/account?verified=1");
}
