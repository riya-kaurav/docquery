import redis from "../config/redis.js";
import {pool} from "../db/index.js";

export async function getDocSetVersion(): Promise<number> {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM documents"
  );

  return result.rows[0].count;
}

function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export async function buildCacheKey(query: string): Promise<string> {
  const docSetVersion = await getDocSetVersion();
  const normalizedQuery = normalizeQuery(query);

  return `chat:${docSetVersion}:${normalizedQuery}`;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);

  if (!cached) {
    return null;
  }

  return JSON.parse(cached) as T;
}

export async function setCached(
  key: string,
  value: unknown,
  ttl: number
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
}