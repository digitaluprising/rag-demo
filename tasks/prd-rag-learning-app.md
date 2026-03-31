# Product Requirements Document: RAG Learning App

## 1. Introduction / Overview

This project is a **retrieval-augmented generation (RAG) web application** aimed at **learning how RAG works in practice**. Users ingest their own documents (text paste, markdown/text files, PDFs), which are chunked, embedded, and stored in **Supabase (Postgres + pgvector)**. A conversational UI answers questions **grounded in retrieved chunks**, with **explainability**: retrieved passages, similarity scores, and (where useful) a preview of how retrieved context is composed into the model prompt.

The chat experience uses **ElevenLabs UI** primitives—[`Conversation`](https://ui.elevenlabs.io/docs/components/conversation), [`Message`](https://ui.elevenlabs.io/docs/components/message), and [`ShimmeringText`](https://ui.elevenlabs.io/docs/components/shimmering-text)—for layout, scrolling, and loading states. **Voice/audio features are explicitly out of scope for v1.**

**Stack summary (per product decisions):** Vite + React + TypeScript frontend; Supabase for database/vectors only (no Supabase Auth in v1); local inference via **Ollama** for chat and embeddings (see Technical Considerations).

---

## 2. Goals

1. Demonstrate a **complete RAG loop**: ingest → chunk → embed → store → retrieve → augment prompt → generate answer.
2. Make RAG **inspectable** for learning: show **which chunks** were retrieved, **scores**, and enough **prompt context** to understand grounding (without leaking secrets in production—acceptable for local/dev learning).
3. Deliver a **usable MVP** on **Postgres + pgvector** in Supabase with a **single-user / dev** assumption (no multi-tenant auth in v1).
4. Support **PDF** and **text/markdown** ingestion in addition to pasted text.
5. Keep the UI **conversational and readable**, using ElevenLabs UI components for conversation structure and assistant “thinking” shimmer during retrieval/generation.

---

## 3. User Stories

1. **As a learner**, I want to **upload or paste documents** so that the system has a knowledge base to search.
2. **As a learner**, I want to **ask questions in natural language** and receive **answers that cite or map to specific source chunks** so I trust the retrieval step.
3. **As a learner**, I want to **see retrieved chunks and scores** (and optionally how they are assembled into context) so I understand **why** the model said what it said.
4. **As a learner**, I want **clear loading states** during embedding retrieval and generation so the app feels responsive and I know work is in progress.
5. **As a learner**, I want to run the stack **without cloud LLM API keys** (using local Ollama) so I can experiment cheaply and keep data local.

---

## 4. Functional Requirements

1. The system must allow **adding knowledge** via: (a) **paste text**, (b) upload **`.txt` / `.md`**, (c) upload **PDF**.
2. The system must **extract text** from PDFs reliably for MVP (plain text extraction; complex layouts may be best-effort).
3. The system must **chunk** ingested text with **documented defaults** (e.g. chunk size, overlap) configurable in one place for experimentation.
4. The system must **embed** chunks using a **local embedding model** exposed via **Ollama** (or compatible local API), and store vectors in **Supabase pgvector** with dimensions consistent with the chosen model.
5. The system must **store metadata** per chunk: source document id, chunk index, optional title/filename, created time, and raw text snippet for display.
6. The system must provide a **chat interface** where user messages and assistant replies appear in a **scrollable conversation** (ElevenLabs `Conversation` + `Message` patterns).
7. On each user question, the system must **retrieve top-k** similar chunks (configurable k), return **scores** (e.g. cosine distance or similarity), and **pass retrieved text** into the local chat model as context.
8. The UI must **display assistant answers** and **list the retrieved chunks** used (text + score + source label). A **collapsible or secondary panel** for “prompt / context preview” is acceptable if it aids learning.
9. While retrieval or generation is in progress, the UI must show a **non-blocking loading indicator** using **ShimmeringText** (or equivalent) with learner-friendly labels (e.g. “Retrieving sources…”, “Generating answer…”).
10. The system must **not** require login for v1; treat all data as **single-user / dev instance** (no RLS requirement for MVP if tables are dev-only; document security caveats).
11. The app must **fail gracefully**: empty corpus, no retrieval hits, Ollama down, or Supabase errors should show **clear error messages** without crashing the UI.

---

## 5. Non-Goals (Out of Scope)

1. **Voice input/output**, ElevenLabs Agents, TTS/STT, or realtime voice sessions.
2. **Supabase Auth**, multi-user accounts, orgs, or **row-level security** for production-grade isolation (may be revisited later).
3. **URL crawling / web scraping** as an ingestion source (not in MVP).
4. **Production hardening**: rate limiting, abuse prevention, encryption at rest beyond Supabase defaults, and compliance certifications.
5. **Advanced PDF** features (OCR for scanned PDFs, table extraction) unless explicitly added later.
6. **Automated evaluation** (RAGAS, golden datasets) — optional future work.

---

## 6. Design Considerations

1. **Conversation layout:** Use ElevenLabs [`Conversation`](https://ui.elevenlabs.io/docs/components/conversation), [`ConversationContent`](https://ui.elevenlabs.io/docs/components/conversation), [`ConversationScrollButton`](https://ui.elevenlabs.io/docs/components/conversation), and [`ConversationEmptyState`](https://ui.elevenlabs.io/docs/components/conversation) for the main message list and sticky-to-bottom behavior.
2. **Messages:** Use [`Message`](https://ui.elevenlabs.io/docs/components/message) / [`MessageContent`](https://ui.elevenlabs.io/docs/components/message) for user vs assistant styling; pair with a markdown or plain text renderer for assistant content as needed (`Response` from ElevenLabs UI may be used if compatible with the project’s markdown pipeline).
3. **Loading:** Use [`ShimmeringText`](https://ui.elevenlabs.io/docs/components/shimmering-text) for “thinking” / processing states during retrieval and generation.
4. **Explainability panel:** A dedicated area (sidebar or below the chat) listing **retrieved chunks**, **scores**, and **source filenames**; optional **“context preview”** sub-section for learners.
5. **Visual style:** Follow a simple, readable layout; no requirement for custom brand beyond consistency with shadcn/Tailwind patterns typically used alongside ElevenLabs UI components.

---

## 7. Technical Considerations

### 7.1 Frontend

- **Vite + React + TypeScript** as chosen.
- Install ElevenLabs UI components via `@elevenlabs/cli` (e.g. `pnpm dlx @elevenlabs/cli@latest components add conversation message shimmering-text`) and align with their **Motion** / **Tailwind** setup per [ElevenLabs UI docs](https://ui.elevenlabs.io/docs/components/conversation).

### 7.2 Supabase

- **Postgres + pgvector** extension enabled in the Supabase project.
- Tables (conceptual): `documents` (id, title/filename, source type, created_at, raw metadata), `chunks` (id, document_id, content, embedding, chunk_index, …).
- **No Auth in v1:** use **service role or anon key** only in dev; document that **public anon keys must not ship** with open DB policies—restrict to local/dev or lock down before any shared deployment.

### 7.3 Local LLM / embeddings (your question on “3c”)

**Option 3c was: local-only (e.g. Ollama)** for chat and embeddings.

- **What it is:** [Ollama](https://ollama.com/) runs open models on your machine. Your app calls a **local HTTP API** (no OpenAI/Anthropic API keys) for both **chat** and **embeddings**, depending on which models you pull.
- **Why it fits “learning RAG”:** No per-token cost, data stays on-device during inference, and you can iterate on chunking and retrieval without bill anxiety.
- **Tradeoffs:**
  - **Hardware:** Embeddings and chat both need RAM/CPU/GPU; large models are slower on CPU-only machines.
  - **Consistency:** You must pick an **embedding model** and keep **vector dimensions** fixed in pgvector (e.g. `nomic-embed-text`, `mxbai-embed-large`, etc.—exact choice is an implementation detail).
  - **Ops:** Users must **install and run Ollama** alongside the app; the PRD treats this as acceptable for a learning project.
- **PRD decision:** Treat **Ollama** as the **default** integration for both `generate` (chat) and `embeddings` in v1. Document fallback or future option (e.g. OpenAI-compatible API) only as an **open question**, not a v1 requirement.

### 7.4 PDF handling

- Use a maintained library (e.g. `pdf-parse` or similar in the **backend** or a small **Node** ingest step) so extraction runs in a controlled environment; avoid blocking the UI thread for large files.

### 7.5 Architecture note

- **Browser → your API:** Prefer a thin **backend** (Vite can pair with a small **Express/Hono** server, or **serverless functions**) to hold Supabase service credentials and call Ollama, **not** exposing service keys or Ollama to the public internet in production. For **local dev**, localhost-only Ollama is fine.

---

## 8. Success Metrics

1. A learner can **ingest** at least one PDF and one pasted text **and** ask a question whose answer **clearly uses** retrieved chunks (verified by **citations / chunk list**).
2. Retrieved chunks **match** the question better than random chunks (qualitative sanity check during development).
3. The **explainability** UI is used in every successful Q&A: **sources + scores** visible without digging into logs.

---

## 9. Open Questions

1. **Exact Ollama models:** Which chat model and which embedding model (and embedding dimension) to standardize in README and migrations?
2. **Backend shape:** Single small Node server alongside Vite vs. serverless API routes—preference for deployment target (local-only vs. future hosted demo)?
3. **Chunking defaults:** Initial chunk size / overlap—start with common defaults (e.g. 512–1000 chars, 10–20% overlap) and tune in implementation?
4. **Maximum file size / page count** for PDF uploads in MVP?

---

## Document control

| Item        | Value |
|------------|--------|
| **Status** | Draft — aligned with clarifying answers (2026-03-30) |
| **Next step** | Use `generate-tasks.md` to produce an implementation task list from this PRD |
