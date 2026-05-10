import { describe, expect, it } from "vitest";

import { extractTenantSlugFromHost } from "@/modules/tenants/resolve-tenant";

describe("extractTenantSlugFromHost", () => {
  it("reads tenant slugs from localhost subdomains", () => {
    expect(extractTenantSlugFromHost("tamilnadu.localhost:3000")).toBe("tamilnadu");
  });

  it("reads tenant slugs from wildcard-style domains", () => {
    expect(extractTenantSlugFromHost("india-2029.track-promises.com")).toBe("india-2029");
  });

  it("returns null for plain localhost", () => {
    expect(extractTenantSlugFromHost("localhost:3000")).toBeNull();
  });
});
