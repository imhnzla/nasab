# self-update

Manually trigger a full review and update of all Claude configuration files based on what was learned or built in this session.

Usage: `/self-update`

## Instructions

Review the full session context and update any of the following that are stale:

### 1. CLAUDE.md
- Add new commands to the commands table
- Add new agents to the agents table
- Add new hooks to the hooks table
- Update the folder structure if new dirs were created
- Add new rules if new conventions were established
- Update build phase statuses if phases were completed

### 2. .claude/agents/*.md
For each agent, check:
- Are there new code patterns, schemas, or conventions to document?
- Were new dependencies or tools introduced for this domain?
- Did any schema or API change that affects the agent's reference data?
- Create a new agent file if a new specialised domain emerged

### 3. .claude/commands/*.md
- Did any task reveal a recurring operation that should become a slash command?
- Update existing command instructions if the workflow changed
- Create new command files for new patterns discovered

### 4. .claude/hooks/
- Did any task reveal a new automation opportunity?
- Update `session-review.sh` if new self-update checklist items are needed
- Create new hooks if new triggers make sense

### 5. docs/
- Update `docs/build-logs/phase-{n}.md` — add an entry for what was completed
- Update any doc with outdated information (schema, API, commands, etc.)
- Add a new doc if a major new area was introduced

### 6. messages/ar.json + messages/en.json
- Add any new translation keys introduced in this session to both files

After updating, print a concise summary of every file changed and why.
If nothing needed updating, say so briefly.
