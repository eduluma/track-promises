import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/modules/auth/options";
import { createCommunityAttestationRequest } from "@/modules/auth/community-attestations";
import { resolvePersistedUserIdentity } from "@/modules/auth/user-store";
import { getTenantBySlug, listTenants } from "@/modules/tenants/data";
import { extractTenantSlugFromHost } from "@/modules/tenants/resolve-tenant";

const schema = z.object({
    city: z.string().trim().min(2, "Enter your city or town.").max(80),
    locality: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(20).optional(),
    address: z.string().trim().max(240).optional(),
    statement: z.string().trim().max(280).optional()
});

function resolveTenantFromHost(host: string | null | undefined) {
    const tenantSlug = extractTenantSlugFromHost(host);
    const defaultTenantSlug = process.env.TRACK_PROMISES_DEFAULT_TENANT;

    return (tenantSlug ? getTenantBySlug(tenantSlug) : null)
        ?? (defaultTenantSlug ? getTenantBySlug(defaultTenantSlug) : null)
        ?? listTenants()[0]
        ?? null;
}

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

    if (currentUser.state === "moderator_approved") {
        return NextResponse.json({ ok: false, error: "This account is already approved to attest other users." }, { status: 400 });
    }

    if (currentUser.role === "guest" || currentUser.state === "readonly" || currentUser.state === "suspended") {
        return NextResponse.json({ ok: false, error: "This account cannot request verifier promotion right now." }, { status: 403 });
    }

    const requestHeaders = await headers();
    const tenant = resolveTenantFromHost(requestHeaders.get("host"));

    if (!tenant) {
        return NextResponse.json({ ok: false, error: "Unable to resolve a tenant for this request." }, { status: 400 });
    }

    try {
        const summary = await createCommunityAttestationRequest({
            tenantId: tenant.id,
            userId: currentUser.id,
            city: parsed.data.city,
            locality: parsed.data.locality,
            postalCode: parsed.data.postalCode,
            address: parsed.data.address,
            statement: parsed.data.statement
        });

        return NextResponse.json({ ok: true, summary });
    } catch (err) {
        console.error("[community-attestation] create failed:", err);
        return NextResponse.json({ ok: false, error: "We could not start community attestation right now." }, { status: 500 });
    }
}
