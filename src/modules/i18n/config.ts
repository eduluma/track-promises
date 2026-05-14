import { z } from "zod";

export const supportedLocaleCodes = ["en", "ta", "ml", "hi"] as const;

export const localeSchema = z.enum(supportedLocaleCodes);

export type SupportedLocale = z.infer<typeof localeSchema>;
export type LocalizedHref = `/${string}`;

const localizedPathAliases = {
    "/login": {
        ta: "/உள்நுழைவு",
        ml: "/ലോഗിൻ",
        hi: "/लॉग-इन"
    },
    "/signup": {
        ta: "/பதிவு",
        ml: "/രജിസ്റ്റർ",
        hi: "/साइन-अप"
    },
    "/account": {
        ta: "/என்-கணக்கு",
        ml: "/എന്റെ-അക്കൗണ്ട്",
        hi: "/मेरा-खाता"
    },
    "/reset-password": {
        ta: "/கடவுச்சொல்-மீட்டமை",
        ml: "/പാസ്‌വേഡ്-റീസെറ്റ്",
        hi: "/पासवर्ड-रीसेट"
    },
    "/admin/audit": {
        ta: "/நிர்வாகம்/தணிக்கை",
        ml: "/അഡ്മിൻ/ഓഡിറ്റ്",
        hi: "/प्रशासन/ऑडिट"
    },
    "/admin/moderation": {
        ta: "/நிர்வாகம்/மதிப்பாய்வு",
        ml: "/അഡ്മിൻ/മോഡറേഷൻ",
        hi: "/प्रशासन/मॉडरेशन"
    },
    "/admin/promises/new": {
        ta: "/நிர்வாகம்/வாக்குறுதிகள்/புதியது",
        ml: "/അഡ്മിൻ/വാഗ്ദാനങ്ങൾ/പുതിയത്",
        hi: "/प्रशासन/वादे/नया"
    },
    "/admin/tenants/localization": {
        ta: "/நிர்வாகம்/டெனன்ட்கள்/மொழிகள்",
        ml: "/അഡ്മിൻ/ടെന്നന്റുകൾ/ഭാഷകൾ",
        hi: "/प्रशासन/टेनेंट/भाषाएँ"
    }
} satisfies Record<string, Partial<Record<Exclude<SupportedLocale, "en">, LocalizedHref>>>;

const internalPathByLocalizedAlias = Object.entries(localizedPathAliases).reduce<Record<string, string>>((lookup, [internalPath, aliases]) => {
    for (const alias of Object.values(aliases)) {
        lookup[alias] = internalPath;
    }

    return lookup;
}, {});

export const platformFallbackLocale: SupportedLocale = "en";
export const localeCookieName = "TRACK_PROMISES_LOCALE";
export const localeHeaderName = "x-track-promises-locale";
export const tenantHeaderName = "x-track-promises-tenant";

export const localeMetadata: Record<
    SupportedLocale,
    { label: string; nativeLabel: string; sample: string }
> = {
    en: {
        label: "English",
        nativeLabel: "English",
        sample: "Civic accountability, in your own language."
    },
    ta: {
        label: "Tamil",
        nativeLabel: "தமிழ்",
        sample: "குடிமக்கள் கண்காணிப்பை உங்கள் மொழியில் பார்க்கலாம்."
    },
    ml: {
        label: "Malayalam",
        nativeLabel: "മലയാളം",
        sample: "പൗര ഉത്തരവാദിത്വ നിരീക്ഷണം നിങ്ങളുടെ ഭാഷയില്‍."
    },
    hi: {
        label: "Hindi",
        nativeLabel: "हिन्दी",
        sample: "नागरिक जवाबदेही अब आपकी भाषा में।"
    }
};

const intlLocaleBySupportedLocale: Record<SupportedLocale, string> = {
    en: "en-IN",
    ta: "ta-IN",
    ml: "ml-IN",
    hi: "hi-IN"
};

