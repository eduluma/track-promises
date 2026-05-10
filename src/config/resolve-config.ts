import { platformDefaults } from "@/config/defaults";
import { tenantConfigSchema, type TenantConfig } from "@/config/schemas";
import { getTenantConfigOverride } from "@/modules/tenants/data";

export function resolveTenantConfig(tenantId: string): TenantConfig {
  const override = getTenantConfigOverride(tenantId);
  return tenantConfigSchema.parse({
    ...platformDefaults,
    ...override,
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
