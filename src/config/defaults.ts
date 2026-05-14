import type { TenantConfig } from "@/config/schemas";

export const platformDefaults: TenantConfig = {
  categories: ["Economy", "Infrastructure", "Education", "Health"],
  statuses: ["planned", "in_progress", "fulfilled", "delayed", "disputed"],
  voteMeaning: "Public assessment of the promise's current delivery stage.",
  moderationThreshold: 3,
  localization: {
    supportedLocales: ["en", "ta", "ml", "hi"],
    fallbackLocale: "en"
  },
  features: {
    voting: true,
    moderationQueue: true,
    sourceVerification: true
  },
  votingWindows: {
    defaultStartAt: "2025-01-01T00:00:00.000Z",
    defaultFreezeAt: "2026-12-31T00:00:00.000Z",
    defaultEndAt: "2027-03-01T00:00:00.000Z"
  }
};
