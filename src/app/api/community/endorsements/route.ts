import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { runQuery } from "@/db/client";
import { communityEndorsements, users } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/session";
import { checkAndAutoPromote, recordScoreEvent } from "@/modules/moderation/community-score";
import { getTenantBySlug } from "@/modules/tenants/data";

/**
 * POST /api/community/endorsements
 * Body: { tenantSlug: string; subjectId: string; note?: string }
 *
 * The signed-in user (endorser) must be moderator_approved.
 * An endorser can only have one active endorsement per subject.
 */
export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (actor.state !== "moderator_approved") {
    return NextResponse.json({ error: "Only moderator_approved users can endorse" }, { status: 403 });
  }

  const body = await request.json();
  const { tenantSlug, subjectId, note } = body ?? {};

  if (!tenantSlug || typeof tenantSlug !== "string") {
    return NextResponse.json({ error: "tenantSlug is required" }, { status: 400 });
  }
  const tenant = getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  if (!subjectId || typeof subjectId !== "string") {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }
  if (subjectId === actor.id) {
    return NextResponse.json({ error: "Cannot endorse yourself" }, { status: 400 });
  }

  // Verify subject exists
  const [subject] = await runQuery((db) =>
    db.select().from(users).where(eq(users.id, subjectId)).limit(1)
  );
  if (!subject) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (subject.state === "suspended" || subject.state === "readonly") {
    return NextResponse.json({ error: "Cannot endorse a suspended or readonly user" }, { status: 400 });
  }

  // Check for existing endorsement (unique constraint is per endorser+subject pair)
  const [existing] = await runQuery((db) =>
    db
      .select()
      .from(communityEndorsements)
      .where(
        and(
          eq(communityEndorsements.endorserId, actor.id),
          eq(communityEndorsements.subjectId, subjectId)
        )
      )
      .limit(1)
  );

  if (existing?.status === "active") {
    return NextResponse.json({ error: "You already have an active endorsement for this user" }, { status: 409 });
  }

  const now = new Date();
  const id = `endorsement:${actor.id}:${subjectId}:${now.toISOString()}`;

  if (existing) {
    // Re-activate a previously withdrawn endorsement
    await runQuery((db) =>
      db
        .update(communityEndorsements)
        .set({ status: "active", note: note ?? existing.note, updatedAt: now })
        .where(eq(communityEndorsements.id, existing.id))
    );
  } else {
    await runQuery((db) =>
      db.insert(communityEndorsements).values({
        id,
        tenantId: tenant.id,
        endorserId: actor.id,
        subjectId,
        note: note ?? null,
        status: "active",
        createdAt: now,
        updatedAt: now
      })
    );
  }

  await recordScoreEvent({
    userId: subjectId,
    tenantId: tenant.id,
    eventType: "endorsement_received",
    delta: 12,
    referenceId: existing?.id ?? id,
    metadata: { endorserId: actor.id },
    now
  });

  await checkAndAutoPromote(subjectId, tenant.id);

  return NextResponse.json({ success: true, endorsementId: existing?.id ?? id }, { status: 201 });
}

/**
 * GET /api/community/endorsements?tenantSlug=...&subjectId=...
 * Returns active endorsements for a subject (self or admin).
 */
export async function GET(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const subjectId = searchParams.get("subjectId") ?? actor.id;

  if (!tenantSlug) {
    return NextResponse.json({ error: "tenantSlug is required" }, { status: 400 });
  }
  const tenant = getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const isAdmin =
    actor.role === "moderator" || actor.role === "tenant_admin" || actor.role === "platform_admin";
  if (subjectId !== actor.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await runQuery((db) =>
    db
      .select()
      .from(communityEndorsements)
      .where(
        and(
          eq(communityEndorsements.subjectId, subjectId),
          eq(communityEndorsements.tenantId, tenant.id),
          eq(communityEndorsements.status, "active")
        )
      )
  );

  return NextResponse.json({ endorsements: rows });
}
