import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

export function createDbClient(connectionString: string = process.env.DATABASE_URL ?? "") {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a database client.");
  }

  const client = postgres(connectionString, {
    max: 1
  });

  return drizzle(client, { schema });
}