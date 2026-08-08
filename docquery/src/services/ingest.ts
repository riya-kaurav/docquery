import { readFile } from "node:fs/promises";
import path from "node:path";

import { pool } from "../db/index.js";
import { chunkText } from "./chunking.js";
import { embedTexts } from "./embeddings.js";

export async function ingestDocument(filePath: string): Promise<void> {
  
  // Resolve the file path and read its contents
  const absolutePath = path.resolve(filePath);
  const content = await readFile(absolutePath, "utf-8");

  // Use the file name as the document title
  const title = path.basename(filePath);

  // Insert the document and get its generated id
  const documentResult = await pool.query<{ id: number }>(
    `
      INSERT INTO documents (title)
      VALUES ($1)
      RETURNING id;
    `,
    [title]
  );

  const documentId = documentResult.rows[0].id;

  // Split the document into chunks
  const chunks = chunkText(content);

  // Generate embeddings for all chunks
  const embeddings = await embedTexts(chunks);

  // Insert every chunk
  for (let i = 0; i < chunks.length; i++) {
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
        chunks[i],
        `[${embeddings[i].join(",")}]`,
      ]
    );
  }

  console.log(`Document "${title}" ingested successfully.`);
  console.log(`Document ID: ${documentId}`);
  console.log(`Chunks inserted: ${chunks.length}`);
}