import { NextResponse } from "next/server";
import { z } from "zod";

import { canAccessTenant, canManagePromises } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { createPromise } from "@/modules/promises/repository";
import { getTenantBySlug } from "@/modules/tenants/data";
import { promiseStatusSchema } from "@/config/schemas";

const createPromiseSchema = z.object({
    tenantSlug: z.string().min(1),
    title: z.string().min(5),
    description: z.string().min(20),
    category: z.string().min(1),
    jurisdiction: z.string().min(2),
    election: z.string().min(2),
    personParty: z.string().min(2),
    status: promiseStatusSchema
});

export async function POST(request: Request) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
    }

    if (!canManagePromises(user)) {
        return NextResponse.json({ error: "This account cannot create promises." }, { status: 403 });
    }

    const parsed = createPromiseSchema.safeParse(await request.json());

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid promise payload." }, { status: 400 });
    }

    const tenant = getTenantBySlug(parsed.data.tenantSlug);

    if (!tenant) {
        return NextResponse.json({ error: "Unknown tenant." }, { status: 404 });
    }

    if (!canAccessTenant(user, tenant.id)) {
        return NextResponse.json({ error: "This account cannot manage that tenant." }, { status: 403 });
    }

    const promise = createPromise({
        tenantId: tenant.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        jurisdiction: parsed.data.jurisdiction,
        election: parsed.data.election,
        personParty: parsed.data.personParty,
        status: parsed.data.status,
        actorId: user.id
    });

    return NextResponse.json({ promise, tenantSlug: tenant.slug }, { status: 201 });
}