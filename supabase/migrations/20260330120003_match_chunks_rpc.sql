/*
 * migration: match_chunks_rpc
 * purpose: vector similarity search over public.chunks for RAG chat (cosine distance).
 * affected: public.match_chunks function; grants for api roles.
 */

create or replace function public.match_chunks (
  query_embedding vector(768),
  match_count integer default 5
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  chunk_index integer,
  distance double precision,
  document_title text,
  document_filename text
)
language sql
stable
set search_path = public
as $$
  select
    c.id as chunk_id,
    c.document_id,
    c.content,
    c.chunk_index,
    (c.embedding <=> query_embedding) as distance,
    d.title as document_title,
    d.filename as document_filename
  from public.chunks c
  left join public.documents d on d.id = c.document_id
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 100));
$$;

comment on function public.match_chunks(vector(768), integer) is 'Cosine-distance nearest chunks for RAG; match_count clamped 1..100.';

grant execute on function public.match_chunks(vector(768), integer) to anon;
grant execute on function public.match_chunks(vector(768), integer) to authenticated;
grant execute on function public.match_chunks(vector(768), integer) to service_role;
