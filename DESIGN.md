# DESIGN.md — Karnataka Modern Heritage Theme

> Design system, semantic tokens, and anti-pattern rules for the Kannada AI Interview & Hiring Platform.
> Built following the Impeccable frontend design standard.

---

## 1. Aesthetic Identity & Theme Core

### Philosophy: Karnataka Modern Heritage
A balanced blend of regional identity and razor-sharp modern SaaS execution. It rejects generic "AI tool" aesthetic tropes in favor of an authoritative, dignified, and culturally grounded presence.

- **Primary Anchor**: **Mysore Royal Indigo** (`#1B2A4A`) — Authority, stability, institutional credibility.
- **Accent Anchor**: **Silk Amber / Warm Gold** (`#D97706` / `#B45309`) — Warmth, accomplishment, vitality, regional pride.
- **Ground / Canvas**: Crisp Warm Bone (`#FBFBFA`) in light mode; Deep Indigo Charcoal (`#0F172A`) in dark mode.
- **Functional Accents**:
  - Success / Pass: **Forest Emerald** (`#059669`)
  - Warning / In Progress: **Amber Ochre** (`#D97706`)
  - Danger / Fail: **Crimson Red** (`#DC2626`)

---

## 2. Color Palette & Semantic Tokens

### Core Semantic Variables
| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `--background` | `#FBFBFA` | `#0B111E` | Primary page canvas |
| `--surface` | `#FFFFFF` | `#131C2E` | Card, container, and dialog backgrounds |
| `--surface-raised` | `#F3F4F6` | `#1A253C` | Hover states, secondary panels, inputs |
| `--foreground` | `#111827` | `#F1F5F9` | Primary typography |
| `--foreground-muted`| `#4B5563` | `#94A3B8` | Subtitles, labels, captions |
| `--border` | `#E2E8F0` | `#22314E` | Structural dividing lines and borders |
| `--primary` | `#1B2A4A` | `#3B82F6` | Primary action buttons, brand accents |
| `--primary-hover` | `#131F37` | `#2563EB` | Interactive state for primary actions |
| `--accent` | `#D97706` | `#F59E0B` | Badges, highlights, active indicators |
| `--accent-subtle` | `#FEF3C7` | `#2D2110` | Light accent background chips |

---

## 3. Typography & Kannada Script Rules

1. **Font Stack**:
   - Primary Sans: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
   - Kannada Serif/Sans Fallbacks: `"Noto Sans Kannada", "Tunga", "Kootenay", "Vijaya", sans-serif`
2. **Line Height Floors for Kannada**:
   - Minimum `line-height: 1.6` for all Kannada body text.
   - Headings in Kannada require minimum `leading-snug` (1.35) to avoid clipping upper/lower *vattulu* and *matras*.
3. **Hierarchy**:
   - `Display / H1`: Bold, tight tracking (`tracking-tight`), crisp contrast.
   - `H2 / Section`: Semibold, legible, clear vertical spacing.
   - `Body`: Regular, high-contrast foreground, never muted below `#4B5563`.

---

## 4. Forbidden Anti-Patterns (The "AI Slop" Detector Rules)

❌ **NEVER**:
1. Use purple-to-blue or neon-cyan mesh gradients as hero backgrounds.
2. Nest frosted glass (`backdrop-blur` with 10% white borders) on top of rainbow gradients.
3. Apply arbitrary neon glow box shadows (`box-shadow: 0 0 15px rgba(..., 0.8)`).
4. Rely on leftover corporate tokens (e.g. Amazon green `#007185` or orange `#FF9900`).
5. Use gray text (`#94A3B8`) on medium or low-contrast colored backgrounds.
6. Nest cards inside cards without distinct visual elevation or border hierarchy.
7. Use decorative iconography without semantic purpose.

✅ **ALWAYS**:
1. Ground actions with solid, high-contrast buttons (`bg-primary text-white` or `bg-accent text-white`).
2. Maintain clean 1px structural borders (`border-border`) with subtle, predictable elevation (`shadow-sm`, `shadow-md`).
3. Ensure all text passes WCAG AA contrast (4.5:1 for body, 3:1 for large text).
4. Give bilingual headings equal visual dignity and breathing room.

