// tRPC router — fuzzy search across persons
// Phase 1
import { z } from 'zod'
import { t } from '../init'

export const searchRouter = t.router({
  fuzzy: t.procedure
    .input(
      z.object({
        q: z.string().min(1).max(200),
        branch: z.enum(['hasanid', 'husaynid', 'hashemite']).optional(),
        tradition: z.enum(['sunni', 'shia', 'both']).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      // TODO: Phase 1 — use pg_trgm index on name_ar and name_en
      // Use stripDiacritics(input.q) from lib/i18n/arabic.ts before querying
      void input
      return []
    }),
})
