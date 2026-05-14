import { NextResponse } from "next/server";
import { z } from "zod";

import { sendEmail } from "@/lib/email";
import { isSyntheticIdentifierEmail } from "@/modules/auth/identifiers";
import { createPasswordResetToken } from "@/modules/auth/password-reset-tokens";
import { getPersistedUserByEmail } from "@/modules/auth/user-store";

const requestPasswordResetSchema = z.object({
    email: z.string().email()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = requestPasswordResetSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
        }

        const dbUser = await getPersistedUserByEmail(parsed.data.email);

        if (dbUser && dbUser.emailVerified && !isSyntheticIdentifierEmail(dbUser.email)) {
            const token = createPasswordResetToken(dbUser.id, dbUser.email);
            const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3300";
            const resetUrl = `${baseUrl}/reset-password?token=${token}`;

            await sendEmail({
                to: dbUser.email,
                subject: "Reset your Track Promises password",
                html: `
                    <p>Hi ${dbUser.displayName ?? dbUser.email},</p>
                    <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
                    <p><a href="${resetUrl}" style="color:#2d6a4f;font-weight:bold;">Reset password</a></p>
                    <p>Or copy this URL into your browser:<br>${resetUrl}</p>
                    <p>If you did not request this reset, you can ignore this email.</p>
                `
            });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[request-password-reset] error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}