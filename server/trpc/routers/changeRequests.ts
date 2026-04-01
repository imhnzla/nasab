import { z } from 'zod'
import { t } from '@/server/trpc/init'
import { adminProcedure, authedProcedure } from '@/server/trpc/middleware'
import { TRPCError } from '@trpc/server'

export const changeRequestsRouter = t.router({
  create: authedProcedure
    .input(z.object({
      person_id: z.string().uuid(),
      proposed_changes: z.record(z.string(), z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('change_requests')
        .insert({
          person_id: input.person_id,
          user_id: ctx.user.id,
          proposed_changes: input.proposed_changes as import('@/lib/supabase/types').Json,
        })
        .select().single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),

  list: adminProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('change_requests')
        .select('*, persons(name_en, name_ar), users(email)')
        .eq('status', 'pending')
        .order('created_at')
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ?? []
    }),

  review: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      action: z.enum(['approve', 'reject']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.action === 'approve') {
        // Fetch the request and apply proposed_changes to persons
        const { data: req } = await ctx.supabase
          .from('change_requests').select('*').eq('id', input.id).single()
        if (req) {
          await ctx.supabase.from('persons')
            .update(req.proposed_changes as Record<string, unknown>)
            .eq('id', req.person_id)
        }
      }
      const { error } = await ctx.supabase
        .from('change_requests')
        .update({
          status: input.action === 'approve' ? 'approved' : 'rejected',
          reviewer_id: ctx.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.id)
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { success: true }
    }),
})
