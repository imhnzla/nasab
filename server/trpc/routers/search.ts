// tRPC router — fuzzy search across persons
// Phase 1
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { t } from '../init'
import { prepareForSearch } from '@/lib/i18n/arabic'
import type { SearchHit } from '@/lib/tree/types'
import type { Database } from '@/lib/supabase/types'

// Full DB row type used only for internal filtering — never leaves this module
// via tRPC, so its Json fields don't flow into tRPC's type machinery.
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
    // Return type is SearchHit[] — a lean type with no Json fields.
    // This is the critical fix: tRPC infers the procedure output type and runs it
    // through several layers of conditional types (inferProcedureOutput, DeepPartial,
    // TRPCRequestOptions). PersonRow contains sources: Json and titles: Json.
    // Json is a recursive type alias, eagerly expanded by TypeScript. When it enters
    // tRPC's conditional type chain, instantiation depth explodes → TS2589.
    // SearchHit has only flat primitives, keeping the inferred depth shallow.
    .query(async ({ ctx, input }): Promise<SearchHit[]> => {
      const normalised = prepareForSearch(input.q)

      // Request more rows than needed so the tradition post-filter has headroom
      const fetchLimit = input.tradition !== undefined ? input.limit * 3 : input.limit

      // Pre-type the args object as the exact Database function Args type.
      // This is required because supabase-js v2.100+'s rpc() overload evaluates
      // GetRpcFunctionFilterBuilderByArgs (a three-layer conditional type chain)
      // as a constraint for FilterBuilder during generic inference. TypeScript's
      // inference engine gives up on inferring Args when that constraint is too
      // complex to evaluate, causing Args to default to never → args?: undefined
      // (TS2345). Explicitly typing rpcArgs tells TypeScript the exact Args type
      // without any inference, so the constraint is satisfied trivially.
      type SearchPersonsArgs = Database['public']['Functions']['search_persons']['Args']
      const rpcArgs: SearchPersonsArgs = {
        query: normalised,
        branch_filter: input.branch ?? undefined,
        result_limit: fetchLimit,
      }
      const { data, error } = await ctx.supabase.rpc('search_persons', rpcArgs)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Cast via unknown: the RPC returns the full DB row shape but we only
      // need the SearchHit fields. PersonRow is used here solely to get the
      // tradition field for filtering — it never escapes this function.
      let rows = (data as unknown as PersonRow[]) ?? []

      // Apply tradition filter post-query (not supported natively by the RPC)
      if (input.tradition !== undefined) {
        rows = rows
          .filter((p) => p.scholarly_tradition === input.tradition)
          .slice(0, input.limit)
      }

      // Map to SearchHit — explicitly pick only the flat primitive fields.
      // This is what keeps Json out of the tRPC type chain.
      return rows.map(
        ({ id, name_ar, name_en, father_id, branch, scholarly_tradition, generation }): SearchHit => ({
          id,
          name_ar,
          name_en,
          father_id,
          branch: branch as SearchHit['branch'],
          scholarly_tradition: scholarly_tradition as SearchHit['scholarly_tradition'],
          generation,
        })
      )
    }),
})
