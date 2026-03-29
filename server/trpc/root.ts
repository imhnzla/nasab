// tRPC app router — combines all routers
import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import { personsRouter } from './routers/persons'
import { submissionsRouter } from './routers/submissions'
import { usersRouter } from './routers/users'
import { adminRouter } from './routers/admin'
import { searchRouter } from './routers/search'

export const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  persons: personsRouter,
  submissions: submissionsRouter,
  users: usersRouter,
  admin: adminRouter,
  search: searchRouter,
})

export type AppRouter = typeof appRouter
