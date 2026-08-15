import { readFile } from "node:fs/promises";
import path from "node:path";

import { pool } from "../db/index.js";
import { chunkText } from "./chunking.js";
import { getCachedEmbedding } from "./embedding-cache.js";

export async function ingestDocument(
  filePath: string
): Promise<void> {
  // Resolve the file path and read its contents
  const absolutePath = path.resolve(filePath);
  const content = await readFile(
    absolutePath,
    "utf-8"
  );

  // Use the file name as the document title
  const title = path.basename(filePath);

  // Insert the document and get its generated id
  const documentResult = await pool.query<{
    id: number;
  }>(
    `
      INSERT INTO documents (title)
      VALUES ($1)
      RETURNING id;
    `,
    [title]
  );

  const document = documentResult.rows[0];

  if (!document) {
    throw new Error(
      "Failed to create document record"
    );
  }

  const documentId = document.id;

  // Split the document into chunks
  const chunks = chunkText(content);

  // Generate/reuse embedding for each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (chunk === undefined) {
      continue;
    }

    const embedding =
      await getCachedEmbedding(chunk);

    // Insert chunk
    await pool.query(
      `
        INSERT INTO chunks
          (document_id, chunk_index, content, embedding)
        VALUES
          ($1, $2, $3, $4);
      `,
      [
        documentId,
        i,
        chunk,
        `[${embedding.join(",")}]`,
      ]
    );
  }

  console.log(
    `Document "${title}" ingested successfully.`
  );
  console.log(`Document ID: ${documentId}`);
  console.log(
    `Chunks inserted: ${chunks.length}`
  );
}