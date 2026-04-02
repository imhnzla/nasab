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
        includeUnverified: z.boolean().default(false), // for admin only, but we'll handle via middleware later
      })
    )
    .query(async ({ ctx, input }): Promise<{ persons: PersonRow[]; total: number }> => {
      const { page, perPage, branch, tradition, includeUnverified } = input
      const from = (page - 1) * perPage
      const to = page * perPage - 1

      let query = ctx.supabase
        .from('persons')
        .select('*', { count: 'exact' })
        .order('generation', { ascending: true, nullsFirst: false })
        .order('name_ar', { ascending: true })
        .range(from, to)

      if (!includeUnverified) {
        query = query.eq('is_verified', true)
      }
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
    .input(z.object({ id: z.uuid() }))
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
        father_id: z.uuid().nullable().optional(),
        gender: z.enum(['male', 'female', 'unknown']).default('male'),
        photo_url: z.string().nullable().optional(),
        branch: z.enum(['hasanid', 'husaynid', 'hashemite']).nullable(),
        scholarly_tradition: z.enum(['sunni', 'shia', 'both']).nullable(),
        generation: z.number().int().min(1).max(100).nullable(),
        bio_ar: z.string().nullable().optional(),
        bio_en: z.string().nullable().optional(),
        sources: z
          .array(
            z.object({
              title: z.string(),
              author: z.string().optional(),
              url: z.url().optional(),
              type: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Admins can create, but mark as unverified until reviewed
      const { data, error } = await ctx.supabase
        .from('persons')
        .insert({
          ...input,
          is_verified: false,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
      return data
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.uuid(),
        name_ar: z.string().min(2).max(200).optional(),
        name_en: z.string().min(2).max(200).optional(),
        father_id: z.uuid().nullable().optional(),
        gender: z.enum(['male', 'female', 'unknown']).optional(),
        photo_url: z.string().nullable().optional(),
        branch: z.enum(['hasanid', 'husaynid', 'hashemite']).nullable().optional(),
        scholarly_tradition: z.enum(['sunni', 'shia', 'both']).nullable().optional(),
        generation: z.number().int().min(1).max(100).nullable().optional(),
        bio_ar: z.string().nullable().optional(),
        bio_en: z.string().nullable().optional(),
        is_verified: z.boolean().optional(), // allow verification
        sources: z
          .array(
            z.object({
              title: z.string(),
              author: z.string().optional(),
              url: z.url().optional(),
              type: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input
      const { data, error } = await ctx.supabase
        .from('persons')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
      return data
    }),

  // Merge duplicate persons (admin only)
  merge: adminProcedure
    .input(z.object({ keepId: z.uuid(), mergeId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { keepId, mergeId } = input
      // Re-point father_id references
      await ctx.supabase.from('persons').update({ father_id: keepId }).eq('father_id', mergeId)
      // Re-point mother_id references (if exists)
      await ctx.supabase.from('persons').update({ mother_id: keepId }).eq('mother_id', mergeId)
      // Re-point marriage references
      await ctx.supabase.from('marriages').update({ husband_id: keepId }).eq('husband_id', mergeId)
      await ctx.supabase.from('marriages').update({ wife_id: keepId }).eq('wife_id', mergeId)
      // Delete the merged person
      const { error } = await ctx.supabase.from('persons').delete().eq('id', mergeId)
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }
      return { success: true }
    }),

  // Bulk create from CSV
  bulkCreate: adminProcedure
    .input(
      z.object({
        rows: z.array(
          z.object({
            name_ar: z.string(),
            name_en: z.string(),
            father_name_ar: z.string().optional(),
            generation: z.string().optional(),
            birth_date_hijri: z.string().optional(),
            branch: z.string().optional(),
            gender: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { rows } = input
      const results: PersonRow[] = []
      for (const row of rows) {
        // Try to find father by name_ar
        let fatherId: string | null = null
        if (row.father_name_ar) {
          const { data: father } = await ctx.supabase
            .from('persons')
            .select('id')
            .eq('name_ar', row.father_name_ar)
            .maybeSingle()
          if (father) fatherId = father.id
        }
        const generation = row.generation ? parseInt(row.generation, 10) : null
        const branch = (row.branch as 'hasanid' | 'husaynid' | 'hashemite') || null
        const gender =
          row.gender === 'female' ? 'female' : row.gender === 'male' ? 'male' : 'unknown'

        const { data: created, error } = await ctx.supabase
          .from('persons')
          .insert({
            name_ar: row.name_ar,
            name_en: row.name_en,
            father_id: fatherId,
            generation,
            birth_date_hijri: row.birth_date_hijri,
            branch,
            gender,
            is_verified: false,
          })
          .select()
          .single()

        if (error) {
          // Log but continue
          console.error(`Failed to create ${row.name_ar}:`, error.message)
          continue
        }
        results.push(created)
      }
      return { count: results.length }
    }),
})
