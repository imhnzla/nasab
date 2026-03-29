// tRPC router — lineage submissions
// Phase 3 (create/read own) + Phase 4 (verifier actions)
// Zod v4: z.uuid() is now top-level
import { z } from 'zod'
import { t } from '../init'
import { authedProcedure, verifierProcedure } from '../middleware'

export const submissionsRouter = t.router({
  create: authedProcedure
    .input(
      z.object({
        full_name_ar: z.string().min(2).max(300),
        full_name_en: z.string().min(2).max(300),
        claimed_father_id: z.uuid().optional(),   // Zod v4: top-level z.uuid()
      })
    )
    .mutation(async () => {
      // TODO: Phase 3
      return null
    }),

  mySubmissions: authedProcedure.query(async () => {
    // TODO: Phase 3
    return []
  }),

  byId: authedProcedure
    .input(z.object({ id: z.uuid() }))           // Zod v4: top-level z.uuid()
    .query(async () => {
      // TODO: Phase 3
      return null
    }),

  updateStatus: verifierProcedure
    .input(
      z.object({
        id: z.uuid(),                             // Zod v4: top-level z.uuid()
        status: z.enum(['under_review', 'approved', 'rejected']),
        notes: z.string().optional(),
        rejection_reason: z.string().optional(),
      })
    )
    .mutation(async () => {
      // TODO: Phase 4
      return null
    }),
})
