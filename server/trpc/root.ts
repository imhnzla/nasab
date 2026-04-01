// tRPC app router — merges all sub-routers
import { t } from './init'
import { adminRouter } from './routers/admin'
import { marriagesRouter } from './routers/marriage'
import { personsRouter } from './routers/persons'
import { searchRouter } from './routers/search'
import { submissionsRouter } from './routers/submissions'
import { usersRouter } from './routers/users'
import { changeRequestsRouter } from './routers/changeRequests'
import { bookmarksRouter } from './routers/bookmarks'

export const appRouter = t.router({
  admin: adminRouter,
  marriages: marriagesRouter,
  persons: personsRouter,
  search: searchRouter,
  submissions: submissionsRouter,
  users: usersRouter,
  changeRequests: changeRequestsRouter,
  bookmarks: bookmarksRouter,
})

export type AppRouter = typeof appRouter