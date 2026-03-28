// tRPC router — persons CRUD
// Phase 1 (read) + Phase 4 (write)
// See .claude/agents/api-trpc.md and docs/schema.md
import { z } from 'zod'
import { t } from '../root'
import { adminProcedure } from '../middleware'

export const personsRouter = t.router({
  list: t.procedure
    .input(z.object({ page: z.number().default(1), perPage: z.number().max(200).default(50) }))
    .query(async ({ ctx, input }) => {
      // TODO: Phase 1
      return { persons: [], total: 0 }
    }),

  byId: t.procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // TODO: Phase 1
      return null
    }),

  create: adminProcedure
    .input(z.object({
      name_ar: z.string().min(2),
      name_en: z.string().min(2),
      father_id: z.string().uuid().optional(),
      branch: z.enum(['hasanid', 'husaynid', 'hashemite']),
      scholarly_tradition: z.enum(['sunni', 'shia', 'both']),
      generation: z.number().int().min(1),
      sources: z.array(z.object({ title: z.string() })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Phase 4
      return null
    }),
})
