// tRPC context — injects Supabase server client + session into every procedure
import { createClient } from '@/lib/supabase/server'

export async function createContext() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return { supabase, session }
}

export type Context = Awaited<ReturnType<typeof createContext>>
