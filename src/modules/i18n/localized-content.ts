import { platformFallbackLocale, type SupportedLocale } from "@/modules/i18n/config";

export type LocalizedText = Partial<Record<SupportedLocale, string>>;

export function resolveLocalizedText(
    baseValue: string,
    translations: LocalizedText | null | undefined,
    locale: SupportedLocale | null | undefined
) {
    if (!locale) {
        return baseValue;
    }

    const localizedValue = translations?.[locale]?.trim();

    if (localizedValue) {
        return localizedValue;
    }

    const fallbackValue = translations?.[platformFallbackLocale]?.trim();

    if (fallbackValue) {
        return fallbackValue;
    }

    return baseValue;
}
