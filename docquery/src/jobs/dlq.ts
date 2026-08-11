import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const ingestDLQ = new Queue("document-ingestion-dlq", {
  connection: redis,
});