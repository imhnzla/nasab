// Design tokens for the NASAB Premium 2D tree
// Theme: "Illuminated Manuscript" — warm parchment cards on near-black vellum

// ─── Colour palette ───────────────────────────────────────────────────────────
export const COLOUR = {
  void:         '#0D0B08',  // warm near-black background
  parchment:    '#F5ECD7',  // node card fill
  goldPrimary:  '#C9943A',  // Hasanid borders, parent-child edges
  goldLight:    '#E8C46A',  // hover states, highlights, focus ring
  goldDim:      '#7A5A1E',  // muted gold for distant nodes
  emerald:      '#1A5C3A',  // Husaynid borders, daughter accent
  emeraldLight: '#2D8A57',  // emerald hover
  lapis:        '#1B3A6B',  // wife node fill, marriage arcs
  lapisLight:   '#2E5FA3',  // wife hover
  amber:        '#8B4513',  // Hashemite / other branch borders
  dust:         '#8B7355',  // secondary text, generation badge, edge label
  ink:          '#1A0F00',  // primary text on parchment
  inkLight:     '#3D2B00',  // secondary text on parchment
  tradGreen:    '#15803D',  // Sunni tradition strip
  tradNavy:     '#1E3A5F',  // Shia tradition strip
} as const

// ─── Branch border colours ────────────────────────────────────────────────────
export const BRANCH_BORDER: Record<string, string> = {
  hasanid:   COLOUR.goldPrimary,
  husaynid:  COLOUR.emerald,
  hashemite: COLOUR.amber,
}

// ─── Layout geometry ─────────────────────────────────────────────────────────
// Vertical: each generation occupies one lane.  Wife cards sit in the middle
// of the lane between the father row and the children row.
export const LANE_HEIGHT      = 240   // px between generation Y coordinates
export const WIFE_ROW_OFFSET  = 110   // px below father top-left to start wife row
                                      // (96px card height + 14px gap = 110)
export const H_GAP            = 24    // horizontal gap between sibling subtrees
export const WIFE_H_GAP       = 12    // horizontal gap between wife cards
export const GROUP_GAP        = 44    // extra gap between sibling groups from different mothers
export const ROOT_GAP         = 200   // horizontal gap between separate root subtrees

// ─── Node sizes ───────────────────────────────────────────────────────────────
export const NODE_W           = 160   // person card width (px)
export const NODE_H           = 96    // person card height (px)
export const WIFE_W           = 120   // wife card width (px)
export const WIFE_H           = 70    // wife card height (px)
export const ROOT_SCALE       = 1.5   // Prophet node scale multiplier

// ─── LOD zoom breakpoints ─────────────────────────────────────────────────────
// React Flow zoom value thresholds for level-of-detail rendering
export const ZOOM_DOT         = 0.35  // below: render as a coloured dot
export const ZOOM_COMPACT     = 0.65  // below: compact card (Arabic name only)
export const ZOOM_FULL        = 1.5   // above: inspect mode (show dates)

// ─── Edge colours ─────────────────────────────────────────────────────────────
export const EDGE_PARENT      = COLOUR.goldPrimary   // parent → child
export const EDGE_WIFE        = COLOUR.lapis          // father → wife connector
export const EDGE_WIFE_CHILD  = '#6A82A3'             // wife → child (lapis-tinted gold)
export const EDGE_ORIGIN      = COLOUR.emerald        // origin arc (cross-branch daughter)
export const EDGE_MARRIAGE    = COLOUR.lapis          // marriage arc (in-tree spouse)
