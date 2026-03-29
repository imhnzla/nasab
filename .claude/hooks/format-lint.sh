#!/bin/bash
# Runs Prettier + ESLint after every file edit.
# Receives JSON on stdin: { "tool_name": "Edit", "tool_input": { "file_path": "..." }, ... }

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

# Only process supported file types
[[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx|css|json|md)$ ]] || exit 0

cd /home/user/nasab

# Prettier
if [ -f "node_modules/.bin/prettier" ]; then
  npx prettier --write "$FILE_PATH" --log-level silent 2>/dev/null || true
fi

# ESLint (TS/JS only)
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]] && [ -f "node_modules/.bin/eslint" ]; then
  npx eslint --fix "$FILE_PATH" --quiet 2>/dev/null || true
fi

exit 0
