import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ewyyaxexigubtwhgfhjn.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eXlheGV4aWd1YnR3aGdmaGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjQxOTcsImV4cCI6MjA5NzEwMDE5N30.uG-fjN5PBDBzyhuyj_EuzNDG2l3XB5rOb0TBQAW56TM"
  )
}
