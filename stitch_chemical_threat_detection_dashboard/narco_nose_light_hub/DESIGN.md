---
name: Narco Nose Light Hub
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006194'
  on-tertiary: '#ffffff'
  tertiary-container: '#007bb9'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system projects clinical precision tempered by an exceptionally warm, welcoming, and approachable disposition. Designed for clarity, focus, and low cognitive overhead, it pairs high-utility informational architecture with soft, friendly tactile elements. The emotional response should be immediate reassurance, safety, and modern sophistication—stripping away visual clutter, medical sterility, and jarring technical noise.

The visual style merges **Pristine Modern Minimalism** with **iOS-Inspired Soft Tactility**:
- An atmosphere anchored by luminous, breathing canvases and crisp pure-white surfaces.
- Sweeping squircle corners that eliminate harsh angles and induce organic, effortless navigation.
- Subtle, ambient micro-elevations rather than aggressive layering, yielding a quiet, floating UI.
- Restrained, purposeful color highlights against deep, legible slate tones.

## Colors

The palette establishes an ultra-clean, high-legibility light environment rooted in gentle slate neutrals and an uplifting, clinical-grade teal primary tone.

### Palette Architecture
- **Canvas Base (`#F8FAFC` / `#F1F5F9`):** An airy off-white to ultra-soft slate foundation that provides subtle contrast against foreground cards without causing screen glare.
- **Card & Surface (`#FFFFFF`):** High-clarity pure white reserved for elevated components, input fields, interactive blocks, and navigation bars.
- **Primary Teal (`#0D9488`):** Communicates clarity, detection, and focus. Used for primary CTAs, active indicators, accents, and focal highlights.
- **Secondary Slate (`#0F172A`):** Deep charcoal/slate deployed strictly for high-priority headlines and dominant visual anchors.
- **Body & Supporting Slate (`#334155` / `#64748B`):** `#334155` maintains comfortable, readable contrast for body paragraphs, while `#64748B` (slate-500/600) manages secondary metadata, labels, and disabled states.
- **Borders & Dividers (`#E2E8F0` / `rgba(15, 23, 42, 0.06)`):** Kept gossamer-thin and faint to reinforce structure without introducing visual weight.

## Typography

Typography establishes an intentional dichotomy between structural geometric friendliness (**Plus Jakarta Sans**) and pure utilitarian reading efficiency (**Inter**).

- **Headlines & Display:** Set exclusively in Plus Jakarta Sans with negative tracking. The rounded letterforms soften large headings, preventing an overly corporate or clinical tone.
- **Body Copy:** Set in Inter with balanced line heights to maximize scanability across dense lists, reports, or educational modules.
- **Labels & Microcopy:** Utilize Plus Jakarta Sans semi-bold and bold weights with subtle positive letter spacing to maintain crisp character definition at small scales.

## Layout & Spacing

The layout is built on a responsive 12-column fluid grid system bounded by a maximum content width of `1280px` to maintain optimal ocular scan tracks.

### Breakpoints & Adaptations
- **Mobile (< 768px):** 4-column layout; gutters at `1rem` (`16px`), outer canvas margins at `1rem` (`16px`). Stacks cards into full-width units with vertical spacing of `1.25rem`.
- **Tablet (768px - 1024px):** 8-column layout; gutters at `1.5rem` (`24px`), margins at `2rem` (`32px`). Grid shifts to dynamic 2-column card structures.
- **Desktop (> 1024px):** 12-column layout; gutters at `2rem` (`32px`), margins scaling up to `3rem` (`48px`). Allows 3- or 4-column asymmetrical hub distributions.

### Rhythmic Discipline
An 8pt spacing baseline governs all container paddings and internal elements:
- Component internals use `space-sm` (`8px`) for tight item pairings and `space-md` (`16px`) for primary padding.
- Card envelopes use `space-lg` (`24px`) to `space-xl` (`40px`) internal padding to create an airy, uncrowded presence.

