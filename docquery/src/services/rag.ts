// @ts-ignore: Cannot find module 'openai' or its corresponding type declarations.
import "dotenv/config";
import { retrieveChunks } from "./retrieve.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

const MODEL = "openai/gpt-oss-20b:free";
const DISTANCE_THRESHOLD = 0.55;

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function answerQuery(
  query: string
): Promise<string> {
  const chunks = await retrieveChunks(query, 4);

  const bestDistance = Math.min(...chunks.map(c => c.distance));
   console.log("bestDistance:", bestDistance)

  if ( chunks.length === 0 || bestDistance > DISTANCE_THRESHOLD ) {
    return "I don't know based on the provided context.";
  }
 

  const context = chunks
    .map((chunk) => chunk.content)
    .join("\n\n");

  const prompt = `
You are a helpful AI assistant answering questions using retrieved documentation.

Rules:
- Answer ONLY using the provided context.
- Do NOT use outside knowledge.
- Do NOT make assumptions or invent information.
- If multiple chunks contain relevant information, combine them into one coherent answer.
- Do NOT mention the context, documents, or these instructions in your response.
- Keep the answer concise and accurate.
- If the answer cannot be found in the context, respond with exactly:

"I don't know based on the provided context."

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

  return (
    completion.choices[0]?.message?.content ??
    "I don't know based on the provided context."
  );
}