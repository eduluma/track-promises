import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { compareSync, hashSync } from "bcryptjs";

import { authOptions } from "@/modules/auth/options";
import { getPersistedUserById, updatePersistedUserPassword } from "@/modules/auth/user-store";

const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "New password must be at least 8 characters.").max(128)
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

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }

    const user = await getPersistedUserById(session.user.id);
    if (!user) {
        return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    if (!compareSync(parsed.data.currentPassword, user.passwordHash)) {
        return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 403 });
    }

    const newHash = hashSync(parsed.data.newPassword, 12);

    try {
        const updated = await updatePersistedUserPassword(user.id, newHash);

        if (!updated) {
            return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
        }
    } catch (err) {
        console.error("[change-password] DB update failed:", err);
        return NextResponse.json({ ok: false, error: "Unable to update password right now." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
