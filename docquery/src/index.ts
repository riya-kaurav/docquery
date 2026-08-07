import Fastify from "fastify";
import { chatRoutes } from "./routes/chat.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(chatRoutes);

await fastify.listen({
  port: 3000,
});

console.log("Server running on http://localhost:3000");

