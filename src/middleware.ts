import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveTenantLocalizationSettings } from "@/config/resolve-config";
import { localeCookieName, localeHeaderName, platformFallbackLocale, resolveRequestLocale, tenantHeaderName } from "@/modules/i18n/config";
import { toInternalAppPathname } from "@/modules/i18n/public-content-routes";
import { getTenantBySlug } from "@/modules/tenants/data";
import { extractTenantSlugFromHost } from "@/modules/tenants/resolve-tenant";

function extractTenantSlugFromPath(pathname: string) {
  const [, maybeTenantSlug] = pathname.split("/");
  return maybeTenantSlug || null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const canonicalPathname = toInternalAppPathname(pathname);

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const tenantSlug = extractTenantSlugFromHost(request.headers.get("host"));
  const tenantFromPath = getTenantBySlug(extractTenantSlugFromPath(canonicalPathname) ?? "");
  const activeTenant = getTenantBySlug(tenantSlug ?? "") ?? tenantFromPath ?? null;
  const localizationSettings = activeTenant ? resolveTenantLocalizationSettings(activeTenant.id) : null;
  const localeResolution = resolveRequestLocale({
    pathname: canonicalPathname,
    cookieLocale: request.cookies.get(localeCookieName)?.value,
    acceptLanguage: request.headers.get("accept-language"),
    tenantDefaultLocale: localizationSettings?.primaryLocale ?? platformFallbackLocale,
    supportedLocales: localizationSettings?.supportedLocales,
    fallbackLocale: localizationSettings?.fallbackLocale
  });
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(localeHeaderName, localeResolution.locale);

  if (activeTenant) {
    requestHeaders.set(tenantHeaderName, activeTenant.slug);
  } else {
    requestHeaders.delete(tenantHeaderName);
  }

  let internalPathname = localeResolution.pathname;

  if (tenantSlug && !(internalPathname === `/${tenantSlug}` || internalPathname.startsWith(`/${tenantSlug}/`))) {
    internalPathname = `/${tenantSlug}${internalPathname === "/" ? "" : internalPathname}`;
  }

  const response =
    internalPathname === pathname
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.rewrite(
        new URL(
          `${request.nextUrl.origin}${internalPathname}`,
          request.url
        ),
        { request: { headers: requestHeaders } }
      );

  response.cookies.set(localeCookieName, localeResolution.locale, {
    httpOnly: false,
    path: "/",
    sameSite: "lax"
  });

  return response;
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};
