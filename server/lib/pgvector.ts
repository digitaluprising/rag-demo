/** Serialize a float array as a Postgres `vector` literal for Supabase/PostgREST. */
export function vectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`
}
