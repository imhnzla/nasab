// tRPC app router — merges all sub-routers
import { t } from './init'
import { adminRouter } from './routers/admin'
import { marriagesRouter } from './routers/marriage'
import { personsRouter } from './routers/persons'
import { searchRouter } from './routers/search'
import { submissionsRouter } from './routers/submissions'
import { usersRouter } from './routers/users'

export const appRouter = t.router({
  admin: adminRouter,
  marriages: marriagesRouter,
  persons: personsRouter,
  search: searchRouter,
  submissions: submissionsRouter,
  users: usersRouter,
})

export type AppRouter = typeof appRouter
