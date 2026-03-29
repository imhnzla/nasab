// next-intl v4 — typed navigation helpers
// Import Link, redirect, usePathname, useRouter from here (not next/navigation)
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
