import { NextResponse } from "next/server";
import { z } from "zod";

import { createDbClient } from "@/db/client";
import { users } from "@/db/schema";
import { registerDemoUser } from "@/modules/auth/demo-users";

const signupSchema = z.object({
    identifierType: z.enum(["email", "phone", "aadhaar", "pan"]),
    identifier: z
        .string()
        .min(1, "Identifier is required")
        .max(200)
        .transform((v) => v.trim()),
    displayName: z.string().max(80).optional(),
    password: z.string().min(8, "Password must be at least 8 characters.").max(128).optional()
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

    const result = registerDemoUser(parsed.data);

    if ("error" in result) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }

    // Persist to the database (best-effort — in-memory store is the source of
    // truth for auth until Phase 3 DB migration is complete).
    try {
        const db = createDbClient();
        await db
            .insert(users)
            .values({
                id: result.user.id,
                email: result.user.email,
                displayName: result.user.displayName,
                passwordHash: result.password,
                emailVerified: result.user.emailVerified,
                state: result.user.state,
                role: result.user.role,
                trustScore: result.user.trustScore
            })
            .onConflictDoNothing();
    } catch (err) {
        // Log but don't fail the signup — auth still works via in-memory store.
        console.warn("[signup] DB persist failed:", err);
    }

    return NextResponse.json({
        ok: true,
        credentials: {
            email: result.user.email,
            password: result.password
        }
    });
}
