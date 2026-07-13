-- enable pg extension 
CREATE EXTENSION IF NOT EXISTS vector;

-- store upoaded elements
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- store chunks belonging to documents
CREATE TABLE chunkS (
    document_id UNTEGER NOT NULL REFERENCE documents(id) ON DELETE CASCADE
    chunk_index INTEGER NOT NULL,
    content NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMP DEFAULT NOW()
);