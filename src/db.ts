import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error('Database URL and auth token must be provided.');
}

const client = createClient({
  url,
  authToken,
});

const db = drizzle(client);

export default db;
