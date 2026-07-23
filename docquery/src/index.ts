// import { ingestDocument } from "./services/ingest.js";

// await ingestDocument("docs/ai-guide.txt")
// import { retrieveChunks } from "./services/retrieve.js";

// const results = await retrieveChunks(
//   "What is an LLM?",
//   2
// );

// console.log(results);
import { retrieveChunks } from "./services/retrieve.js";

const results = await retrieveChunks("What is Redis used for?", 2);

console.log(results);