import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  drizzleDb?: DrizzleClient;
};

function getDb(): DrizzleClient {
  if (!globalForDb.drizzleDb) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Set it in .env.local or your Vercel project settings.",
      );
    }
    if (!globalForDb.pgClient) {
      globalForDb.pgClient = postgres(process.env.DATABASE_URL, {
        prepare: false,
        max: 1,
      });
    }
    globalForDb.drizzleDb = drizzle(globalForDb.pgClient, { schema });
  }
  return globalForDb.drizzleDb;
}

// Proxy so the connection is only opened on first actual use — not at module
// load time (which would break Vercel's build-time page data collection when
// DATABASE_URL is not yet available).
export const db = new Proxy({} as DrizzleClient, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

export { schema };
