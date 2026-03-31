# Embedding model and vector dimension

Authoritative choice for the RAG Learning App **ingest and retrieval** pipeline. Keep **`EMBEDDING_DIM`** in `.env` aligned with whatever model Ollama returns at runtime.

---

## Chosen model (local / Ollama)

| Setting | Value |
|--------|--------|
| **Ollama model** | `nomic-embed-text` |
| **Embedding length** | **768** |

**Pull locally:**

```bash
ollama pull nomic-embed-text
```

`nomic-embed-text` is a common default in the Ollama library and is documented to emit **768-dimensional** vectors (Nomic BERT–style embedding head). Use the same dimension for **pgvector** columns and indexes (e.g. `vector(768)`).

---

## Why this default

- Works out of the box with **`ollama pull`** and the HTTP embedding API.
- Single clear number for migrations and server env validation.
- Good tradeoff of quality and size for a learning MVP.

---

## If you change the model

1. **Re-check the dimension** your Ollama build returns (inspect model metadata or a one-off embed call).
2. Set **`OLLAMA_EMBEDDING_MODEL`** and **`EMBEDDING_DIM`** to match.
3. **Recreate or migrate** the `chunks.embedding` column and indexes; pgvector dimension is fixed per column.

---

## Related env vars

See root **`.env.example`**: `OLLAMA_EMBEDDING_MODEL`, `EMBEDDING_DIM`.
