import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { createDbClient } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { authenticateDemoUser, getDemoUserById, updatePassword } from "@/modules/auth/demo-users";
import { authOptions } from "@/modules/auth/options";

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

    const user = getDemoUserById(session.user.id);
    if (!user) {
        return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    // Verify current password
    const authenticated = authenticateDemoUser(user.email, parsed.data.currentPassword);
    if (!authenticated) {
        return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 403 });
    }

    const newHash = hashSync(parsed.data.newPassword, 12);

    // Update in-memory store
    updatePassword(user.id, newHash);

    // Update DB (best-effort)
    try {
        const db = createDbClient();
        await db
            .update(users)
            .set({ passwordHash: newHash })
            .where(eq(users.id, user.id));
    } catch (err) {
        console.warn("[change-password] DB update failed:", err);
    }

    return NextResponse.json({ ok: true });
}
