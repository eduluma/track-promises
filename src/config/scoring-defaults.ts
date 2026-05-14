import { z } from "zod";

// ---------------------------------------------------------------------------
// Halving schedule entry: when registered user count crosses `atUserCount`,
// the rolling window expands to `windowDays`. Entries must be sorted ascending
// by `atUserCount`. Inspired by Bitcoin's difficulty adjustment — the window
// *grows* as the platform matures, rewarding sustained participation and
// making burst-gaming harder over time.
// ---------------------------------------------------------------------------
export const halvingEntrySchema = z.object({
  atUserCount: z.number().int().nonnegative(),
  windowDays: z.number().int().positive()
});

export const scoringConfigSchema = z.object({
  /** Current rolling window in days (used when autoAdjust is false). */
  windowDays: z.number().int().positive().default(14),

  /** When true, windowDays is overridden by halvingSchedule based on user count. */
  autoAdjust: z.boolean().default(true),

  /** Ordered ascending by atUserCount. */
  halvingSchedule: z.array(halvingEntrySchema).default([
    { atUserCount: 0, windowDays: 7 },
    { atUserCount: 100, windowDays: 14 },
    { atUserCount: 500, windowDays: 30 },
    { atUserCount: 2000, windowDays: 60 },
    { atUserCount: 10000, windowDays: 90 }
  ]),

  /** Points threshold for auto-promotion to moderator_approved via score path. */
  promotionThreshold: z.number().int().positive().default(75),

  /** Per-signal weights. */
  weights: z
    .object({
      emailVerified: z.number().int().default(15),
      accountAge30d: z.number().int().default(10),
      accountAge90d: z.number().int().default(20),
      stateVerified: z.number().int().default(10),
      stateModeratorApproved: z.number().int().default(20),
      openReviewPenalty: z.number().int().default(-15),
      abuseFlagPenalty: z.number().int().default(-10),
      suspensionPenalty: z.number().int().default(-25),
      voteCast: z.number().int().default(2),
      voteAligned: z.number().int().default(5),
      flagActed: z.number().int().default(8),
      witnessedApproval: z.number().int().default(10),
      endorsementReceived: z.number().int().default(12)
    })
    .default({}),

  /** Max contribution per rolling window for each activity signal. */
  windowCaps: z
    .object({
      voteCast: z.number().int().default(20),
      voteAligned: z.number().int().default(25),
      flagActed: z.number().int().default(24),
      witnessedApproval: z.number().int().default(30),
      endorsementReceived: z.number().int().default(36)
    })
    .default({})
});

export type ScoringConfig = z.infer<typeof scoringConfigSchema>;
export type HalvingEntry = z.infer<typeof halvingEntrySchema>;

export const scoringDefaults: ScoringConfig = scoringConfigSchema.parse({});
