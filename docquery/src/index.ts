// import { ingestDocument } from "./services/ingest.js";

// await ingestDocument("docs/ai-guide.txt");
import { retrieve } from "./services/retrieve.js";

const results = await retrieve("What is Redis?", 3);

console.log(results);