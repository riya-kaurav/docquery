import "dotenv/config";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

const MODEL = "openai/text-embedding-3-small";

interface EmbeddingResponse {
  data: {
    embedding: number[];
  }[];
}

export async function embedTexts(
  texts: string[]
): Promise<number[][]> {
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
    throw new Error(
      `Embedding API failed: ${await response.text()}`
    );
  }

  const json: EmbeddingResponse = await response.json();

  return json.data.map((item) => item.embedding);
}

export async function embedText(
  text: string
): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}