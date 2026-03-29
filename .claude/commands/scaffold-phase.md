# scaffold-phase

Scaffold all files, folders, and database migrations for a NASAB build phase.

Usage: `/scaffold-phase <phase-number>`

## Instructions

The argument is the phase number: $ARGUMENTS

Look up the phase definition in `docs/build-plan.md`, then:

1. Create all directories and placeholder files listed for that phase
2. Write the Supabase migration SQL file(s) in `supabase/migrations/` if the phase involves database work
3. Create the tRPC router stub(s) in `server/trpc/routers/` if the phase involves API work
4. Create the page/component stubs in `app/[locale]/` and `components/` as needed
5. Update `docs/build-logs/phase-{n}.md` with a "Scaffolded" entry including timestamp and list of files created
6. Run `npm run build` to verify no TypeScript errors in the scaffolded stubs

After scaffolding, print a summary of every file created and the next step for this phase.

Do not implement logic in this step — stubs only (empty functions with correct signatures and types).