function ensureLeadingSlash(pathname: string) {
    if (!pathname || pathname === "") {
        return "/";
    }

    return pathname.startsWith("/") ? pathname : `/${pathname}`;
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

export function toInternalPathname(pathname: string) {
    const normalizedPathname = ensureLeadingSlash(pathname);
    return (internalPathByLocalizedAlias[normalizedPathname] ?? normalizedPathname) as LocalizedHref;
}

export function toLocalizedPathname(pathname: string, locale: SupportedLocale) {
    const normalizedPathname = ensureLeadingSlash(pathname);

    if (locale === platformFallbackLocale) {
        return normalizedPathname as LocalizedHref;
    }

    const aliases = localizedPathAliases[normalizedPathname as keyof typeof localizedPathAliases];
    const localizedLocale = locale as Exclude<SupportedLocale, "en">;

    return (aliases?.[localizedLocale] ?? normalizedPathname) as LocalizedHref;
}

export function isSupportedLocale(value: string): value is SupportedLocale {
    return supportedLocaleCodes.includes(value as SupportedLocale);
}

export function normalizeLocale(value: string | null | undefined): SupportedLocale | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim().toLowerCase().replace(/_/g, "-");

    if (isSupportedLocale(normalized)) {
        return normalized;
    }

    const [language] = normalized.split("-");
    return language && isSupportedLocale(language) ? language : null;
}

export function getIntlLocale(locale: SupportedLocale) {
    return intlLocaleBySupportedLocale[locale];
}

export function stripLocalePrefix(pathname: string) {
    const normalizedPathname = ensureLeadingSlash(pathname);
    const [, maybeLocale, ...rest] = normalizedPathname.split("/");
    const locale = normalizeLocale(maybeLocale);

    if (!locale) {
        return {
            locale: null,
            pathname: normalizedPathname
        };
    }

    const strippedPathname = `/${rest.join("/")}`.replace(/\/+/g, "/");

    return {
        locale,
        pathname: toInternalPathname(strippedPathname === "/" ? "/" : strippedPathname.replace(/\/$/, "") || "/")
    };
}

export function matchAcceptLanguage(
    header: string | null | undefined,
    supportedLocales: readonly SupportedLocale[]
) {
    if (!header) {
        return null;
    }

    const requestedLocales = header
        .split(",")
        .map((part) => part.trim().split(";")[0])
        .map((part) => normalizeLocale(part))
        .filter((part): part is SupportedLocale => Boolean(part));

    return requestedLocales.find((locale) => supportedLocales.includes(locale)) ?? null;
}

function resolveAllowedLocale(
    locale: SupportedLocale | null,
    supportedLocales: readonly SupportedLocale[],
    fallbackLocale: SupportedLocale
) {
    if (locale && supportedLocales.includes(locale)) {
        return locale;
    }

    if (supportedLocales.includes(fallbackLocale)) {
        return fallbackLocale;
    }

    return supportedLocales[0] ?? platformFallbackLocale;
}

function pickSupportedLocale(locale: SupportedLocale | null, supportedLocales: readonly SupportedLocale[]) {
    if (!locale) {
        return null;
    }

    return supportedLocales.includes(locale) ? locale : null;
}

type ResolveRequestLocaleOptions = {
    pathname: string;
    cookieLocale?: string | null;
    acceptLanguage?: string | null;
    tenantDefaultLocale?: string | null;
    supportedLocales?: readonly SupportedLocale[];
    fallbackLocale?: SupportedLocale;
};

export function resolveRequestLocale({
    pathname,
    cookieLocale,
    acceptLanguage,
    tenantDefaultLocale,
    supportedLocales = supportedLocaleCodes,
    fallbackLocale = platformFallbackLocale
}: ResolveRequestLocaleOptions) {
    const supported = supportedLocales.length > 0 ? [...supportedLocales] : [...supportedLocaleCodes];
    const strippedPath = stripLocalePrefix(pathname);
    const tenantLocale = resolveAllowedLocale(normalizeLocale(tenantDefaultLocale), supported, fallbackLocale);

    const locale =
        pickSupportedLocale(strippedPath.locale, supported) ??
        pickSupportedLocale(normalizeLocale(cookieLocale), supported) ??
        pickSupportedLocale(matchAcceptLanguage(acceptLanguage, supported), supported) ??
        tenantLocale;

    return {
        locale,
        pathname: strippedPath.pathname,
        hadLocalePrefix: Boolean(strippedPath.locale)
    };
}

export function localizeHref(
    href: string,
    locale: SupportedLocale,
    fallbackLocale: SupportedLocale = platformFallbackLocale
): LocalizedHref {
    const { pathname, suffix } = splitHref(href);
    const strippedPath = toInternalPathname(stripLocalePrefix(pathname).pathname);
    const localizedPath = toLocalizedPathname(strippedPath, locale === fallbackLocale ? platformFallbackLocale : locale);

    if (localizedPath === "/") {
        return `/${locale}${suffix}` as LocalizedHref;
    }

    return `/${locale}${localizedPath}${suffix}` as LocalizedHref;
}