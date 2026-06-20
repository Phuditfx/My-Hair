import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  supabaseUrl = supabaseUrl.trim();
  if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://' + supabaseUrl;
  }

  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  anonKey = anonKey.trim();

  return createBrowserClient(supabaseUrl, anonKey)
}
