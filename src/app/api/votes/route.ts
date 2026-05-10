import { NextResponse } from "next/server";
import { z } from "zod";

import { getTenantBySlug } from "@/modules/tenants/data";
import { VoteError, castVote } from "@/modules/voting/service";

const voteSchema = z.object({
  promiseId: z.string().min(1),
  tenantSlug: z.string().min(1),
  value: z.enum(["up", "down"])
});

export async function POST(request: Request) {
  const parsed = voteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  const tenant = getTenantBySlug(parsed.data.tenantSlug);

  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant." }, { status: 404 });
  }

  try {
    const result = castVote({
      tenantId: tenant.id,
      promiseId: parsed.data.promiseId,
      user: {
        id: "demo-user",
        email: "demo@track-promises.local",
        emailVerified: true,
        state: "verified"
      },
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
