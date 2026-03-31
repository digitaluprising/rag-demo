/*
 * migration: create_documents_table
 * purpose: store one row per ingested source (paste, text file, markdown, pdf metadata).
 * affected: public.documents, rls policies for anon and authenticated.
 * notes:
 *   - primary key is uuid to match api/client usage; service_role bypasses rls for the backend.
 *   - v1 assumes a dev/single-user instance; policies are permissive. tighten before production.
 */

-- source documents users add before chunking and embedding
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text,
  filename text,
  source_type text not null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint documents_source_type_check check (
    source_type in ('paste', 'txt', 'markdown', 'pdf')
  )
);

comment on table public.documents is 'user-ingested documents; chunk rows (see later migration) reference public.documents.id.';

create index documents_created_at_idx on public.documents (created_at desc);

alter table public.documents enable row level security;

-- anon: separate policy per command (supabase best practice)
create policy "documents select for anon dev open access."
on public.documents
for select
to anon
using ( true );

create policy "documents insert for anon dev open access."
on public.documents
for insert
to anon
with check ( true );

create policy "documents update for anon dev open access."
on public.documents
for update
to anon
using ( true )
with check ( true );

create policy "documents delete for anon dev open access."
on public.documents
for delete
to anon
using ( true );

-- authenticated: mirror anon so both roles behave the same in dev
create policy "documents select for authenticated dev open access."
on public.documents
for select
to authenticated
using ( true );

create policy "documents insert for authenticated dev open access."
on public.documents
for insert
to authenticated
with check ( true );

create policy "documents update for authenticated dev open access."
on public.documents
for update
to authenticated
using ( true )
with check ( true );

create policy "documents delete for authenticated dev open access."
on public.documents
for delete
to authenticated
using ( true );
