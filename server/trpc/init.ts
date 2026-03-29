// tRPC instance — import `t` from here, not from root.ts
// Keeping this separate from root.ts breaks the circular dependency
// that occurs when routers import t and root imports routers.
import { initTRPC } from '@trpc/server'
import type { Context } from './context'

export const t = initTRPC.context<Context>().create()
