// Browser-side tRPC client
import { createTRPCReact } from '@trpc/react-query'
import type { marriagesRouter } from '@/server/trpc/root'

export const trpc = createTRPCReact<marriagesRouter>()
