// tRPC router — lineage submissions
// Phase 3 (create/read own) + Phase 4 (verifier actions)
import { z } from 'zod'
import { t } from '../root'
import { authedProcedure, verifierProcedure } from '../middleware'

export const submissionsRouter = t.router({
  create: authedProcedure
    .input(z.object({
      full_name_ar: z.string().min(2),
      full_name_en: z.string().min(2),
      claimed_father_id: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Phase 3
      return null
    }),

  mySubmissions: authedProcedure.query(async ({ ctx }) => {
    // TODO: Phase 3
    return []
  }),

  updateStatus: verifierProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['under_review', 'approved', 'rejected']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Phase 4
      return null
    }),
})
