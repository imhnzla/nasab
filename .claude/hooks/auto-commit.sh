#!/bin/bash
# Auto-commits all changes when Claude finishes a task (Stop event).
# Only commits if there are actual changes. Uses a timestamped message.

cd /home/user/nasab

# Nothing to commit
git diff --quiet && git diff --cached --quiet && exit 0

# Stage all tracked + untracked non-ignored files
git add -A

# Build commit message from changed files
CHANGED=$(git diff --cached --name-only | head -10 | tr '\n' ', ' | sed 's/,$//')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

git commit -m "auto: [$TIMESTAMP] $CHANGED" 2>/dev/null || true

exit 0
