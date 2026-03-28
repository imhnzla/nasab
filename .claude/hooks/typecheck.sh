#!/bin/bash
# Runs tsc --noEmit after edits to TypeScript files.
# Only fires when tsconfig.json exists (i.e. project is scaffolded).

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
[[ "$FILE_PATH" =~ \.(ts|tsx)$ ]] || exit 0

cd /home/user/nasab
[ -f "tsconfig.json" ] || exit 0
[ -f "node_modules/.bin/tsc" ] || exit 0

npx tsc --noEmit --pretty 2>&1 | tail -20
exit 0
