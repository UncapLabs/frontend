import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Creates a Drizzle client instance for interacting with the D1 database.
 */
export function createDbClient(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
