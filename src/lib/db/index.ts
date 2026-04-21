import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Set it in .env.local or your Vercel project settings.",
    );
  }
  if (!globalForDb.client) {
    globalForDb.client = postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 1,
    });
  }
  return globalForDb.client;
}

export const db = drizzle(getClient(), { schema });
export { schema };
