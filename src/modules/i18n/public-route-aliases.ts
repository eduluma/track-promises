import { resolveLocalizedText, type LocalizedText } from "@/modules/i18n/localized-content";
import type { SupportedLocale } from "@/modules/i18n/config";

type PublicPromiseRouteAliasRecord = {
    tenantId: string;
    promiseId: string;
    timelineSlug?: string;
    translations: LocalizedText;
};

const publicPromiseRouteAliases: PublicPromiseRouteAliasRecord[] = [
    {
        tenantId: "tenant-tamilnadu",
        timelineSlug: "2026",
        promiseId: "tn-2026-tvk-women-income-support",
        translations: {
            ta: "பெண்-குடும்ப-தலைவர்-வருமான-உதவி"
        }
    }
];

function matchesPromise(
    alias: PublicPromiseRouteAliasRecord,
    tenantId: string,
    promiseId: string,
    timelineSlug?: string | null
) {
    return (
        alias.tenantId === tenantId &&
        alias.promiseId === promiseId &&
        (timelineSlug ? alias.timelineSlug === timelineSlug : true)
    );
}

export function getLocalizedPublicPromiseRouteSlug(
    tenantId: string,
    promiseId: string,
    locale?: SupportedLocale | null,
    timelineSlug?: string | null
) {
    const alias = publicPromiseRouteAliases.find((record) => matchesPromise(record, tenantId, promiseId, timelineSlug));

    if (!alias) {
        return promiseId;
    }

    return resolveLocalizedText(promiseId, alias.translations, locale ?? null);
}

export function resolvePromiseIdFromPublicRouteSlug(tenantId: string, timelineSlug: string, routeSlug: string) {
    return publicPromiseRouteAliases.find(
        (alias) =>
            alias.tenantId === tenantId &&
            alias.timelineSlug === timelineSlug &&
            (alias.promiseId === routeSlug || Object.values(alias.translations).includes(routeSlug))
    )?.promiseId ?? null;
}

export function resolvePromiseIdFromTenantPublicRouteSlug(tenantId: string, routeSlug: string) {
    return publicPromiseRouteAliases.find(
        (alias) => alias.tenantId === tenantId && (alias.promiseId === routeSlug || Object.values(alias.translations).includes(routeSlug))
    )?.promiseId ?? null;
}
