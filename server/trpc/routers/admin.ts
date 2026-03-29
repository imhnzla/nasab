// tRPC router — admin-only operations
// Phase 4
import { z } from 'zod'
import { adminProcedure } from '../middleware'
import { t } from '../root'

export const adminRouter = t.router({
  allSubmissions: adminProcedure
    .input(
      z.object({
        status: z
          .enum(['pending', 'under_review', 'approved', 'rejected'])
          .optional(),
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async () => {
      // TODO: Phase 4
      return { submissions: [], total: 0 }
    }),

  auditLog: adminProcedure
    .input(
      z.object({
        table: z.string().optional(),
        action: z.enum(['INSERT', 'UPDATE', 'DELETE']).optional(),
        page: z.number().int().min(1).default(1),
      })
    )
    .query(async () => {
      // TODO: Phase 4
      return { entries: [], total: 0 }
    }),

  ocrJobs: adminProcedure.query(async () => {
    // TODO: Phase 2
    return []
  }),
})
