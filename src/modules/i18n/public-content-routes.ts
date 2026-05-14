import {
    type LocalizedHref,
    localeSchema,
    localizeHref,
    platformFallbackLocale,
    stripLocalePrefix,
    toInternalPathname,
    type SupportedLocale
} from "@/modules/i18n/config";
import {
    getLocalizedPublicPromiseRouteSlug,
    resolvePromiseIdFromPublicRouteSlug,
    resolvePromiseIdFromTenantPublicRouteSlug
} from "@/modules/i18n/public-route-aliases";
import { getLocalizedTenantSlug, getTenantBySlug, resolveTenantSlug } from "@/modules/tenants/data";
import { getLocalizedTimelineSlug, getTimelineBySlug, resolveTimelineSlug } from "@/modules/timelines/data";

const promiseSegmentAliases: Record<SupportedLocale, string> = {
    en: "promises",
    ta: "வாக்குறுதிகள்",
    ml: "വാഗ്ദാനങ്ങൾ",
    hi: "वादे"
};

function ensureLeadingSlash(pathname: string) {
    if (!pathname || pathname === "") {
        return "/";
    }

    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function decodePathname(pathname: string) {
    try {
        return decodeURI(pathname);
    } catch {
        return pathname;
    }
}

function splitHref(href: string) {
    const match = href.match(/^([^?#]*)(.*)$/);

    if (!match) {
        return { pathname: "/", suffix: "" };
    }

    return {
        pathname: ensureLeadingSlash(match[1] || "/"),
        suffix: match[2] || ""
    };
}

function isPromiseSegment(segment: string) {
    return Object.values(promiseSegmentAliases).includes(segment);
}

function getLocalizedPromiseSegment(locale: SupportedLocale) {
    return promiseSegmentAliases[locale] ?? promiseSegmentAliases.en;
}

function normalizeLocaleForPath(locale: SupportedLocale, fallbackLocale: SupportedLocale) {
    return locale === fallbackLocale ? platformFallbackLocale : locale;
}

function localizeContentPathname(pathname: string, locale: SupportedLocale) {
    const normalizedPathname = ensureLeadingSlash(pathname);
    const segments = normalizedPathname.split("/").filter(Boolean);

    if (segments.length === 0) {
        return "/" as LocalizedHref;
    }

    const tenant = getTenantBySlug(segments[0]);

    if (!tenant) {
        return normalizedPathname as LocalizedHref;
    }

    const localizedTenantSlug = getLocalizedTenantSlug(tenant.slug, locale);

    if (segments.length === 1) {
        return `/${localizedTenantSlug}` as LocalizedHref;
    }

    if (segments[1] === "promises" && segments[2]) {
        return `/${localizedTenantSlug}/${getLocalizedPromiseSegment(locale)}/${getLocalizedPublicPromiseRouteSlug(tenant.id, segments[2], locale)}` as LocalizedHref;
    }

    const timeline = getTimelineBySlug(tenant.id, segments[1]);

    if (!timeline) {
        return `/${localizedTenantSlug}/${segments.slice(1).join("/")}` as LocalizedHref;
    }

    const localizedTimelineSlug = getLocalizedTimelineSlug(tenant.id, timeline.slug, locale);

    if (segments[2] === "promises" && segments[3]) {
        return `/${localizedTenantSlug}/${localizedTimelineSlug}/${getLocalizedPromiseSegment(locale)}/${getLocalizedPublicPromiseRouteSlug(tenant.id, segments[3], locale, timeline.slug)}` as LocalizedHref;
    }

    return `/${localizedTenantSlug}/${localizedTimelineSlug}` as LocalizedHref;
}

export function toInternalAppPathname(pathname: string): LocalizedHref {
    const normalizedPathname = ensureLeadingSlash(decodePathname(pathname));
    const strippedPath = stripLocalePrefix(normalizedPathname);
    const exactStaticPath = toInternalPathname(strippedPath.pathname);

    if (exactStaticPath !== strippedPath.pathname) {
        return strippedPath.locale ? `/${strippedPath.locale}${exactStaticPath}` as LocalizedHref : exactStaticPath;
    }

    const segments = strippedPath.pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
        return strippedPath.locale ? `/${strippedPath.locale}` as LocalizedHref : "/";
    }

    const tenantSlug = resolveTenantSlug(segments[0]);

    if (!tenantSlug) {
        return normalizedPathname as LocalizedHref;
    }

    const withOptionalLocale = (canonicalPathname: LocalizedHref) =>
        strippedPath.locale ? `/${strippedPath.locale}${canonicalPathname}` as LocalizedHref : canonicalPathname;

    if (segments.length === 1) {
        return withOptionalLocale(`/${tenantSlug}` as LocalizedHref);
    }

    const tenant = getTenantBySlug(tenantSlug);

    if (!tenant) {
        return normalizedPathname as LocalizedHref;
    }

    if (isPromiseSegment(segments[1]) && segments[2]) {
        const promiseId = resolvePromiseIdFromTenantPublicRouteSlug(tenant.id, segments[2]);

        return withOptionalLocale(`/${tenant.slug}/promises/${promiseId ?? segments[2]}` as LocalizedHref);
    }

    const timelineSlug = resolveTimelineSlug(tenant.id, segments[1]);

    if (!timelineSlug) {
        return withOptionalLocale(`/${tenant.slug}/${segments.slice(1).join("/")}` as LocalizedHref);
    }

    if (isPromiseSegment(segments[2] ?? "") && segments[3]) {
        const promiseId = resolvePromiseIdFromPublicRouteSlug(tenant.id, timelineSlug, segments[3]);

        return withOptionalLocale(`/${tenant.slug}/${timelineSlug}/promises/${promiseId ?? segments[3]}` as LocalizedHref);
    }

    return withOptionalLocale(`/${tenant.slug}/${timelineSlug}` as LocalizedHref);
}

export function localizeAppHref(
    href: string,
    locale: SupportedLocale,
    fallbackLocale: SupportedLocale = platformFallbackLocale
): LocalizedHref {
    const { pathname, suffix } = splitHref(href);
    const canonicalPathname = toInternalAppPathname(stripLocalePrefix(pathname).pathname);
    const normalizedLocale = normalizeLocaleForPath(locale, fallbackLocale);
    const localizedStaticPath = localizeHref(canonicalPathname, normalizedLocale, fallbackLocale);
    const localizedPathname = localizedStaticPath === `/${normalizedLocale}${canonicalPathname}`
        ? localizeContentPathname(canonicalPathname, normalizedLocale)
        : localizedStaticPath.slice(`/${normalizedLocale}`.length) || "/";

    if (localizedPathname === "/") {
        return `/${locale}${suffix}` as LocalizedHref;
    }

    return `/${locale}${localizedPathname}${suffix}` as LocalizedHref;
}

export function isLocalizedPromiseSegment(segment: string) {
    return localeSchema.safeParse(segment).success ? false : isPromiseSegment(segment);
}
