import { pool } from "../db/index.js";
import { embedText } from "./embeddings.js";

interface RetrievedChunk {
  document_id: number;
  chunk_index: number;
  content: string;
  distance: number;
}

export async function retrieve(
  query: string,
  k = 3
): Promise<RetrievedChunk[]> {
  // Embed the user's query
  const embedding = await embedText(query);

  // Search for the most similar chunks
  const result = await pool.query<RetrievedChunk>(
    `
      SELECT
        document_id,
        chunk_index,
        content,
        embedding <=> $1::vector AS distance
      FROM chunks
      ORDER BY embedding <=> $1::vector
      LIMIT $2;
    `,
    [`[${embedding.join(",")}]`, k]
  );

  return result.rows;
}