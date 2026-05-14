import { describe, expect, it } from "vitest";

import { resolveTenantConfig, resolveTenantLocalizationSettings } from "@/config/resolve-config";

describe("resolveTenantConfig", () => {
  it("merges platform defaults with tenant overrides", () => {
    const config = resolveTenantConfig("tenant-tamilnadu");

    expect(config.categories).toContain("Energy");
    expect(config.voteMeaning).toContain("stage");
    expect(config.features.voting).toBe(true);
    expect(config.localization.supportedLocales).toEqual(["ta", "en"]);
    expect(config.localization.fallbackLocale).toBe("ta");
  });

  it("falls back to platform defaults when no override exists", () => {
    const config = resolveTenantConfig("unknown-tenant");

    expect(config.categories).toContain("Economy");
    expect(config.moderationThreshold).toBe(3);
    expect(config.localization.supportedLocales).toEqual(["en", "ta", "ml", "hi"]);
  });

  it("exposes a tenant primary locale that must remain enabled", () => {
    const tamilNadu = resolveTenantLocalizationSettings("tenant-tamilnadu");
    const kerala = resolveTenantLocalizationSettings("tenant-kerala");

    expect(tamilNadu.primaryLocale).toBe("ta");
    expect(tamilNadu.supportedLocales).toEqual(["ta", "en"]);
    expect(kerala.primaryLocale).toBe("ml");
    expect(kerala.supportedLocales).toEqual(["ml", "en"]);
  });

  it("uses English as the default primary locale for unknown tenants", () => {
    const localization = resolveTenantLocalizationSettings("unknown-tenant");

    expect(localization.primaryLocale).toBe("en");
    expect(localization.supportedLocales).toEqual(["en", "ta", "ml", "hi"]);
  });
});
