const localHostPattern = /^(?<slug>[a-z0-9-]+)\.localhost$/;
const ipv4Pattern = /^\d{1,3}(\.\d{1,3}){3}$/;

export function extractTenantSlugFromHost(host: string | null | undefined) {
  if (!host) {
    return null;
  }

  const normalizedHost = host.toLowerCase().split(":")[0];

  if (normalizedHost === "localhost" || normalizedHost === "127.0.0.1") {
    return null;
  }

  if (ipv4Pattern.test(normalizedHost)) {
    return null;
  }

  // Local dev: {slug}.localhost or {slug}.track-promises.localhost
  const localMatch = normalizedHost.match(localHostPattern);
  if (localMatch?.groups?.slug) {
    return localMatch.groups.slug;
  }

  // Production uses path-based routing only — no subdomain extraction from
  // real domains, to avoid treating the platform root domain as a tenant slug.
  return null;
}
