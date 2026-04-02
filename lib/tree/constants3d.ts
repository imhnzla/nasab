// 3D view constants — NASAB design spec v1.0
// "Illuminated Manuscript meets Celestial Observatory"

// ─── Colour palette ───────────────────────────────────────────────────────────
export const COLOUR = {
  void: '#050508', // background — near-black with blue undertone
  parchment: '#F5ECD7', // node fill, panel background
  goldPrimary: '#C9943A', // Prophet's node, primary connections
  goldLight: '#E8C46A', // hover states, active connections
  goldDim: '#7A5A1E', // inactive / distant connections
  lapis: '#1B3A6B', // wife node fill
  lapisLight: '#2E5FA3', // wife node hover
  emerald: '#1A5C3A', // daughter border, verified badge
  dust: '#8B7355', // secondary text, marriage lines
  ink: '#1A0F00', // primary text on parchment
  inkLight: '#3D2B00', // secondary text on parchment
} as const

// ─── Shell layout ─────────────────────────────────────────────────────────────
export const SHELL_GAP = 240 // vertical distance between generation shells (Y axis)
export const SHELL_BASE_RADIUS = 180 // base radius for gen 1; grows per gen
export const NODE_COLLISION_R = 90 // force-collision radius per node
export const FORCE_TICKS = 300 // sync simulation ticks for deterministic layout

// ─── Node sizes ───────────────────────────────────────────────────────────────
export const NODE_W = 150 // standard node width (px in HTML label)
export const NODE_H = 90 // standard node height — taller cards, less pill-like
export const ROOT_SIZE = 1.8 // Prophet node is 1.8× standard (was 3× — too large)
export const WIFE_SCALE = 0.9 // wife nodes at 90% of standard

// ─── Depth cueing ─────────────────────────────────────────────────────────────
export const DEPTH_OPACITY = [1, 0.8, 0.5, 0.2] // [focus, 1-out, 2-out, distant]

// ─── Camera ───────────────────────────────────────────────────────────────────
export const CAM_START_Z = 3200 // cinematic entrance start distance
export const CAM_END_Z = 750 // settle position Z — closer for readable nodes
export const CAM_Y_OFFSET = -SHELL_GAP * 1.5
export const CAM_INTRO_DUR = 3.2 // seconds for cinematic entrance
export const CAM_FOCUS_DUR = 1.1 // seconds to fly to a node

// ─── Connections ─────────────────────────────────────────────────────────────
export const LINE_WIDTH_PARENT = 1.5
export const LINE_WIDTH_MARRIAGE = 1.0
export const MARRIAGE_ARC_RISE = 100 // how far marriage arcs rise above shell

// ─── Minimap ─────────────────────────────────────────────────────────────────
export const MINIMAP_W = 160
export const MINIMAP_H = 120
export const MINIMAP_PAD = 16
