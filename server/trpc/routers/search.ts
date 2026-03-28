// tRPC router — fuzzy search across persons
// Phase 1
import { z } from 'zod'
import { t } from '../root'

export const searchRouter = t.router({
  fuzzy: t.procedure
    .input(z.object({
      q: z.string().min(1),
      branch: z.enum(['hasanid', 'husaynid', 'hashemite']).optional(),
      tradition: z.enum(['sunni', 'shia', 'both']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: Phase 1 — use pg_trgm index on name_ar, name_en
      // Strip Arabic diacritics from input.q before querying
      return []
    }),
})
