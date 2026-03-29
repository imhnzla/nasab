// ESLint 9 native flat config — no FlatCompat needed
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'exports/**'],
  },
  // Base rules for all TS/TSX
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Off for .tsx — Next.js page/component return types are inferred
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  // Enforce explicit return types on library/server code (.ts only)
  {
    files: ['lib/**/*.ts', 'server/**/*.ts', 'middleware.ts'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
]

export default config
