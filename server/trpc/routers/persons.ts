// tRPC router — persons CRUD
// Phase 1 (read) + Phase 4 (write)
// Zod v4: z.uuid() / z.url() are now top-level (z.string().uuid() deprecated)
import { z } from 'zod'
import { t } from '../init'
import { adminProcedure } from '../middleware'

export const personsRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(200).default(50),
        branch: z.enum(['hasanid', 'husaynid', 'hashemite']).optional(),
        tradition: z.enum(['sunni', 'shia', 'both']).optional(),
      })
    )
    .query(async () => {
      // TODO: Phase 1
      return { persons: [], total: 0 }
    }),

  byId: t.procedure
    .input(z.object({ id: z.uuid() }))      // Zod v4: top-level z.uuid()
    .query(async () => {
      // TODO: Phase 1
      return null
    }),

  create: adminProcedure
    .input(
      z.object({
        name_ar: z.string().min(2).max(200),
        name_en: z.string().min(2).max(200),
        father_id: z.uuid().optional(),       // Zod v4: top-level z.uuid()
        branch: z.enum(['hasanid', 'husaynid', 'hashemite']),
        scholarly_tradition: z.enum(['sunni', 'shia', 'both']),
        generation: z.number().int().min(1).max(100),
        sources: z
          .array(
            z.object({
              title: z.string(),
              author: z.string().optional(),
              url: z.url().optional(),        // Zod v4: top-level z.url()
              type: z.string().optional(),
            })
          )
          .min(1),
      })
    )
    .mutation(async () => {
      // TODO: Phase 4
      return null
    }),
})
