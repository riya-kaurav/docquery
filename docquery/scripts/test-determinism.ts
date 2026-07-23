import { embedText } from "../src/services/embeddings.js";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  const first = await embedText("what is ai");
  const second = await embedText("what is ai");

  const similarity = cosineSimilarity(first, second);

  console.log("Cosine similarity:", similarity);
}

main().catch(console.error);