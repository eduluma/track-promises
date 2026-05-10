import { describe, expect, it } from "vitest";

import { extractTenantSlugFromHost } from "@/modules/tenants/resolve-tenant";

describe("extractTenantSlugFromHost", () => {
  it("reads tenant slugs from localhost subdomains", () => {
    expect(extractTenantSlugFromHost("tamilnadu.localhost:3000")).toBe("tamilnadu");
  });

  it("returns null for production domains (path-based routing only)", () => {
    expect(extractTenantSlugFromHost("india-2029.track-promises.com")).toBeNull();
    expect(extractTenantSlugFromHost("trackpromises.eduluma.org")).toBeNull();
    expect(extractTenantSlugFromHost("tamilnadu.trackpromises.eduluma.org")).toBeNull();
  });

  it("returns null for plain localhost", () => {
    expect(extractTenantSlugFromHost("localhost:3000")).toBeNull();
  });

  it("returns null for IP addresses", () => {
    expect(extractTenantSlugFromHost("10.1.2.3")).toBeNull();
    expect(extractTenantSlugFromHost("10.1.2.3:3000")).toBeNull();
  });
});
