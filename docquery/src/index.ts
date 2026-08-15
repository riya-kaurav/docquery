import Fastify from "fastify";
import { chatRoutes } from "./routes/chat.js";
import { ingestRoutes } from "./routes/ingest.js";
import "./jobs/ingest.job.js"

const fastify = Fastify({
  logger: true,
});

await fastify.register(chatRoutes);
await fastify.register(ingestRoutes);

await fastify.listen({
  port: Number(process.env.PORT) || 3000,
  host: "0.0.0.0",
});

console.log("Server running on http://localhost:3000");