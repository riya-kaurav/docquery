import type { FastifyInstance } from "fastify";
import { addIngestJob } from "../queue/ingest.queue.js";

export async function ingestRoutes(
  fastify: FastifyInstance
) {
  fastify.post("/ingest", async (request, reply) => {
    const { filePath } = request.body as {
      filePath?: string;
    };

    if (!filePath || filePath.trim().length === 0) {
      return reply.status(400).send({
        error: "filePath is required.",
      });
    }

    try {
      const job = await addIngestJob(
        filePath.trim()
      );

      return reply.status(202).send({
        message: "Document ingestion queued.",
        jobId: job.id,
      });
    } catch (error) {
      fastify.log.error(error);

      return reply.status(500).send({
        error: "Failed to queue document ingestion.",
      });
    }
  });
}