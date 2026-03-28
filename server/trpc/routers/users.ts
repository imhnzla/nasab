// tRPC router — user profile management
// Phase 3
import { z } from 'zod'
import { authedProcedure, adminProcedure } from '../middleware'
import { t } from '../root'

export const usersRouter = t.router({
  me: authedProcedure.query(async ({ ctx }) => {
    // TODO: Phase 3
    return null
  }),

  updateProfile: authedProcedure
    .input(z.object({
      display_name: z.string().optional(),
      preferred_locale: z.enum(['ar', 'en']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Phase 3
      return null
    }),

  updateRole: adminProcedure
    .input(z.object({
      user_id: z.string().uuid(),
      role: z.enum(['user', 'verifier', 'admin']),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Phase 4
      return null
    }),
})
