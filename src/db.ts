import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error('DATABASE_URL and DATABASE_AUTH_TOKEN must be set');
}

const client = createClient({
  url,
  authToken,
});

const db = drizzle(client);

export default db;
