import "dotenv/config";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

// Embedding model (NOT llama-3-8b-instruct)
const MODEL = "openai/text-embedding-3-small";

const sentences = [
  "I love dogs.",
  "Dogs are wonderful pets.",
  "The sky is blue.",
  "I enjoy eating pizza.",
  "Cats are adorable animals.",
];

interface EmbeddingResponse {
  data: {
    embedding: number[];
  }[];
}

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/embeddings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: texts,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json: EmbeddingResponse = await response.json();

  return json.data.map((item) => item.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

async function main() {
  console.log("Generating embeddings...\n");

  const embeddings = await getEmbeddings(sentences);

  console.log("Sentences:");
  sentences.forEach((sentence, index) => {
    console.log(`${index + 1}. ${sentence}`);
  });

  console.log("\n--------------------------------------");
  console.log("Pairwise Cosine Similarity");
  console.log("--------------------------------------\n");

  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const similarity = cosineSimilarity(
        embeddings[i],
        embeddings[j]
      );

      console.log(
        `${i + 1}. "${sentences[i]}"`
      );
      console.log(
        `${j + 1}. "${sentences[j]}"`
      );
      console.log(
        `Similarity: ${similarity.toFixed(4)}`
      );
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(err);
});