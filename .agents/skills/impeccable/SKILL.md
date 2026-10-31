---
name: impeccable
description: Design vocabulary, design laws, and anti-pattern prevention system for AI coding agents. Provides 24 commands to steer, review, finish, iterate, and plan frontend interfaces.
---

# Impeccable Design Skill

Impeccable is a design vocabulary and quality-control layer for frontend user interfaces. It prevents generic AI design defaults ("AI slop") and enforces production-grade aesthetic and technical craftsmanship.

## The Core Design Laws

1. **No AI Clichés**: Ban generic purple-to-blue gradients, neon glow shadows, unmotivated frosted glass cards (`backdrop-blur` stacks), and beige/cream unprompted canvas defaults.
2. **Typography First**: Respect line heights (especially for non-Latin scripts like Kannada: min 1.6 line height), clear size hierarchy, and consistent font pairings.
3. **Intentional Color & Tokens**: Every color must map to a semantic token defined in `DESIGN.md`. Never use magic hex codes or leftover brand artifacts.
4. **Contrast & Accessibility**: All text must meet WCAG AA contrast (4.5:1 minimum for body text, 3:1 for large headings).
5. **Form Follows Function**: Every element, border, and badge must serve an informational or interaction purpose. No empty decorative clutter.

---

## Command Router

When invoked with `/impeccable <command>` or when guided by the user, route to the appropriate operation:

| Category | Command | Purpose |
| :--- | :--- | :--- |
| **Steer** | `bolder` | Amplifies timid or bland designs with stronger hierarchy and decisive accents |
| | `quieter` | Tones down loud, overly busy, or visually noisy interfaces |
| | `distill` | Strips redundant containers, extraneous borders, and decorative clutter |
| | `colorize` | Injects purposeful color palette and semantic tokens into dull gray UI |
| | `typeset` | Corrects typography scale, line-height, kerning, and script-specific rhythm |
| | `layout` | Optimizes spatial grouping, flex/grid alignment, and responsive flow |
| | `animate` | Adds purposeful transitions, hover dynamics, and micro-interactions |
| | `delight` | Adds brand personality and tactile visual feedback |
| | `overdrive` | High-impact interactive animations, spring dynamics, and hero effects |
| **Review** | `critique` | Scored UX heuristic review evaluating clarity, visual balance, and flow |
| | `audit` | Deterministic technical audit of accessibility, responsive tokens, and code |
| **Finish** | `polish` | Final quality pass aligning micro-spacings, borders, and sub-pixel details |
| | `harden` | Covers edge cases, loading states, empty states, error boundaries, and i18n |
| | `clarify` | Rewrites unclear or verbose UI copy, error strings, and button labels |
| | `adapt` | Optimizes layouts across mobile, tablet, and desktop breakpoints |
| | `optimize` | Streamlines DOM footprint, asset weights, and rendering efficiency |
| | `onboard` | Designs initial zero-states and guided first-run flows |
| **Iterate** | `live` | Selects a specific UI surface and steps through targeted design variants |
| | `generate` | Synthesizes multiple layout and styling variations of a named component |
| **Plan** | `shape` | Plans UX structure, user flows, and wireframe outlines prior to coding |
| | `init` | Inspects product requirements and writes `PRODUCT.md` |
| | `document` | Analyzes existing UI patterns and formalizes `DESIGN.md` |
| | `extract` | Refactors repeated styling patterns into reusable components and tokens |

