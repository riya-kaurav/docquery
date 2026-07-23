import { pool } from "../db/index.js";
import { embedText } from "./embeddings.js";

interface RetrievedChunk {
  document_id: number;
  chunk_index: number;
  content: string;
  distance: number;
}

export async function retrieveChunks(
  query: string,
  k: number = 3
): Promise<RetrievedChunk[]> {
  // Generate an embedding for the user's query
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
      ORDER BY distance ASC
      LIMIT $2;
    `,
    [`[${embedding.join(",")}]`, k]
  );

  return result.rows;
}