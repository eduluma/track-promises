import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { runQuery } from "@/db/client";
import { communityEndorsements } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/session";
import { getEndorsementById, recordScoreEvent } from "@/modules/moderation/community-score";
import { getTenantBySlug } from "@/modules/tenants/data";

/**
 * DELETE /api/community/endorsements/:endorsementId
 * Withdraw an active endorsement. Only the endorser or an admin may do this.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ endorsementId: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { endorsementId } = await params;
  const endorsement = await getEndorsementById(endorsementId);
  if (!endorsement) {
    return NextResponse.json({ error: "Endorsement not found" }, { status: 404 });
  }

  const isAdmin =
    actor.role === "moderator" || actor.role === "tenant_admin" || actor.role === "platform_admin";
  if (endorsement.endorserId !== actor.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (endorsement.status !== "active") {
    return NextResponse.json({ error: "Endorsement is already withdrawn" }, { status: 409 });
  }

  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenantSlug");
  if (!tenantSlug) {
    return NextResponse.json({ error: "tenantSlug query param is required" }, { status: 400 });
  }
  const tenant = getTenantBySlug(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const now = new Date();
  await runQuery((db) =>
    db
      .update(communityEndorsements)
      .set({ status: "withdrawn", updatedAt: now })
      .where(eq(communityEndorsements.id, endorsementId))
  );

  // Record a negative score event to remove the endorsement's contribution
  await recordScoreEvent({
    userId: endorsement.subjectId,
    tenantId: tenant.id,
    eventType: "endorsement_withdrawn",
    delta: -12,
    referenceId: endorsementId,
    metadata: { endorserId: endorsement.endorserId },
    now
  });

  return NextResponse.json({ success: true });
}
