-- enable pg extension 
CREATE EXTENSION IF NOT EXISTS vector;

-- store upoaded elements
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- store chunks belonging to documents
CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,

    document_id INTEGER NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    chunk_index INTEGER NOT NULL,

    content TEXT NOT NULL,

    embedding VECTOR(1536),

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (document_id, chunk_index)
);