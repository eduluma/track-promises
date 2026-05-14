import { NextResponse } from "next/server";
import { z } from "zod";
import { hashSync } from "bcryptjs";

import { deriveDisplayName } from "@/modules/auth/demo-users";
import { normalizeIdentifierToEmail, normalizePhoneNumber } from "@/modules/auth/identifiers";
import { createPersistedUser, getPersistedUserByEmail } from "@/modules/auth/user-store";

const signupSchema = z.object({
    identifierType: z.enum(["email", "phone", "aadhaar", "pan"]),
    identifier: z
        .string()
        .min(1, "Identifier is required")
        .max(200)
        .transform((v) => v.trim()),
    displayName: z.string().max(80).optional(),
    password: z.string().min(8, "Password must be at least 8 characters.").max(128)
});

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
        const message = parsed.error.errors[0]?.message ?? "Invalid input.";
        return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    let email: string;
    let phone: string | null = null;

    try {
        email = normalizeIdentifierToEmail(parsed.data.identifierType, parsed.data.identifier);
        phone = parsed.data.identifierType === "phone" ? normalizePhoneNumber(parsed.data.identifier) : null;
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: err instanceof Error ? err.message : "Invalid identifier." },
            { status: 400 }
        );
    }

    const existingUser = await getPersistedUserByEmail(email);

    if (existingUser) {
        return NextResponse.json({ ok: false, error: "An account with this identifier already exists." }, { status: 409 });
    }

    const rawPassword = parsed.data.password.trim();
    const id = `user-${crypto.randomUUID().slice(0, 8)}`;
    const passwordHash = hashSync(rawPassword, 12);

    try {
        await createPersistedUser({
            id,
            email,
            phone,
            displayName: deriveDisplayName(parsed.data.identifierType, parsed.data.identifier, parsed.data.displayName),
            passwordHash
        });
    } catch (err) {
        console.error("[signup] DB persist failed:", err);
        return NextResponse.json({ ok: false, error: "Registration failed. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
        ok: true,
        credentials: {
            email,
            password: rawPassword
        }
    });
}
