/*
 * migration: create_chunks_table
 * purpose: store text chunks and 768-d embeddings for retrieval (see docs/embedding-model.md).
 * affected: public.chunks, rls policies for anon and authenticated.
 * notes:
 *   - embedding dimension must match ollama model and server env EMBEDDING_DIM (768 for nomic-embed-text).
 *   - hnsw index uses cosine distance; tune m / ef_construction if needed after load testing.
 *   - v1 dev/single-user: permissive policies. service_role bypasses rls for the api server.
 */

-- chunked text and vectors tied to a source document
create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  content text not null,
  chunk_index integer not null,
  embedding vector(768) not null,
  created_at timestamptz not null default now(),
  constraint chunks_chunk_index_nonnegative check (chunk_index >= 0),
  constraint chunks_document_chunk_unique unique (document_id, chunk_index)
);

comment on table public.chunks is 'text segments and embeddings for rag retrieval; scoped to public.documents via document_id.';

comment on column public.chunks.embedding is 'must match embedding model output length (768 for nomic-embed-text).';

-- filter and join by source document
create index chunks_document_id_idx on public.chunks (document_id);

-- approximate nearest neighbor search (cosine distance <->)
create index chunks_embedding_hnsw_idx on public.chunks using hnsw (embedding vector_cosine_ops);

alter table public.chunks enable row level security;

-- anon
create policy "chunks select for anon dev open access."
on public.chunks
for select
to anon
using ( true );

create policy "chunks insert for anon dev open access."
on public.chunks
for insert
to anon
with check ( true );

create policy "chunks update for anon dev open access."
on public.chunks
for update
to anon
using ( true )
with check ( true );

create policy "chunks delete for anon dev open access."
on public.chunks
for delete
to anon
using ( true );

-- authenticated
create policy "chunks select for authenticated dev open access."
on public.chunks
for select
to authenticated
using ( true );

create policy "chunks insert for authenticated dev open access."
on public.chunks
for insert
to authenticated
with check ( true );

create policy "chunks update for authenticated dev open access."
on public.chunks
for update
to authenticated
using ( true )
with check ( true );

create policy "chunks delete for authenticated dev open access."
on public.chunks
for delete
to authenticated
using ( true );
