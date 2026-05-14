import { z } from "zod";

import { localeSchema, platformFallbackLocale } from "@/modules/i18n/config";
import { scoringConfigSchema } from "@/config/scoring-defaults";
export const promiseStatusSchema = z.enum(["planned", "in_progress", "fulfilled", "delayed", "disputed"]);

const localizationSchema = z
  .object({
    supportedLocales: z.array(localeSchema).min(1),
    fallbackLocale: localeSchema
  })
  .refine((value) => value.supportedLocales.includes(platformFallbackLocale), {
    message: "English must remain enabled for every tenant.",
    path: ["supportedLocales"]
  })
  .refine((value) => value.supportedLocales.includes(value.fallbackLocale), {
    message: "Fallback locale must be present in supported locales.",
    path: ["fallbackLocale"]
  });

export const tenantConfigSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  statuses: z.array(promiseStatusSchema).min(1),
  voteMeaning: z.string().min(1),
  moderationThreshold: z.number().int().nonnegative(),
  localization: localizationSchema,
  features: z.object({
    voting: z.boolean(),
    moderationQueue: z.boolean(),
    sourceVerification: z.boolean()
  }),
  votingWindows: z.object({
    defaultStartAt: z.string().datetime(),
    defaultFreezeAt: z.string().datetime(),
    defaultEndAt: z.string().datetime()
  }),
  scoring: scoringConfigSchema.optional()
});

export type PromiseStatus = z.infer<typeof promiseStatusSchema>;
export type TenantConfig = z.infer<typeof tenantConfigSchema>;
