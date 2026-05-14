import type { TenantConfig } from "@/config/schemas";
import type { SupportedLocale } from "@/modules/i18n/config";
import { resolveLocalizedText, type LocalizedText } from "@/modules/i18n/localized-content";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  slugTranslations?: LocalizedText;
  jurisdictionType: string;
  primaryDomain: string;
  tagline: string;
  brandColor: string;
  defaultLocale: SupportedLocale;
};

type TenantRuntimeOverride = Partial<Pick<Tenant, "defaultLocale">>;

const tenants: Tenant[] = [
  {
    id: "tenant-tamilnadu",
    name: "Tamil Nadu",
    slug: "tamilnadu",
    slugTranslations: {
      ta: "தமிழ்நாடு"
    },
    jurisdictionType: "State",
    primaryDomain: "tamilnadu.track-promises.localhost",
    tagline: "Monitor campaign commitments, evidence, and delivery-stage assessments across the state.",
    brandColor: "#a14524",
    defaultLocale: "ta"
  },
  {
    id: "tenant-india-2029",
    name: "India 2029",
    slug: "india",
    jurisdictionType: "Election",
    primaryDomain: "india.track-promises.localhost",
    tagline: "Prototype a national election workspace without hard-coding jurisdiction logic.",
    brandColor: "#54694b",
    defaultLocale: "en"
  },
  {
    id: "tenant-kerala",
    name: "Kerala",
    slug: "kerala",
    jurisdictionType: "State",
    primaryDomain: "kerala.track-promises.localhost",
    tagline: "Track competing front commitments, evidence, and delivery-stage assessments across Kerala.",
    brandColor: "#0c6b58",
    defaultLocale: "ml"
  }
];

const tenantConfigOverrides: Record<string, Partial<TenantConfig>> = {
  "tenant-tamilnadu": {
    categories: [
      "Women's Welfare",
      "Health",
      "Education",
      "Jobs",
      "Agriculture",
      "Welfare",
      "Housing",
      "Infrastructure",
      "Governance",
      "Environment",
      "Energy"
    ],
    voteMeaning: "Public assessment of the stage this promise has reached so far.",
    moderationThreshold: 2,
    localization: {
      supportedLocales: ["ta", "en"],
      fallbackLocale: "ta"
    }
  },
  "tenant-india-2029": {
    categories: ["Economy", "Jobs", "Governance", "Climate"],
    localization: {
      supportedLocales: ["en", "hi", "ta", "ml"],
      fallbackLocale: "en"
    },
    votingWindows: {
      defaultStartAt: "2026-01-01T00:00:00.000Z",
      defaultFreezeAt: "2026-10-01T00:00:00.000Z",
      defaultEndAt: "2026-12-31T00:00:00.000Z"
    }
  },
  "tenant-kerala": {
    categories: ["Welfare", "Jobs", "Health", "Housing", "Transport", "Infrastructure"],
    voteMeaning: "Public assessment of the stage each front promise has reached so far.",
    moderationThreshold: 2,
    localization: {
      supportedLocales: ["ml", "en"],
      fallbackLocale: "ml"
    }
  }
};

const tenantRuntimeOverrides = new Map<string, TenantRuntimeOverride>();

function applyTenantRuntimeOverrides(tenant: Tenant) {
  const override = tenantRuntimeOverrides.get(tenant.id);

  if (!override) {
    return tenant;
  }

  return {
    ...tenant,
    ...override
  };
}

export function listTenants() {
  return tenants.map((tenant) => applyTenantRuntimeOverrides(tenant));
}

export function getTenantBySlug(slug: string) {
  const tenant = tenants.find((tenant) => tenant.slug === slug);
  return tenant ? applyTenantRuntimeOverrides(tenant) : null;
}

export function getTenantById(id: string) {
  const tenant = tenants.find((tenant) => tenant.id === id);
  return tenant ? applyTenantRuntimeOverrides(tenant) : null;
}

export function setTenantRuntimeDefaultLocale(tenantId: string, defaultLocale: SupportedLocale) {
  const currentOverride = tenantRuntimeOverrides.get(tenantId) ?? {};
  tenantRuntimeOverrides.set(tenantId, {
    ...currentOverride,
    defaultLocale
  });
}

export function resetTenantRuntimeOverrides() {
  tenantRuntimeOverrides.clear();
}

export function resolveTenantSlug(slugOrAlias: string) {
  return tenants.find((tenant) => tenant.slug === slugOrAlias || Object.values(tenant.slugTranslations ?? {}).includes(slugOrAlias))?.slug ?? null;
}

export function getLocalizedTenantSlug(slug: string, locale?: SupportedLocale | null) {
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    return slug;
  }

  return resolveLocalizedText(tenant.slug, tenant.slugTranslations, locale ?? null);
}

export function getTenantConfigOverride(tenantId: string) {
  return tenantConfigOverrides[tenantId] ?? null;
}

export type { Tenant };
