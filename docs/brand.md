# Brand & Identity

## Name

**NASAB** (نسب) — classical Arabic word for lineage, descent, genealogy.

Pronunciation: *NAH-sab*
Arabic: نسب (right-to-left)

## Domains (Priority Order)

1. nasab.org *(preferred)*
2. nasab.app
3. shajranasab.org

## Aesthetic

Refined Islamic manuscript style — draws on the visual language of classical Arabic manuscripts, geometric Islamic art, and calligraphic tradition. Modern and clean, not ornate.

## Colour Palette

| Name | Hex | Usage |
|------|-----|-------|
| Navy | `#0D1B2A` | Primary background, Husaynid branch |
| Gold | `#C9A84C` | Accents, CTAs, Hashemite branch, logo |
| Cream | `#F5ECD7` | Page background, light surfaces |
| Deep Green | `#1B5E20` | Hasanid branch, success states |
| White | `#FFFFFF` | Cards, overlays |

```css
/* Tailwind config additions */
colors: {
  nasab: {
    navy:  '#0D1B2A',
    gold:  '#C9A84C',
    cream: '#F5ECD7',
    green: '#1B5E20',
  }
}
```

## Typography

| Role | Font | Notes |
|------|------|-------|
| Arabic display (headings) | Amiri or Scheherazade New | Classical calligraphic, Google Fonts |
| Arabic body | Noto Naskh Arabic | Clean, highly legible at small sizes |
| English display | Cormorant Garamond | Scholarly, pairs with classical Arabic feel |
| English body | Inter | Modern, neutral, excellent readability |
| Monospace (code) | JetBrains Mono | Admin/developer-facing only |

All fonts loaded via `next/font` for performance.

## Logo

The word **نسب** rendered in a refined Naskh or Thuluth calligraphic style, with a subtle geometric frame or border motif drawn from Islamic geometric art. No pictorial elements.

English wordmark: **NASAB** in Cormorant Garamond Small Caps.

## Voice & Tone

- Scholarly and authoritative, never casual
- Inclusive: always acknowledges both Sunni and Shia traditions equally
- Arabic-first: Arabic is the primary language of the platform
- Respectful: Prophetic honorifics (صلى الله عليه وسلم / pbuh) used consistently

## UI Conventions

- Arabic interface is the reference design — build Arabic first, adapt for English
- Forms are right-aligned in Arabic mode, left-aligned in English
- All dates shown as Hijri primary, Gregorian secondary in Arabic mode; reversed in English mode
- Generation numbers use Arabic-Indic numerals (١٢٣) in Arabic mode
