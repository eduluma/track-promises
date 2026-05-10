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

  const localMatch = normalizedHost.match(localHostPattern);
  if (localMatch?.groups?.slug) {
    return localMatch.groups.slug;
  }

  const parts = normalizedHost.split(".");
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}
