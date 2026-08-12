import type { FastifyInstance } from "fastify";
import { answerQuery } from "../services/rag.js";
import {
  buildCacheKey,
  getCached,
  setCached,
} from "../services/cache.js";

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post("/chat", async (request, reply) => {
    const { query } = request.body as {
      query?: string;
    };

    if (!query || query.trim().length === 0) {
      return reply.status(400).send({
        error: "Query is required.",
      });
    }

    try {
      const normalizedQuery = query.trim();

      const cacheKey = await buildCacheKey(normalizedQuery);

      const cached = await getCached(cacheKey);

      if (cached) {
        console.log("[CACHE HIT]", cacheKey);
        return reply.send(cached);
      }

      console.log("[CACHE MISS]", cacheKey);

      const result = await answerQuery(normalizedQuery);

      await setCached(cacheKey, result, 300);

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);

      return reply.status(502).send({
        error: "Failed to communicate with AI service.",
      });
    }
  });
}