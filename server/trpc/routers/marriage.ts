// tRPC router — marriages CRUD
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { t } from '@/server/trpc/init'
import { adminProcedure } from '@/server/trpc/middleware'
import type { Database } from '@/lib/supabase/types'

type MarriageRow = Database['public']['Tables']['marriages']['Row']

export const marriagesRouter = t.router({
  byPerson: t.procedure
    .input(z.object({ personId: z.uuid() }))
    .query(async ({ ctx, input }): Promise<MarriageRow[]> => {
      const { data, error } = await ctx.supabase
        .from('marriages')
        .select('*')
        .or(`husband_id.eq.${input.personId},wife_id.eq.${input.personId}`)
        .order('order_num', { ascending: true })
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ?? []
    }),

  listAll: t.procedure.query(async ({ ctx }): Promise<MarriageRow[]> => {
    const { data, error } = await ctx.supabase
      .from('marriages')
      .select('*')
      .order('husband_id')
      .order('order_num')
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data ?? []
  }),

  create: adminProcedure
    .input(
      z.object({
        husband_id: z.uuid(),
        wife_id: z.uuid(),
        date_hijri: z.string().optional(),
        date_gregorian: z.string().optional(),
        order_num: z.number().int().min(1).default(1),
        notes_ar: z.string().optional(),
        notes_en: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('marriages')
        .insert({
          husband_id: input.husband_id,
          wife_id: input.wife_id,
          order_num: input.order_num,
          is_verified: false,
          date_hijri: input.date_hijri ?? null,
          date_gregorian: input.date_gregorian ?? null,
          notes_ar: input.notes_ar ?? null,
          notes_en: input.notes_en ?? null,
        })
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),
})
