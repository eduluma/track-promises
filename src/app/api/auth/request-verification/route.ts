import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { sendEmail } from "@/lib/email";
import { authOptions } from "@/modules/auth/options";
import { createVerificationToken } from "@/modules/auth/verification-tokens";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
        }

        // All needed data is already in the JWT — no DB query required.
        const { id, email, name, emailVerified } = session.user;

        if (!email) {
            return NextResponse.json({ ok: false, error: "No email address on account." }, { status: 400 });
        }

        if (emailVerified) {
            return NextResponse.json({ ok: false, error: "Email is already verified." }, { status: 400 });
        }

        const token = createVerificationToken(id, email);
        const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3300";
        const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

        await sendEmail({
            to: email,
            subject: "Verify your Track Promises account",
            html: `
                <p>Hi ${name ?? email},</p>
                <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
                <p><a href="${verifyUrl}" style="color:#2d6a4f;font-weight:bold;">Verify email</a></p>
                <p>Or copy this URL into your browser:<br>${verifyUrl}</p>
                <p>If you didn't create this account, ignore this email.</p>
            `
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[request-verification] error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
