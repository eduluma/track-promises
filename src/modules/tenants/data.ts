import type { TenantConfig } from "@/config/schemas";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  jurisdictionType: string;
  primaryDomain: string;
  tagline: string;
  brandColor: string;
};

const tenants: Tenant[] = [
  {
    id: "tenant-tamilnadu",
    name: "Tamil Nadu",
    slug: "tamilnadu",
    jurisdictionType: "State",
    primaryDomain: "tamilnadu.track-promises.localhost",
    tagline: "Monitor campaign commitments, evidence, and fulfillment sentiment across the state.",
    brandColor: "#a14524"
  },
  {
    id: "tenant-india-2029",
    name: "India 2029",
    slug: "india-2029",
    jurisdictionType: "Election",
    primaryDomain: "india-2029.track-promises.localhost",
    tagline: "Prototype a national election workspace without hard-coding jurisdiction logic.",
    brandColor: "#54694b"
  }
];

const tenantConfigOverrides: Record<string, Partial<TenantConfig>> = {
  "tenant-tamilnadu": {
    categories: ["Infrastructure", "Energy", "Education", "Welfare"],
    voteMeaning: "Public sentiment on whether this promise is on track for delivery.",
    moderationThreshold: 2
  },
  "tenant-india-2029": {
    categories: ["Economy", "Jobs", "Governance", "Climate"],
    votingWindows: {
      defaultStartAt: "2026-01-01T00:00:00.000Z",
      defaultFreezeAt: "2026-10-01T00:00:00.000Z",
      defaultEndAt: "2026-12-31T00:00:00.000Z"
    }
  }
};

export function listTenants() {
  return tenants;
}

export function getTenantBySlug(slug: string) {
  return tenants.find((tenant) => tenant.slug === slug);
}

export function getTenantConfigOverride(tenantId: string) {
  return tenantConfigOverrides[tenantId] ?? null;
}

export type { Tenant };
