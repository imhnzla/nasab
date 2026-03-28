// Arabic text utilities for search and display

/** Normalise Alef variants (أ إ آ ا → ا) and remove tatweel (ـ) */
export function normaliseArabic(text: string): string {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '')
}

/** Strip Arabic diacritics (harakat) for fuzzy search */
export function stripDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '')
}

/** Prepare Arabic text for search: normalise + strip diacritics */
export function prepareForSearch(text: string): string {
  return stripDiacritics(normaliseArabic(text)).trim()
}

/** Basic IJMES transliteration — extend as needed */
export function transliterate(text: string): string {
  // TODO: implement full IJMES Arabic → Latin transliteration table
  return text
}
