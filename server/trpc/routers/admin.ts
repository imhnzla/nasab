// tRPC router — admin-only operations
// Phase 4
import { z } from 'zod'
import { adminProcedure } from '../middleware'
import { t } from '../root'

export const adminRouter = t.router({
  allSubmissions: adminProcedure
    .input(z.object({ status: z.string().optional(), page: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      // TODO: Phase 4
      return { submissions: [], total: 0 }
    }),

  auditLog: adminProcedure
    .input(z.object({ table: z.string().optional(), page: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      // TODO: Phase 4
      return { entries: [], total: 0 }
    }),

  ocrJobs: adminProcedure.query(async ({ ctx }) => {
    // TODO: Phase 2
    return []
  }),
})
