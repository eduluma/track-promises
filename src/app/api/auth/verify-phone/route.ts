import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/modules/auth/options";
import { consumePhoneVerificationToken, PHONE_VERIFICATION_COOKIE } from "@/modules/auth/phone-verification-tokens";
import { getPersistedUserById, markPersistedUserPhoneVerified } from "@/modules/auth/user-store";

const verifyPhoneSchema = z.object({
    code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit verification code.")
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const parsed = verifyPhoneSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ ok: false, error: parsed.error.errors[0]?.message ?? "Invalid code." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(PHONE_VERIFICATION_COOKIE)?.value ?? "";
    const record = consumePhoneVerificationToken(token);
    const clearCookie = (response: NextResponse) => {
        response.cookies.set(PHONE_VERIFICATION_COOKIE, "", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 0
        });
        return response;
    };

    if (!record || record.userId !== session.user.id || record.code !== parsed.data.code) {
        return clearCookie(NextResponse.json({ ok: false, error: "The verification code is invalid or has expired." }, { status: 400 }));
    }

    try {
        const dbUser = await getPersistedUserById(record.userId);

        if (!dbUser?.phone || dbUser.phone !== record.phone) {
            return clearCookie(NextResponse.json({ ok: false, error: "This phone verification request is no longer valid." }, { status: 400 }));
        }

        const updated = await markPersistedUserPhoneVerified(record.userId, record.phone);

        if (!updated) {
            return clearCookie(NextResponse.json({ ok: false, error: "We could not verify this phone number right now." }, { status: 500 }));
        }
    } catch (err) {
        console.error("[verify-phone] error:", err);
        return clearCookie(NextResponse.json({ ok: false, error: "We could not verify this phone number right now." }, { status: 500 }));
    }

    return clearCookie(NextResponse.json({ ok: true }));
}
