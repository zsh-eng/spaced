import 'dotenv/config'
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Database URL and auth token must be provided.");
}

const client = createClient({
  url,
  authToken,
});

const db = drizzle(client, { schema });

export default db;
