import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Turso / libSQL (SQLite compatible). Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
// in Vercel. Without them, local development uses a file in the project folder.
let client: Client | undefined;
let ready: Promise<unknown> | undefined;

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS `requests` (`id` text PRIMARY KEY NOT NULL, `kind` text NOT NULL, `name` text NOT NULL, `email` text NOT NULL, `message` text NOT NULL, `product` text, `created_at` integer NOT NULL, `status` text DEFAULT 'new' NOT NULL)",
  "CREATE TABLE IF NOT EXISTS `settings` (`key` text PRIMARY KEY NOT NULL, `value` text NOT NULL)",
  "CREATE INDEX IF NOT EXISTS `requests_email_created` ON `requests` (`email`,`created_at`)",
  "CREATE INDEX IF NOT EXISTS `requests_created` ON `requests` (`created_at`)",
];

function getClient(): Client {
  if (client) return client;
  const url =
    process.env.TURSO_DATABASE_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "file:local.db");
  if (!url) {
    throw new Error(
      "Database is not configured. Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) in your environment variables."
    );
  }
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

/** Returns a Drizzle client once the tables exist (created on first use). */
export async function getDb() {
  const c = getClient();
  ready ??= c.batch(SCHEMA, "write").catch((error) => {
    ready = undefined;
    throw error;
  });
  await ready;
  return drizzle(c, { schema });
}
