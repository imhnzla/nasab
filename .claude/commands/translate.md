# translate

Add or update translation keys in the Arabic and English message files.

Usage: `/translate <key-path> <arabic-value> <english-value>`

Or interactively: `/translate` to add multiple keys.

## Instructions

Arguments: $ARGUMENTS

1. Open `messages/ar.json` and `messages/en.json`.

2. **Add or update the key** in both files simultaneously. Keys are dot-separated:
   ```
   nav.tree → { "nav": { "tree": "..." } }
   ```

3. For **ICU message format** (plurals, variables):
   ```json
   { "person.generation": { "ar": "الجيل {number}", "en": "Generation {number}" } }
   ```

4. **Check for missing keys**: scan all `.tsx` and `.ts` files for `t('...')` calls and verify every key exists in both locale files.

5. **Validate Arabic text:**
   - Must be right-to-left readable
   - Use Arabic-Indic numerals (٠١٢٣) for ordinal numbers in Arabic strings
   - Names of prophets and companions should include appropriate honorifics in Arabic

6. Print a diff of both files after changes.

7. If running in the context of a component, also check that `useTranslations()` is importing the correct namespace.