## Elevation & Depth

Visual depth is achieved through an iOS-inspired layered surface model combined with ultra-diffused, chromatic-tinted ambient shadows. Avoid heavy borders or stark black drops.

### Surface Hierarchy
1. **Level 0 (Canvas):** `#F8FAFC` base background. Flat and non-reflective.
2. **Level 1 (Cards & Hub Modules):** `#FFFFFF` surfaces with an ambient drop shadow tinted with deep slate:
   - `box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02);`
   - Encased in a faint hairline edge: `border: 1px solid rgba(226, 232, 240, 0.8)`.
3. **Level 2 (Hover & Active States):** Lifted cards during user interaction:
   - `box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.07), 0 4px 12px -2px rgba(15, 23, 42, 0.03);`
   - Subtle vertical translation: `transform: translateY(-2px);` transition over `200ms ease-out`.
4. **Level 3 (Modals, Popovers & Floating Bars):**
   - Pure white with backing blur: `backdrop-filter: blur(12px)`.
   - `box-shadow: 0 20px 48px -6px rgba(15, 23, 42, 0.09), 0 8px 16px -4px rgba(15, 23, 42, 0.04);`

## Shapes

The design system embraces an exaggerated squircle and pill geometry that signals approachability, playfulness, and modern physical hardware aesthetics.

### Corner Radii Guidelines
- **Cards & Primary Modules:** Fixed at `28px` (`rounded-3xl`). This creates signature soft-shouldered surfaces.
- **Buttons, Badges & Inputs:** Full pill shapes (`rounded-full` / `9999px`) for individual interactive elements, controls, and chips.
- **Nested Inner Containers:** Scaled proportionally at `16px` to `20px` to maintain concentric geometry with outer `28px` parents.

## Components

### Buttons
- **Primary:** Full pill (`9999px`), Teal background (`#0D9488`), white text (`#FFFFFF`), `font-weight: 600`. Padding: `12px 24px`. Subtle teal glow on hover: `box-shadow: 0 8px 20px -4px rgba(13, 148, 136, 0.35)`.
- **Secondary / Ghost:** Full pill, pure white surface (`#FFFFFF`) with 1px border (`#E2E8F0`), charcoal text (`#0F172A`). Hover transitions to background `#F1F5F9`.
- **Icon Buttons:** Circular (`44px` x `44px`), soft neutral background (`#F1F5F9`) or pure white with Level 1 elevation. Line-art icon centered.

### Cards & Hub Modules
- Constructed on `#FFFFFF` with `28px` corner radius and Level 1 elevation.
- Internal padding: `24px` on mobile, `32px` on desktop.
- Header incorporates 1.5px stroke minimalist slate or teal line-art iconography housed in a circular soft-slate (`#F1F5F9`) badge.

### Chips & Filter Pills
- Heights fixed at `36px` with pill-shaped boundaries.
- **Default:** Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#64748B`.
- **Active:** Background `#0F172A`, border `1px solid #0F172A`, text `#FFFFFF`.

### Input Fields & Controls
- Heights fixed at `48px` to ensure tactile touch targets.
- Pill or rounded-2xl geometry (`16px` - `9999px`).
- Background `#FFFFFF`, subtle border `#E2E8F0`, placeholder text `#94A3B8`.
- Focus state: border `#0D9488` with an ambient ring: `box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.12)`.

### Checkboxes & Radios
- Radios are full circles; checkboxes carry an `8px` rounded-md radius.
- Unchecked: `#FFFFFF` with `1.5px solid #CBD5E1`.
- Checked: `#0D9488` fill with pure white centered glyph.

### Line-Art Iconography
- Consistent 1.5px to 1.75px stroke weight, round caps, round joins.
- Icon color strictly keyed to `#0F172A` (dominant), `#64748B` (secondary), or `#0D9488` (interactive/accent).