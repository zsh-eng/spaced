import '@/envConfig';
import type { Config } from 'drizzle-kit';

// See https://orm.drizzle.team/docs/migrations#migrations
// https://docs.turso.tech/sdk/ts/orm/drizzle
export default {
  schema: './src/schema.ts',
  out: './drizzle',
  driver: 'turso', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? '',
    authToken: process.env.TURSO_AUTH_TOKEN ?? '',
  },
} satisfies Config;
