// tRPC context — injects Supabase server client + session into every procedure
import { createClient } from '@/lib/supabase/server'

// Private helper so Context type can be derived without a circular reference
async function _createContext() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return { supabase, session }
}

export type Context = Awaited<ReturnType<typeof _createContext>>

export async function createContext(): Promise<Context> {
  return _createContext()
}
