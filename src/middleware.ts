import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { extractTenantSlugFromHost } from "@/modules/tenants/resolve-tenant";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const tenantSlug = extractTenantSlugFromHost(request.headers.get("host"));

  if (!tenantSlug) {
    return NextResponse.next();
  }

  if (pathname === `/${tenantSlug}` || pathname.startsWith(`/${tenantSlug}/`)) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/${tenantSlug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};
