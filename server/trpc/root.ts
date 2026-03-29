// tRPC app router — combines all routers
// `t` lives in init.ts to avoid circular deps (routers import t, root imports routers)
import { t } from './init'
import { personsRouter } from './routers/persons'
import { submissionsRouter } from './routers/submissions'
import { usersRouter } from './routers/users'
import { adminRouter } from './routers/admin'
import { searchRouter } from './routers/search'

export const appRouter = t.router({
  persons: personsRouter,
  submissions: submissionsRouter,
  users: usersRouter,
  admin: adminRouter,
  search: searchRouter,
})

export type AppRouter = typeof appRouter
