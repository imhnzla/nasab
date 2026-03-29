// tRPC middleware — auth guards and role checks
// See .claude/agents/api-trpc.md for usage patterns
import { TRPCError } from '@trpc/server'
import { t } from './init'

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, user: ctx.session.user } })
})

export const verifierProcedure = authedProcedure.use(async ({ ctx, next }) => {
  const { data: user } = await ctx.supabase
    .from('users')
    .select('role')
    .eq('id', ctx.user.id)
    .single<{ role: string }>()
  if (!user || !['verifier', 'admin', 'superadmin'].includes(user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
})

export const adminProcedure = authedProcedure.use(async ({ ctx, next }) => {
  const { data: user } = await ctx.supabase
    .from('users')
    .select('role')
    .eq('id', ctx.user.id)
    .single<{ role: string }>()
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
})
