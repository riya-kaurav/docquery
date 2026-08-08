import Fastify from "fastify";
import { chatRoutes } from "./routes/chat.js";
import { ingestRoutes } from "./routes/ingest.js";
import "../src/jobs/ingest.job.js"

const fastify = Fastify({
  logger: true,
});

await fastify.register(chatRoutes);
await fastify.register(ingestRoutes);

await fastify.listen({
  port: 3000,
});

console.log("Server running on http://localhost:3000");