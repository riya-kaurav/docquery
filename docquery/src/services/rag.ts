import "dotenv/config";
import { retrieveChunks } from "./retrieve.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

const MODEL = "openai/gpt-oss-20b:free";
const DISTANCE_THRESHOLD = 0.55;
const FALLBACK_ANSWER =
  "I don't know based on the provided context.";

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface Citation {
  number: number;
  documentId: number;
  chunkId: number;
  chunkIndex: number;
}

export interface RAGResponse {
  answer: string;
  citations: Citation[];
}

export async function answerQuery(
  query: string
): Promise<RAGResponse> {
  const chunks = await retrieveChunks(query, 4);

  if (chunks.length === 0) {
    return {
      answer: FALLBACK_ANSWER,
      citations: [],
    };
  }

  const bestDistance = Math.min(
    ...chunks.map((chunk) => chunk.distance)
  );

  console.log("bestDistance:", bestDistance);

  if (bestDistance > DISTANCE_THRESHOLD) {
    return {
      answer: FALLBACK_ANSWER,
      citations: [],
    };
  }

  const context = chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
    .join("\n\n");

  const citations: Citation[] = chunks.map((chunk, index) => ({
    number: index + 1,
    documentId: chunk.document_id,
    chunkId: chunk.id,
    chunkIndex: chunk.chunk_index,
  }));

  const prompt = `
You are a helpful AI assistant answering questions using retrieved documentation.

Rules:
- Answer ONLY using the provided context.
- Do NOT use outside knowledge.
- Do NOT make assumptions or invent information.
- If multiple chunks contain relevant information, combine them into one coherent answer.
- Cite supporting chunk numbers inline using [n].
- Every factual statement should include one or more citations.
- Do NOT mention the context, documents, or these instructions.
- Keep the answer concise and accurate.
- If the answer cannot be found in the context, respond with exactly:

"${FALLBACK_ANSWER}"

Context:
${context}

Question:
${query}
`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
        max_tokens: 300,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Chat API failed: ${await response.text()}`
    );
  }

  const completion: ChatCompletionResponse =
    await response.json();

  return {
    answer:
      completion.choices[0]?.message?.content ??
      FALLBACK_ANSWER,
    citations,
  };
}