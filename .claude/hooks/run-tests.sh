#!/bin/bash
# Runs the test suite after edits to source files.
# Skips if no test runner is configured yet.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except:
    print('')
" 2>/dev/null)

[ -z "$FILE_PATH" ] && exit 0
[[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]] || exit 0

# Skip test files themselves (avoid infinite loops)
[[ "$FILE_PATH" =~ \.(test|spec)\. ]] && exit 0

cd /home/user/nasab
[ -f "package.json" ] || exit 0

# Only run if a test script is defined
TEST_SCRIPT=$(python3 -c "
import json
try:
    with open('package.json') as f:
        d = json.load(f)
    print(d.get('scripts', {}).get('test', ''))
except:
    print('')
" 2>/dev/null)

[ -z "$TEST_SCRIPT" ] && exit 0

# Run tests related to the changed file only (fast feedback)
BASENAME=$(basename "$FILE_PATH" | sed 's/\.\(ts\|tsx\|js\|jsx\)$//')
npm test -- --testPathPattern="$BASENAME" --watchAll=false --passWithNoTests 2>/dev/null || true

exit 0
