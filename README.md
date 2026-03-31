# RAG Learning App

A small **retrieval-augmented generation (RAG)** web app for learning how RAG works end-to-end: ingest documents, embed chunks in **Supabase (Postgres + pgvector)**, chat with **Ollama**, and inspect retrieved context. The UI uses **Vite + React + TypeScript**, **Tailwind**, and **ElevenLabs UI**-style chat primitives.

- **Product spec:** `[tasks/prd-rag-learning-app.md](tasks/prd-rag-learning-app.md)`
- **Implementation tasks:** `[tasks/tasks-prd-rag-learning-app.md](tasks/tasks-prd-rag-learning-app.md)`
- **Design tokens:** `[docs/design-system.md](docs/design-system.md)`
- **Embeddings / vector size:** `[docs/embedding-model.md](docs/embedding-model.md)`

## Prerequisites

- **Node.js** (LTS recommended) and **npm** (or your preferred package manager).
- **Ollama** for local chat + embeddings (see **Install Ollama** below).
  - Pull the models referenced in `.env.example` (defaults shown here):
    - Embeddings: `nomic-embed-text` → `ollama pull nomic-embed-text`
    - Chat: `llama3.2` → `ollama pull llama3.2`
- A **Supabase** project if you use the hosted database (see migrations below).

## Install Ollama

Ollama runs a local HTTP API (default `http://127.0.0.1:11434`) that this app uses for embeddings and chat. Official downloads and release notes: [ollama.com/download](https://ollama.com/download).

### macOS

1. Install:
  - **Installer:** download and open the app from [ollama.com/download](https://ollama.com/download), or
  - **Homebrew:** `brew install --cask ollama`
2. Start the **Ollama** app once (menu bar). It keeps the API listening on port **11434**.

### Windows

1. Download the installer from [ollama.com/download](https://ollama.com/download) and run it.
2. Launch Ollama from the Start menu if the service is not already running.

### Linux

Many distros use the official install script (see [ollama.com/download](https://ollama.com/download) for the current command). A common pattern is:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

After install, ensure the daemon is running (often via `systemd`; the download page documents your distro).

### Verify

```bash
ollama --version
curl -sS http://127.0.0.1:11434/api/tags
```

If `curl` cannot connect, Ollama is not listening on `OLLAMA_HOST` (default `http://127.0.0.1:11434`). Then pull the models your `.env` references (see **Prerequisites** above).

## Quick start

One command installs dependencies, creates `.env` from `.env.example` if it does not exist yet, and pulls default Ollama models when `ollama` is on your PATH:

```bash
npm run setup
```

On macOS or Linux you can use:

```bash
make setup
```

**Manual next steps** (not automated):

- Edit `.env`: set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only; never commit secrets).
- Apply **Supabase database migrations** (see that section below) after linking a project or using local Supabase.
- Install and start **Ollama** if you skipped model pulls or do not have `ollama` on PATH (see **Install Ollama**).

**Frontend (Vite):**

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The dev proxy sends `/api` to the backend port configured in `vite.config.ts` when the API exists.

**Backend (API):** start the server (default `http://localhost:8787`) and then run the frontend.

```bash
npm run dev:server
```

If you want both at once:

```bash
npm run dev:all
```

The backend port is `PORT` (defaults to `8787`, and must match the Vite proxy target).

### Environment variables

- `VITE_API_URL`: optional base URL for API calls (leave empty when using the Vite `/api` proxy).
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: server-only; **never** expose the service role key to the browser.
- `OLLAMA_HOST`, `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL`, `EMBEDDING_DIM`: used for embeddings + generation.
- `CHUNK_SIZE` / `CHUNK_OVERLAP`: optional chunking tuning overrides.

```bash
npm run build
npm run lint
```

## Supabase database migrations

Postgres migrations live in `[supabase/migrations/](supabase/migrations/)`. Apply them before running ingest/chat that touches the DB.

### Prerequisites

- A [Supabase](https://supabase.com) project.
- Env vars from `[.env.example](.env.example)` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, …). **Never commit secrets.**

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


| Order | File                                                            |
| ----- | --------------------------------------------------------------- |
| 1     | `supabase/migrations/20260330120000_enable_pgvector.sql`        |
| 2     | `supabase/migrations/20260330120001_create_documents_table.sql` |
| 3     | `supabase/migrations/20260330120002_create_chunks_table.sql`    |
| 4     | `supabase/migrations/20260330120003_match_chunks_rpc.sql`       |


### Verify

- **Database → Extensions:** `vector` is enabled.
- **Table Editor:** `documents` and `chunks` exist under `public`.

**Security:** this app uses the **Supabase service role** key on the server to simplify ingest/chat during development.

Treat `SUPABASE_SERVICE_ROLE_KEY` as **dev-only**: it bypasses RLS. For production, switch to proper auth + RLS policies (and avoid relying on the service role key).

Never expose it to the browser or commit it to git.

## Quick smoke test

1. Start dependencies: Ollama (running) + Supabase (migrations applied).
2. In one terminal: `npm run dev:all` (frontend + backend).
3. In the app UI:
  - Ingest: paste some text or upload a `.pdf`/`.txt`/`.md`.
  - Chat: ask a question that should be answerable from the ingested text.
4. Verify the right-hand panel (`Retrieval and context`) shows ranked passages with scores and a collapsible context/prompt preview.

If Ollama isn’t running, ingest/chat will fail (backend health will show Ollama fetch failing). If you only see an empty state, ingest before chatting.

---

## AI dev workflow (ai-dev-tasks)

This repo started from the **AI Dev Tasks** idea: PRD → task list → one sub-task at a time. If you want that flow again, use the markdown prompts in the repo root:


| File                                           | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| `[create-prd.md](create-prd.md)`               | Draft a PRD with your AI assistant         |
| `[generate-tasks.md](generate-tasks.md)`       | Turn a PRD into a task list                |
| `[process-task-list.md](process-task-list.md)` | Work through tasks with review checkpoints |


Upstream reference: [github.com/snarktank/ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks).

## License

See `[LICENSE](LICENSE)` if present in the repository.