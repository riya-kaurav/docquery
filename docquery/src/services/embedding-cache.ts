import crypto from "node:crypto";
import redis from "../config/redis.js";
import { embedText } from "./embeddings.js";

const EMBEDDING_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

function getChunkHash(content: string): string {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}

export async function getCachedEmbedding(
  content: string
): Promise<number[]> {
  const hash = getChunkHash(content);
  const cacheKey = `embedding:${hash}`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    console.log("[EMBEDDING CACHE HIT]", cacheKey);
    return JSON.parse(cached);
  }

  console.log("[EMBEDDING CACHE MISS]", cacheKey);

  const embedding = await embedText(content);

  await redis.set(
    cacheKey,
    JSON.stringify(embedding),
    "EX",
    EMBEDDING_CACHE_TTL
  );

  console.log("[EMBEDDING CACHE SET]", cacheKey);

  return embedding;
}