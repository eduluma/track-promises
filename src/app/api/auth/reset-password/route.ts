import { hashSync } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { appendAuditLog } from "@/modules/audit/logs";
import { consumePasswordResetToken } from "@/modules/auth/password-reset-tokens";
import { getPersistedUserById, updatePersistedUserPassword } from "@/modules/auth/user-store";

const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8)
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = resetPasswordSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: "Invalid password reset payload." }, { status: 400 });
        }

        const record = consumePasswordResetToken(parsed.data.token);

        if (!record) {
            return NextResponse.json({ ok: false, error: "This reset link is invalid or has expired." }, { status: 400 });
        }

        const user = await getPersistedUserById(record.userId);

        if (!user || user.email.toLowerCase() !== record.email.toLowerCase()) {
            return NextResponse.json({ ok: false, error: "This reset link is invalid or has expired." }, { status: 400 });
        }

        const updated = await updatePersistedUserPassword(user.id, hashSync(parsed.data.newPassword, 12));

        if (!updated) {
            return NextResponse.json({ ok: false, error: "We could not reset the password." }, { status: 500 });
        }

        await appendAuditLog({
            tenantId: null,
            actorId: user.id,
            action: "auth.password_reset_completed",
            entityType: "user",
            entityId: user.id,
            metadata: {
                email: user.email
            },
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[reset-password] error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}