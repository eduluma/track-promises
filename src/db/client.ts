import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

// Reuse the same postgres connection across HMR reloads in dev to avoid
// "too many connections" and "Failed query" errors from stale sockets.
const globalForDb = globalThis as typeof globalThis & {
  __trackPromisesDb?: ReturnType<typeof drizzle>;
};

export function createDbClient(connectionString: string = process.env.DATABASE_URL ?? "") {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a database client.");
  }

  if (!globalForDb.__trackPromisesDb) {
    const client = postgres(connectionString, { max: 5 });
    globalForDb.__trackPromisesDb = drizzle(client, { schema });
  }

  return globalForDb.__trackPromisesDb;
}