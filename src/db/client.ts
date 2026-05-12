import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

// Reuse the same postgres client across HMR reloads in dev to avoid
// "too many connections" and "Failed query" errors from stale sockets.
const globalForDb = globalThis as typeof globalThis & {
  __trackPromisesClient?: postgres.Sql;
  __trackPromisesDb?: ReturnType<typeof drizzle>;
};

export function createDbClient(connectionString: string = process.env.DATABASE_URL ?? "") {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a database client.");
  }

  if (!globalForDb.__trackPromisesClient || !globalForDb.__trackPromisesDb) {
    const client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => { },
    });
    globalForDb.__trackPromisesClient = client;
    globalForDb.__trackPromisesDb = drizzle(client, { schema });
  }

  return globalForDb.__trackPromisesDb;
}

/** Drop the cached client (e.g. after a fatal connection error). */
export function resetDbClient() {
  if (globalForDb.__trackPromisesClient) {
    void globalForDb.__trackPromisesClient.end({ timeout: 1 });
  }
  globalForDb.__trackPromisesClient = undefined;
  globalForDb.__trackPromisesDb = undefined;
}

const CONNECTION_ERROR_CODES = new Set(["ECONNREFUSED", "ECONNRESET", "ENOTFOUND"]);

function isConnectionError(err: unknown): boolean {
  const visited = new WeakSet<object>();

  const inspect = (value: unknown): boolean => {
    if (!value || typeof value !== "object") {
      return false;
    }

    if (visited.has(value)) {
      return false;
    }

    visited.add(value);

    const code = (value as { code?: unknown }).code;
    if (typeof code === "string" && CONNECTION_ERROR_CODES.has(code)) {
      return true;
    }

    const cause = (value as { cause?: unknown }).cause;
    if (inspect(cause)) {
      return true;
    }

    const errors = (value as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.some((entry) => inspect(entry))) {
      return true;
    }

    return false;
  };

  return inspect(err);
}

/**
 * Run a DB query, retrying once with a fresh connection pool on connection errors.
 * Use this instead of calling createDbClient() + awaiting directly.
 */
export async function runQuery<T>(
  fn: (db: ReturnType<typeof createDbClient>) => Promise<T>
): Promise<T> {
  try {
    return await fn(createDbClient());
  } catch (err) {
    if (isConnectionError(err)) {
      resetDbClient();
      return fn(createDbClient());
    }
    throw err;
  }
}