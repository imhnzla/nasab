// Hijri ↔ Gregorian conversion and dual-date formatting
// Arabic-Indic numerals used for Hijri display in Arabic locale

/** Format a dual-date string showing both Hijri and Gregorian */
export function formatDualDate(hijri: string | null, gregorian: Date | null, locale: 'ar' | 'en'): string {
  // TODO: Phase 0 — implement using Intl.DateTimeFormat with calendar: 'islamic'
  return hijri ?? ''
}

/** Convert Gregorian Date to Hijri string */
export function toHijri(date: Date, locale: 'ar' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA-u-ca-islamic' : 'en-SA-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** Arabic-Indic numeral conversion */
export function toArabicIndic(n: number): string {
  return n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}
