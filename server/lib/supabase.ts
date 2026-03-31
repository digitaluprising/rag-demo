import { createClient } from '@supabase/supabase-js'
import { env } from '../env.ts'

/** Server-only Supabase client with service role (bypasses RLS). Never import from frontend code. */
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export async function checkSupabaseHealth(): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from('documents').select('id').limit(1)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
