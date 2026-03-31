# Task list: RAG Learning App

Derived from [`prd-rag-learning-app.md`](prd-rag-learning-app.md). Codebase is **greenfield** (workflow markdown only); paths below are **proposed** for implementation.

---

## Relevant Files

### Root & config

- `package.json` — Scripts for Vite dev, API server, `test` / `test:watch` (Vitest), combined dev (e.g. `concurrently`), dependency versions (`hono`, `@supabase/supabase-js`, `dotenv`, `pdf-parse`, `vitest`, etc.).
- `package-lock.json` — NPM lockfile tracking installed dependencies (`motion`, Tailwind, `concurrently`, `tsx`, etc.).
- `vite.config.ts` — Vite + React plugin, proxy to local API in dev, path aliases (`@/`).
- `src/vite-env.d.ts` — Vite client type references (`import.meta.env`, asset modules).
- `eslint.config.js` — Flat ESLint config (TypeScript + React Hooks + react-refresh).
- `vitest.config.ts` — Vitest (`node` env); `server/**/*.test.ts`.
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` / `tsconfig.server.json` — TypeScript for app, tooling, and `server/` (included in `tsc -b`).
- `tailwind.config.ts` / `postcss.config.js` — Tailwind v4 via `@tailwindcss/postcss`; content paths; 4px spacing scale documented in config (default `spacing-*` = 0.25rem steps).
- `components.json` — shadcn-style registry config used by `@elevenlabs/cli`; aliases point to `src/components` and `src/lib`.
- `.env.example` — `VITE_API_URL`, server-side `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OLLAMA_HOST`, model names, `EMBEDDING_DIM`, chunk defaults (documented; no secrets committed).

### Supabase

- [`docs/embedding-model.md`](../docs/embedding-model.md) — Chosen Ollama embedding model (`nomic-embed-text`) and dimension **768** for pgvector.
- `supabase/migrations/20260330120000_enable_pgvector.sql` — Enable `vector` extension (timestamped per Supabase migration rules).
- `supabase/migrations/20260330120001_create_documents_table.sql` — `documents` table + RLS (permissive dev policies for `anon` / `authenticated`).
- `supabase/migrations/20260330120002_create_chunks_table.sql` — `chunks` (`document_id`, `content`, `chunk_index`, `embedding vector(768)`), btree on `document_id`, hnsw on `embedding`, RLS.
- `supabase/migrations/20260330120003_match_chunks_rpc.sql` — `match_chunks(query_embedding, match_count)` cosine search + join `documents` for titles.

### Backend API (thin server; keeps secrets off the client)

- `server/index.ts` — Hono bootstrap, CORS for Vite dev origins, `GET /api`, `GET /api/health`, `/api/ingest`, `/api/chat`.
- `server/env.ts` — `dotenv` load; validate `SUPABASE_*`, defaults for Ollama host/models and `EMBEDDING_DIM`.
- `server/lib/supabase.ts` — `createClient` with **service role** + `checkSupabaseHealth()`.
- `server/lib/ollama.ts` — `embed()`, `chat()`, `checkOllamaHealth()`, `OllamaHttpError`, timeouts on fetches.
- `server/lib/chunk.ts` — `DEFAULT_CHUNK_SIZE` / `DEFAULT_CHUNK_OVERLAP`, `chunkText()` sliding-window chunking.
- `server/lib/chunk.test.ts` — Vitest unit tests for boundaries, overlap, defaults, invalid params.
- `server/lib/pdf.ts` — `pdfBufferToText()` via `pdf-parse` v2 `PDFParse`; caps **10 MiB** / **50 pages** by default (`PdfTooLargeError`).
- `server/lib/pdf.test.ts` — Size-limit and mocked `getText`/`destroy` smoke tests.
- `server/lib/prompt.ts` — `buildRagChatInput()`: system prompt, user message with context excerpts, `contextPreview` for explainability.
- `server/lib/prompt.test.ts` — Vitest for RAG message shape and labels.
- `server/lib/score.ts` — `distanceToScore()` maps pgvector cosine distance to [0, 1] similarity.
- `server/lib/score.test.ts` — Vitest for score mapping and clamping.
- `server/routes/ingest.ts` — `POST /` (mounted at `/api/ingest`): JSON `{ text, title? }` or multipart files (`.txt`/`.md`/`.pdf`), `hono/body-limit`, chunk + embed + DB insert.
- `server/types/api.ts` — Ingest + chat DTOs (`ChatResponse`, `RetrievedChunk`, `ApiErrorBody`, etc.).
- `server/routes/chat.ts` — `POST /api/chat`: embed query, `match_chunks` RPC, `distanceToScore`, Ollama chat, structured errors (`OLLAMA`, `DATABASE`, …).

### Design system & typography

- [`docs/design-system.md`](../docs/design-system.md) — Layout (grid, mobile-first, no document scroll), typography scale (1.25, base 16px), 4px spacing, Headline/Body/Label, Motion, calm brand.
- `fonts/` — Source General Sans files provided by you.
- `src/assets/fonts/` — App-consumed copy/symlink of General Sans files for Vite bundling; `@font-face` in global CSS.
- `src/styles/typography.css` — `--font-size-base`, `--font-scale`, `--step--2`…`--step-4`, `--font-size-label-min`; `@font-face` in `src/index.css` (Vite-resolved URLs to `src/assets/fonts/*.woff2`).
- `src/components/typography/Headline.tsx`, `Body.tsx`, `Label.tsx`, `typography-color.ts`, `index.ts` — Use-case components; line-heights 1.2 / 1.4 / 1; `color` → `primary` | `muted` | `secondary` | `danger`; Label `font-size: max(12px, var(--step--1))`.

### Frontend (Vite + React)

- `index.html` — Root HTML.
- `src/main.tsx` — React root, providers if any.
- `src/App.tsx` — CSS Grid shell (ingest | chat | sources); ingest panel wired, chat still static demo; internal scroll only.
- `src/App.css` — Grid areas, panel headers, `min-h-0` / overflow for chat column scroll.
- `src/index.css` — Tailwind entry, global styles, font faces; `@theme` bridge for shadcn tokens; `@custom-variant dark` for `prefers-color-scheme`.
- `src/components/ui/conversation.tsx` — ElevenLabs Conversation (and related subcomponents if split).
- `src/components/ui/button.tsx` / `button-variants.ts` — shadcn-style Button + shared `buttonVariants` (CVA) for Conversation scroll button.
- `src/components/ui/avatar.tsx` — shadcn-style Avatar primitive used by Message component.
- `src/components/ui/message.tsx` — ElevenLabs Message / MessageContent.
- `src/components/ui/shimmering-text.tsx` — ElevenLabs ShimmeringText.
- `src/components/ui/response.tsx` — Optional; ElevenLabs Response for markdown rendering if added.
- `src/lib/utils.ts` — Shared `cn()` class merge helper (`clsx` + `tailwind-merge`) used by UI components.
- `src/features/chat/ChatPanel.tsx` — Conversation list, message mapping, loading row with ShimmeringText states (“Retrieving sources…”, “Generating answer…”).
- `src/features/chat/useChat.ts` — State: messages, streaming/phase flags, call `POST /api/chat`, error handling.
- `src/features/ingest/IngestPanel.tsx` — Paste textarea, file input `.txt`/`.md`/`.pdf`, submit to `POST /api/ingest`.
- `src/features/explain/ExplainabilityPanel.tsx` — List retrieved chunks (text, score, source label); collapsible context/prompt preview.
- `src/lib/api.ts` — Typed API client (`ingestText`, `ingestFiles`), `ApiError`, shared error parsing, optional `VITE_API_URL` base.

### Docs

- `README.md` (project root) — AI Dev Tasks workflow intro; **RAG Learning App** subsection with Supabase migration steps (`supabase link` + `supabase db push`, or SQL Editor in file order). Task **10.1** expands full runbook (Ollama, Vite + server, security).

### Notes

- Prefer **Vitest** with Vite (`vitest.config.ts`); if the project uses Jest instead, run `npx jest [path]` per project config. Place unit tests **next to** modules under test (e.g. `chunk.test.ts` beside `chunk.ts`).
- ElevenLabs UI components expect **Tailwind** and often **shadcn-style** primitives; add dependencies their CLI pulls in (`motion`, `use-stick-to-bottom`, etc.).
- Never expose **Supabase service role** or **Ollama** to the public browser in production; for local learning, localhost-only is fine.

---

## Tasks

- [x] **1.0** Scaffold Vite + React + TypeScript and shared tooling
  - [x] 1.1 Initialize Vite (`react-ts`), configure path alias `@/` and `vite.config.ts` dev proxy to backend (e.g. `/api` → `http://localhost:8787`).
  - [x] 1.2 Add Tailwind + PostCSS; **spacing theme: multiples of 4px**; root `min-h-dvh` + `overflow-hidden` for single-page shell per [`docs/design-system.md`](../docs/design-system.md).
  - [x] 1.3 Add **General Sans**: source from `fonts/`, copy/symlink into `src/assets/fonts/`, add `@font-face` + `font-family` on `body`; wire **CSS variables** `--font-size-base` (16px), `--font-scale` (1.25) and derived size steps for later Headline/Body/Label.
  - [x] 1.4 Add **`motion`** package ([motion.dev](https://motion.dev/)); respect `prefers-reduced-motion` in layout/micro-interactions.
  - [x] 1.5 Add ESLint (optional) and root scripts: `dev` (Vite), `dev:server` (API), `dev:all` (concurrent) as needed.
  - [x] 1.6 Add `.env.example` with `VITE_API_URL`, document no secrets in git.

- [x] **2.0** Add ElevenLabs UI chat primitives + typography components
  - [x] 2.1 Implement **`Headline`**, **`Body`**, **`Label`** per [`docs/design-system.md`](../docs/design-system.md) (line-heights 1.2 / 1.4 / 1; `color` prop; Label **min 12px**).
  - [x] 2.2 Run `@elevenlabs/cli` to add `conversation`, `message`, `shimmering-text` (and `response` if using markdown rendering).
  - [x] 2.3 Fix any peer dependency gaps (`use-stick-to-bottom`, shadcn bits); align ElevenLabs styles with design tokens (calm, General Sans).
  - [x] 2.4 Create a static demo in `App`: **CSS Grid** mobile-first layout, chat region with Conversation + empty state + sample messages + ShimmeringText; **no document scroll** (internal scroll only).

- [x] **3.0** Supabase schema: pgvector, documents, chunks
  - [x] 3.1 Document chosen **embedding model** and **dimension** (resolve PRD open question; e.g. `nomic-embed-text` and matching `vector(N)`).
  - [x] 3.2 Write SQL migration: enable `pgvector`, create `documents` (id, title/filename, source_type, created_at, metadata jsonb).
  - [x] 3.3 Create `chunks` (id, document_id FK, content text, chunk_index, embedding vector(N), created_at); add index for vector similarity + index on `document_id`.
  - [x] 3.4 Apply migrations in Supabase dashboard or CLI; record steps in README.

- [x] **4.0** Backend server: env, Supabase service client, Ollama client
  - [x] 4.1 Add `server/` package or workspace with TypeScript build/run (e.g. `tsx` watch); single entry `server/index.ts`.
  - [x] 4.2 Implement `server/env.ts` and load `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OLLAMA_HOST`, embedding/chat model names.
  - [x] 4.3 Implement `server/lib/supabase.ts` (service role, server-only).
  - [x] 4.4 Implement `server/lib/ollama.ts`: POST `/api/embeddings` and `/api/chat` (or Ollama’s paths) with timeouts and typed errors.
  - [x] 4.5 Wire health route `GET /api/health` checking Ollama + Supabase connectivity for easier debugging.

- [x] **5.0** Chunking + PDF/text extraction + ingest route
  - [x] 5.1 Implement `server/lib/chunk.ts` with exported constants (chunk size, overlap) and `chunkText(input: string): string[]`.
  - [x] 5.2 Add unit tests for `chunk.ts` (`chunk.test.ts`).
  - [x] 5.3 Implement `server/lib/pdf.ts` using `pdf-parse` (or equivalent) for buffer → string; cap file size / pages for MVP (resolve open question with sensible defaults).
  - [x] 5.4 Implement `POST /api/ingest`: accept JSON `{ text, title? }` and `multipart/form-data` for `.txt`/`.md`/`.pdf`; normalize to plain text; chunk; embed each chunk via Ollama; insert `documents` + `chunks` rows.
  - [x] 5.5 Return summary JSON: document id, chunk count, errors per file if batching.

- [x] **6.0** RAG chat route: retrieve, prompt, generate, explainability payload
  - [x] 6.1 Implement `POST /api/chat`: body `{ message, top_k?, optional temperature }`; embed user message; run Supabase RPC or raw SQL `order by embedding <=> query_embedding limit k`.
  - [x] 6.2 Map distance/similarity to a stable **score** in the JSON response for the UI.
  - [x] 6.3 Implement `server/lib/prompt.ts` to build system prompt (“answer from context only”) + user message + concatenated context; include **context preview string** for the explainability panel.
  - [x] 6.4 Call Ollama chat with assembled messages; return `{ answer, retrieved_chunks[], scores[], context_preview }`.
  - [x] 6.5 Handle edge cases: no rows in `chunks`, empty retrieval (message to user, no crash); Ollama/Supabase errors as structured HTTP errors with safe messages.

- [x] **7.0** Frontend: ingest UI + API wiring
  - [x] 7.1 Implement `IngestPanel`: paste + file upload; `fetch` to `/api/ingest`; show success/error toasts or inline alerts; loading state.
  - [x] 7.2 Add `src/lib/api.ts` with typed helpers and error parsing.

- [ ] **8.0** Frontend: chat UI + loading phases + errors
  - [ ] 8.1 Implement `useChat` (or equivalent) holding message list, pending assistant state, phase enum (`idle` | `retrieving` | `generating`).
  - [ ] 8.2 Implement `ChatPanel` with ElevenLabs `Conversation` / `Message` / `ConversationScrollButton` / `ConversationEmptyState`; render user + assistant messages; use **ShimmeringText** (or row with shimmer) for loading phases with distinct labels.
  - [ ] 8.3 On send: append user message, call `/api/chat`, append assistant message; on failure show non-blocking error without losing history.

- [ ] **9.0** Explainability panel + layout polish
  - [ ] 9.1 Implement `ExplainabilityPanel`: list last retrieval’s chunks (snippet, score, document title/filename); collapsible **context / prompt preview** from API.
  - [ ] 9.2 Integrate layout: main column chat, secondary column or bottom panel for sources (responsive: stack on small screens).
  - [ ] 9.3 Empty-corpus UX: explain user must ingest first (empty state copy).

- [ ] **10.0** Documentation, security notes, and smoke verification
  - [ ] 10.1 Update root `README.md`: prerequisites (Node, Ollama models pulled), Supabase migration order, env vars, run commands, **dev-only** warning for service role.
  - [ ] 10.2 Manual smoke: ingest PDF + paste text, ask a grounded question, confirm chunks/scores visible and answer references sources qualitatively.
