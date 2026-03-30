// tRPC HTTP handler for Next.js App Router
// See server/trpc/root.ts for the app router definition

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { marriagesRouter } from '@/server/trpc/root'
import { createContext } from '@/server/trpc/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: marriagesRouter,
    createContext,
  })

export { handler as GET, handler as POST }
