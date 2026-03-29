// tRPC router — fuzzy search across persons
// Phase 1
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { t } from '../init'
import { prepareForSearch } from '@/lib/i18n/arabic'
import type { Database } from '@/lib/supabase/types'

type PersonRow = Database['public']['Tables']['persons']['Row']

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
    .query(async ({ ctx, input }): Promise<PersonRow[]> => {
      const normalised = prepareForSearch(input.q)

      // Request more rows than needed so the tradition post-filter has headroom
      const fetchLimit = input.tradition !== undefined ? input.limit * 3 : input.limit

      const { data, error } = await ctx.supabase.rpc('search_persons', {
        query: normalised,
        branch_filter: input.branch ?? null,
        result_limit: fetchLimit,
      })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      let results = (data as PersonRow[]) ?? []

      // Apply tradition filter post-query (not supported natively by the RPC)
      if (input.tradition !== undefined) {
        results = results
          .filter((p) => p.scholarly_tradition === input.tradition)
          .slice(0, input.limit)
      }

      return results
    }),
})
