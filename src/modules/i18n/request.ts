import { cookies, headers } from "next/headers";

import { resolveTenantLocalizationSettings } from "@/config/resolve-config";
import {
    localeCookieName,
    localeHeaderName,
    type LocalizedHref,
    localizeHref,
    platformFallbackLocale,
    resolveRequestLocale,
    supportedLocaleCodes,
    type SupportedLocale,
    tenantHeaderName
} from "@/modules/i18n/config";
import { getMessages } from "@/modules/i18n/messages";
import { getTenantBySlug } from "@/modules/tenants/data";

export async function getRequestLocalizationContext() {
    const requestHeaders = await headers();
    const tenantSlug = requestHeaders.get(tenantHeaderName);
    const tenant = tenantSlug ? getTenantBySlug(tenantSlug) : null;
    const localizationSettings = tenant ? resolveTenantLocalizationSettings(tenant.id) : null;
    const locale = await getRequestLocale();

    return {
        locale,
        supportedLocales: localizationSettings?.supportedLocales ?? supportedLocaleCodes,
        fallbackLocale: localizationSettings?.fallbackLocale ?? platformFallbackLocale,
        tenantSlug
    };
}

export async function getRequestLocale() {
    const requestHeaders = await headers();
    const headerLocale = requestHeaders.get(localeHeaderName);

    if (headerLocale) {
        return resolveRequestLocale({
            pathname: "/",
            tenantDefaultLocale: headerLocale,
            supportedLocales: [headerLocale as SupportedLocale],
            fallbackLocale: headerLocale as SupportedLocale
        }).locale;
    }

    const requestCookies = await cookies();
    const tenantSlug = requestHeaders.get(tenantHeaderName);
    const tenant = tenantSlug ? getTenantBySlug(tenantSlug) : null;
    const localizationSettings = tenant ? resolveTenantLocalizationSettings(tenant.id) : null;

    return resolveRequestLocale({
        pathname: "/",
        cookieLocale: requestCookies.get(localeCookieName)?.value,
        acceptLanguage: requestHeaders.get("accept-language"),
        tenantDefaultLocale: localizationSettings?.primaryLocale ?? platformFallbackLocale,
        supportedLocales: localizationSettings?.supportedLocales,
        fallbackLocale: localizationSettings?.fallbackLocale
    }).locale;
}

export async function getRequestMessages() {
    return getMessages(await getRequestLocale());
}

export async function getLocalizedHref(href: string): Promise<LocalizedHref> {
    const locale = await getRequestLocale();
    return localizeHref(href, locale);
}