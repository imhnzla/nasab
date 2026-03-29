// tRPC router — user profile management
// Phase 3
// Zod v4: z.uuid() is now top-level
import { z } from 'zod'
import { authedProcedure, adminProcedure } from '../middleware'
import { t } from '../init'

export const usersRouter = t.router({
  me: authedProcedure.query(async () => {
    // TODO: Phase 3
    return null
  }),

  updateProfile: authedProcedure
    .input(
      z.object({
        display_name: z.string().min(1).max(100).optional(),
        preferred_locale: z.enum(['ar', 'en']).optional(),
      })
    )
    .mutation(async () => {
      // TODO: Phase 3
      return null
    }),

  updateRole: adminProcedure
    .input(
      z.object({
        user_id: z.uuid(),                        // Zod v4: top-level z.uuid()
        role: z.enum(['user', 'verifier', 'admin']),
      })
    )
    .mutation(async () => {
      // TODO: Phase 4
      return null
    }),
})
