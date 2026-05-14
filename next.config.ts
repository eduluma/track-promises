import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typedRoutes: true,
    output: "standalone",
    // Allow HMR / webpack hot-update fetches from tenant subdomains in local dev.
    // Without this, browsers block HMR fetches as cross-origin when the page is
    // served from e.g. tamilnadu.track-promises.localhost:3300 but the fetch
    // target is localhost:3300.
    allowedDevOrigins: [
        "track-promises.localhost",
        "*.track-promises.localhost",
    ],
};

export default nextConfig;
