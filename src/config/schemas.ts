import { z } from "zod";

export const promiseStatusSchema = z.enum(["planned", "in_progress", "fulfilled", "delayed", "disputed"]);

export const tenantConfigSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  statuses: z.array(promiseStatusSchema).min(1),
  voteMeaning: z.string().min(1),
  moderationThreshold: z.number().int().nonnegative(),
  features: z.object({
    voting: z.boolean(),
    moderationQueue: z.boolean(),
    sourceVerification: z.boolean()
  }),
  votingWindows: z.object({
    defaultStartAt: z.string().datetime(),
    defaultFreezeAt: z.string().datetime(),
    defaultEndAt: z.string().datetime()
  })
});

export type PromiseStatus = z.infer<typeof promiseStatusSchema>;
export type TenantConfig = z.infer<typeof tenantConfigSchema>;
