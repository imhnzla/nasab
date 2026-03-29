import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // No implicit any — matches tsconfig strict: true
      '@typescript-eslint/no-explicit-any': 'error',
      // Require explicit return types on exported functions
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      // Catch unused variables early
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Prevent accidental console.log left in
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]

export default config
