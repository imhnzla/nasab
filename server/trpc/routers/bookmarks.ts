import { z } from 'zod'
import { authedProcedure } from '@/server/trpc/middleware'
import { t } from '@/server/trpc/init'
import { TRPCError } from '@trpc/server'

export const bookmarksRouter = t.router({
  list: authedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('bookmarks')
      .select('*, persons(id, name_ar, name_en, branch, generation)')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false })
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data ?? []
  }),

  toggle: authedProcedure
    .input(z.object({ person_id: z.string().uuid(), label: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('person_id', input.person_id)
        .maybeSingle()

      if (existing) {
        await ctx.supabase.from('bookmarks').delete().eq('id', existing.id)
        return { bookmarked: false }
      } else {
        await ctx.supabase.from('bookmarks').insert({
          user_id: ctx.user.id,
          person_id: input.person_id,
          label: input.label ?? null,
        })
        return { bookmarked: true }
      }
    }),
})
