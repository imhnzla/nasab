// tRPC router — persons CRUD
// Phase 1 (read) + Phase 4 (write)
// Zod v4: z.uuid() / z.url() are now top-level (z.string().uuid() deprecated)
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { t } from '../init'
import { adminProcedure } from '../middleware'
import type { Database } from '@/lib/supabase/types'

type PersonRow = Database['public']['Tables']['persons']['Row']

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
    .query(async ({ ctx, input }): Promise<{ persons: PersonRow[]; total: number }> => {
      const { page, perPage, branch, tradition } = input
      const from = (page - 1) * perPage
      const to = page * perPage - 1

      let query = ctx.supabase
        .from('persons')
        .select('*', { count: 'exact' })
        .eq('is_verified', true)
        .order('generation', { ascending: true })
        .order('name_ar', { ascending: true })
        .range(from, to)

      if (branch !== undefined) {
        query = query.eq('branch', branch)
      }
      if (tradition !== undefined) {
        query = query.eq('scholarly_tradition', tradition)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { persons: data ?? [], total: count ?? 0 }
    }),

  byId: t.procedure
    .input(z.object({ id: z.uuid() }))      // Zod v4: top-level z.uuid()
    .query(async ({ ctx, input }): Promise<PersonRow | null> => {
      const { data, error } = await ctx.supabase
        .from('persons')
        .select('*')
        .eq('id', input.id)
        .eq('is_verified', true)
        .maybeSingle()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
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
