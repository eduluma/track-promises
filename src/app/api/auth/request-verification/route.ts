import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { sendEmail } from "@/lib/email";
import { sendPhoneVerificationCode } from "@/lib/phone";
import { isSyntheticIdentifierEmail } from "@/modules/auth/identifiers";
import { authOptions } from "@/modules/auth/options";
import {
    createPhoneVerificationCode,
    createPhoneVerificationToken,
    PHONE_VERIFICATION_COOKIE
} from "@/modules/auth/phone-verification-tokens";
import { createVerificationToken } from "@/modules/auth/verification-tokens";
import { getPersistedUserById } from "@/modules/auth/user-store";

const requestVerificationSchema = z.object({
    channel: z.enum(["email", "phone"]).optional()
});

export async function POST(request: Request) {
    try {
        let rawBody: unknown = {};

        try {
            rawBody = await request.json();
        } catch {
            rawBody = {};
        }

        const parsed = requestVerificationSchema.safeParse(rawBody);

        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "Invalid verification request." }, { status: 400 });
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
        }

        const dbUser = await getPersistedUserById(session.user.id);
        const requestedChannel = parsed.data.channel;
        const canUseEmail = !!dbUser?.email && !isSyntheticIdentifierEmail(dbUser.email);
        const canUsePhone = !!dbUser?.phone;
        const channel = requestedChannel
            ?? (canUsePhone && !dbUser?.phoneVerified ? "phone" : canUseEmail && !dbUser?.emailVerified ? "email" : undefined);

        if (!channel) {
            return NextResponse.json({ ok: false, error: "No verification channel is available for this account." }, { status: 400 });
        }

        if (channel === "phone") {
            if (!dbUser?.phone) {
                return NextResponse.json({ ok: false, error: "No mobile phone number is saved on this account." }, { status: 400 });
            }

            if (dbUser.phoneVerified) {
                return NextResponse.json({ ok: false, error: "Mobile phone is already verified." }, { status: 400 });
            }

            const code = createPhoneVerificationCode();
            const token = createPhoneVerificationToken(dbUser.id, dbUser.phone, code);
            const delivery = await sendPhoneVerificationCode({ to: dbUser.phone, code });
            const response = NextResponse.json({ ok: true, channel: "phone", ...delivery });

            response.cookies.set(PHONE_VERIFICATION_COOKIE, token, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 10 * 60
            });

            return response;
        }

        if (!dbUser?.email || isSyntheticIdentifierEmail(dbUser.email)) {
            return NextResponse.json({ ok: false, error: "No email address on account." }, { status: 400 });
        }

        if (dbUser.emailVerified) {
            return NextResponse.json({ ok: false, error: "Email is already verified." }, { status: 400 });
        }

        const token = createVerificationToken(dbUser.id, dbUser.email);
        const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3300";
        const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

        await sendEmail({
            to: dbUser.email,
            subject: "Verify your Track Promises account",
            html: `
                <p>Hi ${dbUser.displayName ?? dbUser.email},</p>
                <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
                <p><a href="${verifyUrl}" style="color:#2d6a4f;font-weight:bold;">Verify email</a></p>
                <p>Or copy this URL into your browser:<br>${verifyUrl}</p>
                <p>If you didn't create this account, ignore this email.</p>
            `
        });

        return NextResponse.json({ ok: true, channel: "email" });
    } catch (err) {
        console.error("[request-verification] error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
