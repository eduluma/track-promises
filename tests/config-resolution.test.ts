import { describe, expect, it } from "vitest";

import { resolveTenantConfig } from "@/config/resolve-config";

describe("resolveTenantConfig", () => {
  it("merges platform defaults with tenant overrides", () => {
    const config = resolveTenantConfig("tenant-tamilnadu");

    expect(config.categories).toContain("Energy");
    expect(config.voteMeaning).toContain("on track for delivery");
    expect(config.features.voting).toBe(true);
  });

  it("falls back to platform defaults when no override exists", () => {
    const config = resolveTenantConfig("unknown-tenant");

    expect(config.categories).toContain("Economy");
    expect(config.moderationThreshold).toBe(3);
  });
});
