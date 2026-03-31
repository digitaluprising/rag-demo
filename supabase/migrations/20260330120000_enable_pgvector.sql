/*
 * migration: enable_pgvector
 * purpose: load the vector extension for embedding storage and similarity search.
 * affected: extension "vector" (global).
 * notes: required before any vector(...) columns; see docs/embedding-model.md for model/dim.
 */

-- enable pgvector (idempotent for local and ci replays)
create extension if not exists vector;
