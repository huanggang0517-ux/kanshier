import { createClient } from '@supabase/supabase-js'

let _supabase = null

export function getSupabase() {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === 'your_supabase_url' || !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
    return null
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}
