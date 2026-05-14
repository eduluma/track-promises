import { and, eq } from "drizzle-orm";

import { runQuery } from "@/db/client";
import { voteEvents, votes } from "@/db/schema";
import type { VoteCategory } from "@/lib/permissions";
import { ensureGuestUser } from "@/modules/auth/user-store";
import type { VoteValue } from "@/modules/voting/assessment";

export type VoteRecord = {
  tenantId: string;
  promiseId: string;
  userId: string;
  value: VoteValue;
  voteCategory: VoteCategory;
  createdAt: string;
  updatedAt: string;
};

export type VoteEventRecord = {
  tenantId: string;
  promiseId: string;
  userId: string;
  previousValue: VoteValue | null;
  newValue: VoteValue;
  voteCategory: VoteCategory;
  eventType: "created" | "changed";
  createdAt: string;
};

function isGuest(userId: string) {
  return userId === "guest" || userId.startsWith("guest-");
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function upsertVote(record: VoteRecord): Promise<void> {
  if (isGuest(record.userId)) {
    await ensureGuestUser(record.userId);
  }

  const id = `${record.tenantId}:${record.promiseId}:${record.userId}`;
  await runQuery((db) =>
    db
      .insert(votes)
      .values({
        id,
        tenantId: record.tenantId,
        promiseId: record.promiseId,
        userId: record.userId,
        value: record.value as (typeof votes.$inferInsert)["value"],
        voteCategory: record.voteCategory,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt)
      })
      .onConflictDoUpdate({
        target: [votes.promiseId, votes.userId],
        set: {
          value: record.value as (typeof votes.$inferInsert)["value"],
          voteCategory: record.voteCategory,
          updatedAt: new Date(record.updatedAt)
        }
      })
  );
}

export async function appendVoteEvent(record: VoteEventRecord): Promise<void> {
  if (isGuest(record.userId)) {
    await ensureGuestUser(record.userId);
  }

  const id = `event:${record.tenantId}:${record.promiseId}:${record.userId}:${record.createdAt}`;
  await runQuery((db) =>
    db
      .insert(voteEvents)
      .values({
        id,
        tenantId: record.tenantId,
        promiseId: record.promiseId,
        userId: record.userId,
        previousValue: record.previousValue as (typeof voteEvents.$inferInsert)["previousValue"],
        newValue: record.newValue as (typeof voteEvents.$inferInsert)["newValue"],
        eventType: record.eventType,
        voteCategory: record.voteCategory,
        createdAt: new Date(record.createdAt)
      })
      .onConflictDoNothing()
  );
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

function rowToVoteRecord(row: typeof votes.$inferSelect): VoteRecord {
  return {
    tenantId: row.tenantId,
    promiseId: row.promiseId,
    userId: row.userId,
    value: row.value as VoteValue,
    voteCategory: (row.voteCategory ?? "verified") as VoteCategory,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function listVotesForPromise(tenantId: string, promiseId: string): Promise<VoteRecord[]> {
  const rows = await runQuery((db) =>
    db.select().from(votes).where(and(eq(votes.tenantId, tenantId), eq(votes.promiseId, promiseId)))
  );
  return rows.map(rowToVoteRecord);
}

export async function getVoteForUser(
  tenantId: string,
  promiseId: string,
  userId: string
): Promise<VoteRecord | null> {
  const rows = await runQuery((db) =>
    db
      .select()
      .from(votes)
      .where(and(eq(votes.tenantId, tenantId), eq(votes.promiseId, promiseId), eq(votes.userId, userId)))
      .limit(1)
  );
  const [row] = rows;
  return row ? rowToVoteRecord(row) : null;
}

export async function listVoteEventsForPromise(tenantId: string, promiseId: string): Promise<VoteEventRecord[]> {
  const rows = await runQuery((db) =>
    db.select().from(voteEvents).where(and(eq(voteEvents.tenantId, tenantId), eq(voteEvents.promiseId, promiseId)))
  );

  return rows.map((row) => ({
    tenantId: row.tenantId,
    promiseId: row.promiseId,
    userId: row.userId,
    previousValue: (row.previousValue ?? null) as VoteValue | null,
    newValue: row.newValue as VoteValue,
    voteCategory: (row.voteCategory ?? "verified") as VoteCategory,
    eventType: row.eventType as "created" | "changed",
    createdAt: row.createdAt.toISOString()
  }));
}

export async function listAllVotesForTenant(tenantId: string): Promise<VoteRecord[]> {
  const rows = await runQuery((db) =>
    db.select().from(votes).where(eq(votes.tenantId, tenantId))
  );
  return rows.map(rowToVoteRecord);
}

export async function listAllVoteEventsForTenant(tenantId: string): Promise<VoteEventRecord[]> {
  const rows = await runQuery((db) =>
    db.select().from(voteEvents).where(eq(voteEvents.tenantId, tenantId))
  );

  return rows.map((row) => ({
    tenantId: row.tenantId,
    promiseId: row.promiseId,
    userId: row.userId,
    previousValue: (row.previousValue ?? null) as VoteValue | null,
    newValue: row.newValue as VoteValue,
    voteCategory: (row.voteCategory ?? "verified") as VoteCategory,
    eventType: row.eventType as "created" | "changed",
    createdAt: row.createdAt.toISOString()
  }));
}

export async function listVotesForUser(userId: string): Promise<VoteRecord[]> {
  const rows = await runQuery((db) => db.select().from(votes).where(eq(votes.userId, userId)));
  return rows.map(rowToVoteRecord);
}

// Kept for backwards-compat with seed.ts (seed no longer uses this)
export const seedVotes: VoteRecord[] = [];

