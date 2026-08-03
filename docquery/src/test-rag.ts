// src/test-rag.ts

import { answerQuery } from "./services/rag.js";

async function main() {
  console.log(await answerQuery("What is Redis used for?"));
  console.log(await answerQuery("How do I bake a cake?"));
}

main().catch(console.error);