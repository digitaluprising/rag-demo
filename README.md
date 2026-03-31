# RAG Learning App

A small **retrieval-augmented generation (RAG)** web app for learning how RAG works end-to-end: ingest documents, embed chunks in **Supabase (Postgres + pgvector)**, chat with **Ollama**, and inspect retrieved context. The UI uses **Vite + React + TypeScript**, **Tailwind**, and **ElevenLabs UI**-style chat primitives.

- **Product spec:** [`tasks/prd-rag-learning-app.md`](tasks/prd-rag-learning-app.md)
- **Implementation tasks:** [`tasks/tasks-prd-rag-learning-app.md`](tasks/tasks-prd-rag-learning-app.md)
- **Design tokens:** [`docs/design-system.md`](docs/design-system.md)
- **Embeddings / vector size:** [`docs/embedding-model.md`](docs/embedding-model.md)

## Prerequisites

- **Node.js** (LTS recommended) and **npm** (or your preferred package manager).
- **Ollama** for local chat + embeddings ([install](https://ollama.com/download)), then e.g. `ollama pull nomic-embed-text` and a chat model of your choice (see `.env.example`).
- A **Supabase** project if you use the hosted database (see migrations below).

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env: Supabase URL + service role (server-only), Ollama host/models, etc.
```

**Frontend (Vite):**

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The dev proxy sends `/api` to the backend port configured in `vite.config.ts` when the API exists.

**Backend:** an API under `server/` is wired for `npm run dev:server` and `npm run dev:all` once that code exists (see task list).

```bash
npm run build
npm run lint
```

## Supabase database migrations

Postgres migrations live in [`supabase/migrations/`](supabase/migrations/). Apply them before running ingest/chat that touches the DB.

### Prerequisites

- A [Supabase](https://supabase.com) project.
- Env vars from [`.env.example`](.env.example) (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, …). **Never commit secrets.**

### Option A — Supabase CLI (recommended)

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).
2. `supabase login`
3. Link the project (reference ID: **Project Settings → General**):

   ```bash
   supabase link --project-ref <your-project-ref>
   ```

4. Push migrations:

   ```bash
   supabase db push
   ```

   Files run in **timestamp order** (`YYYYMMDDHHmmss_*.sql`).

### Option B — Supabase Dashboard (SQL Editor)

Run each file **in order**, one script at a time:

| Order | File |
|------|------|
| 1 | `supabase/migrations/20260330120000_enable_pgvector.sql` |
| 2 | `supabase/migrations/20260330120001_create_documents_table.sql` |
| 3 | `supabase/migrations/20260330120002_create_chunks_table.sql` |

### Verify

- **Database → Extensions:** `vector` is enabled.
- **Table Editor:** `documents` and `chunks` exist under `public`.

**Security:** use the **service role** key only in server-side code; it bypasses RLS. Do not expose it to the browser.

---

## AI dev workflow (ai-dev-tasks)

This repo started from the **AI Dev Tasks** idea: PRD → task list → one sub-task at a time. If you want that flow again, use the markdown prompts in the repo root:

| File | Purpose |
|------|---------|
| [`create-prd.md`](create-prd.md) | Draft a PRD with your AI assistant |
| [`generate-tasks.md`](generate-tasks.md) | Turn a PRD into a task list |
| [`process-task-list.md`](process-task-list.md) | Work through tasks with review checkpoints |

Upstream reference: [github.com/snarktank/ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks).

## License

See [`LICENSE`](LICENSE) if present in the repository.
