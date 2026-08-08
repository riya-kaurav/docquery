import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const ingestQueue = new Queue("document-ingestion", {
  connection: redis,
});

export async function addIngestJob(filePath: string) {
  return ingestQueue.add(
    "ingest-document",
    {
      filePath,
    },
    {
      attempts: 5,
      backoff: {
        type: "custom",
      },
    }
  );
}