import { NextResponse } from "next/server";

import { getCurrentUser } from "@/modules/auth/session";
import { computeUserScore } from "@/modules/moderation/community-score";
import { getTenantBySlug } from "@/modules/tenants/data";

/**
 * GET /api/community/score/:userId?tenantSlug=...
 * Returns the rolling-window score breakdown for a user.
 * Allowed for: the user themselves, moderators, admins.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;
  const isAdmin =
    actor.role === "moderator" || actor.role === "tenant_admin" || actor.role === "platform_admin";

  if (userId !== actor.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  const breakdown = await computeUserScore(userId, tenant.id);
  return NextResponse.json(breakdown);
}
