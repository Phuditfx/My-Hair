import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const FALLBACK_URL = 'https://ewyyaxexigubtwhgfhjn.supabase.co';
  const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eXlheGV4aWd1YnR3aGdmaGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjQxOTcsImV4cCI6MjA5NzEwMDE5N30.uG-fjN5PBDBzyhuyj_EuzNDG2l3XB5rOb0TBQAW56TM';

  let supabaseUrl = FALLBACK_URL;
  let anonKey = FALLBACK_KEY;

  return createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
