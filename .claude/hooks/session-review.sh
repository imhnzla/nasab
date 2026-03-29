#!/bin/bash
# Fires on every Stop event. Outputs a reminder to Claude's context so it
# reviews and self-updates its configuration docs before ending the session.
#
# Claude reads this stdout as a post-task instruction.

cat <<'REMINDER'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELF-UPDATE CHECK (automatic — runs after every task)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Review what was done in this task and silently update any of the
following that are now stale or incomplete:

1. CLAUDE.md
   - New commands, agents, hooks, or rules discovered?
   - Architecture decisions that changed?
   - Folder structure that was added/renamed?

2. .claude/agents/*.md
   - New patterns, schemas, or code conventions learned for this domain?
   - New tools or dependencies introduced?

3. .claude/commands/*.md
   - New slash commands needed for recurring tasks?
   - Existing commands that need updated instructions?

4. .claude/hooks/
   - New automation opportunity discovered?
   - Existing hook that needs adjustment?

5. docs/*.md and docs/build-logs/phase-N.md
   - Update the relevant build log with what was completed.
   - Update any doc that now has outdated information.

If nothing changed, do nothing. If something changed, edit the file(s)
and include the update in the auto-commit that follows.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REMINDER

exit 0
