# DocQuery — RAG Pipeline

A Retrieval-Augmented Generation (RAG) system built from scratch: upload documents, ask questions, get grounded answers with citations.

## What this project actually taught me (AI concepts)

- **Embeddings**: text converted into vectors (1536 numbers for `text-embedding-3-small`) where semantically similar text ends up numerically close together. Verified this by hand — computed cosine similarity across sentence pairs before trusting any library.
- **Cosine similarity vs. cosine distance**: similarity ranges -1 to 1 (higher = closer). pgvector's `<=>` operator returns *distance* (`1 - similarity`), so smaller = more similar. Easy to mix up, costly if you do.
- **Chunking**: splitting documents into overlapping pieces before embedding. Overlap exists so an idea that spans a chunk boundary doesn't get lost at retrieval time. Chunk size is a retrieval-quality lever, not a formatting detail — too big dilutes relevance, too small cuts ideas apart.
- **Vector search / ANN**: brute-force similarity search is O(n) and doesn't scale. pgvector's HNSW index makes retrieval fast by searching approximately, not exhaustively — a real speed-vs-exactness tradeoff.
- **RAG loop**: embed the query → retrieve top-k nearest chunks → inject them into a prompt → generate an answer constrained to that context only.
- **Grounding & hallucination control**: prompt explicitly forbids outside knowledge, mandates an exact fallback string ("I don't know based on the provided context.") when the answer isn't supported. A distance threshold *also* blocks clearly irrelevant retrievals from ever reaching the LLM — two layers, not one.
- **Citations**: chunks are numbered per-response; the model cites `[n]` inline; the backend maps `n` back to real `documentId`/`chunkId` so answers are traceable to source.
- **AI-specific failure handling**: 429 rate limits need to honor `Retry-After`, not just generic exponential backoff — blind retries on AI APIs cost real money and can make rate-limiting worse.
- **Evals**: retrieval quality (did the right chunk get retrieved — hit-rate) and generation quality (faithfulness — did the model only use what it was given) are separate things that fail independently and need separate tests.

## Architecture

```
Upload → Chunk → Embed → Store (Postgres + pgvector)
                                    ↓
Query → Embed → Vector Search (top-k) → Threshold Check
                                    ↓
                    Prompt + Context → LLM → Cited Answer
```

Ingestion runs as a BullMQ job (not inline) so uploads don't block the API — with retry/backoff tuned for AI-API-specific failures (rate limits) and a dead-letter queue for permanent failures. `/chat` responses are cached in Redis, keyed on the query plus a document-set version, so stale cache entries stop matching once new documents are ingested.

## Stack

TypeScript, Node.js, Fastify, PostgreSQL + pgvector, Redis + BullMQ, OpenRouter (OpenAI `text-embedding-3-small` for embeddings, chat completion for generation), Docker.

## Key design decisions

- **pgvector over a dedicated vector DB** — already knew Postgres, no new system to learn/run, cosine distance is a SQL operator.
- **Exact-match caching, not semantic caching** — simpler, sufficient for this scope. Cache key includes a document-set version so it self-invalidates on new ingestion instead of requiring active cache-busting.
- **Fixed 1-to-k citation numbering per response**, not raw DB chunk IDs — avoids leaking internal schema to the model/output while keeping the number resolvable server-side.

## Evals (real numbers, not estimates)

Ran a 13-case golden set (direct questions, no-answer cases, one genuinely ambiguous case) against the live pipeline with `k=1` (forces real discrimination, not corpus-coverage padding):

- **Retrieval hit-rate: 11/13** — both misses traced to one specific cause: content split across adjacent chunk boundaries.
- **No-answer fallback: 2/2 correct** — out-of-scope questions correctly triggered the refusal string.
- **Faithfulness (manual review): 7/8 fully grounded, 1/8 minor overstatement** — one answer upgraded "stores data primarily in memory" to "stores all data in memory," a real but minor grounding drift caught by comparing the answer against source text line by line.

