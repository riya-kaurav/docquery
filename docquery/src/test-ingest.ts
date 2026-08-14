import { ingestDocument } from "./services/ingest.js";

const filePath = "./docs/redis-guide.txt";

async function main() {
  console.log("Starting ingestion:", filePath);

  try {
    const result = await ingestDocument(filePath);

    console.log("Ingestion completed:", result);
  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }
}

main();