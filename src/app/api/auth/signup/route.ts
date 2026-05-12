import { NextResponse } from "next/server";
import { z } from "zod";

import { registerDemoUser } from "@/modules/auth/demo-users";

const signupSchema = z.object({
    identifierType: z.enum(["email", "phone", "aadhaar", "pan"]),
    identifier: z
        .string()
        .min(1, "Identifier is required")
        .max(200)
        .transform((v) => v.trim()),
    displayName: z.string().max(80).optional()
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

    return NextResponse.json({
        ok: true,
        credentials: {
            email: result.user.email,
            password: result.password
        }
    });
}
