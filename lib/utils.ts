// shadcn/ui utility — merge Tailwind classes safely
// tailwind-merge v3 supports Tailwind CSS v4
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
