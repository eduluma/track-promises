import { platformDefaults } from "@/config/defaults";
import { tenantConfigSchema, type TenantConfig } from "@/config/schemas";
import { normalizeLocale, platformFallbackLocale, type SupportedLocale } from "@/modules/i18n/config";
import { getTenantById, getTenantConfigOverride } from "@/modules/tenants/data";

export type TenantLocalizationSettings = TenantConfig["localization"] & {
  primaryLocale: SupportedLocale;
};

export function resolveTenantConfig(tenantId: string): TenantConfig {
  const override = getTenantConfigOverride(tenantId);
  return tenantConfigSchema.parse({
    ...platformDefaults,
    ...override,
    localization: {
      ...platformDefaults.localization,
      ...override?.localization
    },
    features: {
      ...platformDefaults.features,
      ...override?.features
    },
    votingWindows: {
      ...platformDefaults.votingWindows,
      ...override?.votingWindows
    }
  });
}

export function resolveTenantLocalizationSettings(tenantId: string): TenantLocalizationSettings {
  const localization = resolveTenantConfig(tenantId).localization;
  const tenant = getTenantById(tenantId);
  const primaryLocale = normalizeLocale(tenant?.defaultLocale) ?? localization.fallbackLocale ?? platformFallbackLocale;

  if (!localization.supportedLocales.includes(primaryLocale)) {
    throw new Error(`Tenant ${tenantId} primary locale ${primaryLocale} must be included in supported locales.`);
  }

  return {
    ...localization,
    primaryLocale
  };
}
