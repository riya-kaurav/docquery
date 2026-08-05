import type { FastifyInstance } from "fastify";
import { answerQuery } from "../services/rag.js";

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

    const result = await answerQuery(query.trim());

    return reply.send(result);
  });
}