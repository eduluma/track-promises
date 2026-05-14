import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { ApiUserContext } from "@/modules/api/contracts";
import { getWebApiClient } from "@/modules/api/client";
import { getCurrentUser } from "@/modules/auth/session";

const GUEST_SESSION_COOKIE = "__guest_vid";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  let userContext: ApiUserContext;

  if (user) {
    userContext = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      state: user.state,
      role: user.role,
      tenantIds: user.tenantIds
    };
  } else {
    // Build a persistent guest session ID from a cookie so one browser session
    // maps to one vote per promise.
    const cookieStore = await cookies();
    let guestId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
    if (!guestId) {
      guestId = `guest-${crypto.randomUUID()}`;
    }

    userContext = {
      id: guestId,
      email: null,
      emailVerified: false,
      phoneVerified: false,
      state: "unverified",
      role: "guest",
      tenantIds: []
    };

    const body = await request.json();
    const result = await getWebApiClient().castVote(body, userContext);

    const response = NextResponse.json(result.payload, { status: result.status });
    // Persist the guest ID for 1 year so the same browser remembers its votes.
    response.cookies.set(GUEST_SESSION_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });
    return response;
  }

  const body = await request.json();
  const result = await getWebApiClient().castVote(body, userContext);
  return NextResponse.json(result.payload, { status: result.status });
}
