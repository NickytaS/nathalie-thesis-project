# Design documentation — Migration Evaluator web

This document describes the visual system, tokens, and UI patterns for the **Migration Tool Evaluator** React app (`src/`). Implementation lives primarily in `src/index.css`; global fonts are loaded from `index.html`.

---

## 1. Product context

- **Purpose:** Thesis decision-support site: compare database migration tools, present empirical scenario results, and run a weighted evaluation quiz.
- **Tone:** Technical, trustworthy, readable on long sessions. Dark UI with green accents (not blue).
- **Stack:** React 18, React Router, Vite. Styles are global CSS (no component library).

---

## 2. Design principles

1. **Dark-first:** Near-black backgrounds with clear hierarchy (`--bg-primary` → `--bg-card`).
2. **One primary accent:** Forest green (`--accent-primary`) for links, CTAs, highlights; mint (`--accent-green`) for success / secondary emphasis where needed.
3. **Readable data:** Tables and code use **IBM Plex Mono**; body UI uses **Miranda Sans**.
4. **Accessible:** Visible `:focus-visible` outlines, skip link to main content, `prefers-reduced-motion` respected.
5. **Detached chrome:** The top bar is inset, rounded, and elevated so it reads as a floating panel, not a full-width strip.

---

## 3. Typography

| Role | Font | Weights (loaded) | Usage |
|------|------|------------------|--------|
| **UI / headings** | Miranda Sans (Google Fonts) | 400, 500, 600, 700 | `body`, navigation, page titles, section titles, evaluator copy |
| **Monospace** | IBM Plex Mono | 400, 500, 600 | Data tables, comparison tables, inline/code blocks |
| **Fallbacks** | `system-ui`, `-apple-system`, `Segoe UI`, sans-serif | — | If webfonts fail |

- **Base size:** `16px` on `body`; line-height `1.65`.
- **Smoothing:** `-webkit-font-smoothing: antialiased` on `body`.

**Source files:** `index.html` (Google Fonts link), `src/index.css` (`--font-sans`, `--font-mono`).

---

## 4. Color system

Semantic tokens are defined on `:root` in `src/index.css`. Prefer **variables** over hard-coded hex in new UI.

### 4.1 Backgrounds

| Token | Value | Use |
|-------|--------|-----|
| `--bg-primary` | `#080c11` | Page background |
| `--bg-secondary` | `#101820` | Sections, secondary surfaces |
| `--bg-tertiary` | `#182230` | Inputs, nested panels |
| `--bg-card` | `#141c28` | Card surfaces |
| `--bg-elevated` | `rgba(20, 28, 40, 0.85)` | Legacy elevated surfaces |

### 4.2 Text

| Token | Value | Use |
|-------|--------|-----|
| `--text-primary` | `#e9edf2` | Primary copy |
| `--text-secondary` | `#9ca8b4` | Supporting text |
| `--text-muted` | `#5c6773` | Captions, footnotes |

### 4.3 Accents

| Token | Value | Use |
|-------|--------|-----|
| `--accent-primary` | `#3d8f6f` | Primary actions, links, key metrics |
| `--accent-primary-hover` | `#2f7356` | Primary button hover |
| `--accent-green` | `#3ef3b0` | Success highlights, MRM column, PASS states |
| `--accent-orange` | `#ffb04a` | Mongify / warning-adjacent accents |
| `--accent-red` | `#ff7a7a` | Errors / FAIL |
| `--accent-purple` | `#b8a3ff` | ERP / BNF tags, tertiary highlights |
| `--border-color` | `#2a3544` | Default borders |

### 4.4 Decorative / special

| Token | Use |
|-------|-----|
| `--gold`, `--silver`, `--bronze` | Ranking / stars where applicable |

**Background treatment:** A fixed pseudo-layer on `body::before` adds subtle green radial washes and a light grid (see `index.css`).

---

## 5. Spacing, radius, and elevation

### 5.1 Border radius

| Token | Value | Typical use |
|-------|--------|-------------|
| `--radius-sm` | `6px` | Buttons, small chips |
| `--radius-md` | `10px` | Cards, inputs |
| `--radius-lg` | `14px` | Large cards, CTA block, nav bar (see below) |

### 5.2 Shadows (tokens)

| Token | Role |
|-------|------|
| `--shadow-card` | Deep card shadow |
| `--shadow-glow` | Subtle green-tinted ring on some panels |

The **floating top bar** uses additional layered `box-shadow` values on `.site-nav` (not only these tokens).

### 5.3 Layout width

- **Nav shell:** `max-width: 1280px`, centered, horizontal padding via `.nav-shell`.
- **Content sections:** Often `max-width: 1200px` on `.section` patterns (see `index.css`).

---

## 6. Core components

### 6.1 Top navigation (`.nav-shell` + `.site-nav`)

- **Shell:** Sticky, inset from viewport edges, `pointer-events: none` on shell with `pointer-events: auto` on the inner bar so margins stay “click-through.”
- **Bar:** Rounded (~14px), blurred translucent background, green-tinted border, layered shadow.
- **Logo:** Image + `aria-label` on the home `Link` (wordmark text removed).
- **Mobile:** Hamburger reveals a fixed slide-in panel; top padding accounts for the floating bar height.

**Files:** `src/components/Layout.tsx`, `src/index.css` (`.nav-shell`, `.site-nav`, `.nav-links`, `.nav-toggle`).

### 6.2 Buttons

- **Primary:** `.btn.btn-primary` — green fill, dark text, hover uses `--accent-primary-hover` and slight lift.
- **Secondary:** `.btn.btn-secondary` — dark fill, bordered, hover links to accent color.

### 6.3 Hero & sections

- **Hero:** Centered headline (Miranda Sans), optional gradient orbs, primary/secondary CTAs.
- **Section titles:** `.section-title`, `.section-subtitle` for repeated page rhythm.

### 6.4 Framework cards (evaluation weights)

- **Layout:** CSS grid; each card is a **two-column row**: weight badge (`.framework-card-weight`) + content (`.framework-card-content`).
- **Style:** Gradient wash, border, hover lift; responsive stack under ~420px.

### 6.5 Data presentation

- **`.data-table` / `.comparison-table`:** IBM Plex Mono; column accents (`.accent-pg`, etc.) map to tools.
- **PASS/FAIL:** Green / red text conventions.

### 6.6 Chat widget

- Fixed bottom-right; gradient header; matches accent tokens.

### 6.7 Footer

- `.site-footer` — centered title + note; muted text.

---

## 7. Accessibility

- **Skip link:** “Skip to content” targets `#main-content`.
- **Focus:** `outline: 2px solid var(--accent-primary)` on `:focus-visible` (and main landmark when focused via skip link).
- **Motion:** `@media (prefers-reduced-motion: reduce)` minimizes animations/transitions.
- **Icons / logo:** Decorative logo uses `alt=""` when `aria-label` on the parent link carries the name.

---

## 8. Assets

| Asset | Path | Notes |
|-------|------|--------|
| Logo | `src/assets/Logo.png` | Imported in `Layout.tsx`; optimize size for production if needed |

---

## 9. Print / PDF export

- **`src/utils/exportPdf.ts`:** Opens a print window with inline styles; accent colors follow the green palette (aligned with the site, not legacy blue).

---

## 10. Maintenance

- **Single source of truth for tokens:** `src/index.css` `:root`.
- **After token changes:** Re-check contrast (WCAG) for `--text-*` on `--bg-*` and primary buttons.
- **New components:** Reuse existing classes where possible; extend `:root` for new tokens rather than scattering hex values.

---

*Last aligned with the codebase structure and `index.css` tokens as of the document creation date.*
