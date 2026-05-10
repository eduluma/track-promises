import { NextResponse } from "next/server";
import { z } from "zod";

import { canAccessTenant } from "@/lib/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getTenantBySlug } from "@/modules/tenants/data";
import { VoteError, castVote } from "@/modules/voting/service";

const voteSchema = z.object({
  promiseId: z.string().min(1),
  tenantSlug: z.string().min(1),
  value: z.enum(["up", "down"])
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in is required to vote." }, { status: 401 });
  }

  const parsed = voteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  const tenant = getTenantBySlug(parsed.data.tenantSlug);

  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant." }, { status: 404 });
  }

  if (!canAccessTenant(user, tenant.id)) {
    return NextResponse.json({ error: "This account cannot vote in that tenant." }, { status: 403 });
  }

  try {
    const result = castVote({
      tenantId: tenant.id,
      promiseId: parsed.data.promiseId,
      user,
      value: parsed.data.value
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof VoteError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }

    throw error;
  }
}
