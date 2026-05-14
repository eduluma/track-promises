import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { CommunityAttestationError, submitCommunityAttestation } from "@/modules/auth/community-attestations";
import { authOptions } from "@/modules/auth/options";
import { resolvePersistedUserIdentity } from "@/modules/auth/user-store";

const schema = z.object({
    relationship: z.string().trim().min(2, "Describe how you know this person.").max(60),
    city: z.string().trim().min(2, "Enter your city or town.").max(80),
    locality: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(20).optional(),
    note: z.string().trim().max(280).optional()
});

type RouteProps = {
    params: Promise<{ reviewId: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
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

    const { reviewId } = await params;
    const currentUser = await resolvePersistedUserIdentity({
        id: session.user.id,
        email: session.user.email
    });

    if (!currentUser) {
        return NextResponse.json(
            { ok: false, error: "Your session no longer matches an account record. Please sign in again." },
            { status: 404 }
        );
    }

    try {
        const summary = await submitCommunityAttestation({
            reviewId,
            witnessUserId: currentUser.id,
            relationship: parsed.data.relationship,
            city: parsed.data.city,
            locality: parsed.data.locality,
            postalCode: parsed.data.postalCode,
            note: parsed.data.note
        });

        return NextResponse.json({ ok: true, summary });
    } catch (err) {
        if (err instanceof CommunityAttestationError) {
            return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
        }

        console.error("[community-attestation] witness failed:", err);
        return NextResponse.json({ ok: false, error: "We could not record your attestation right now." }, { status: 500 });
    }
}
