# Design system: RAG Learning App

Authoritative visual and layout rules for the frontend. Implementation should follow this document alongside [`tasks/prd-rag-learning-app.md`](../tasks/tasks-prd-rag-learning-app.md).

---

## Brand personality

- **Calm:** generous whitespace, soft contrast, no aggressive motion, predictable layout. Avoid loud colors, harsh borders, or jittery animations.

---

## Layout

- **Single-page shell:** The **document** does not scroll (`min-h-dvh` + `overflow-hidden` on the root layout). All scrolling happens **inside** designated regions (e.g. conversation list, sources list).
- **Grid-first:** Use CSS Grid for the main app structure (columns/rows for ingest, chat, explainability). **Mobile-first:** default to a single column; at larger breakpoints, expand to multi-column grid.
- **Regions:** Ingest, chat, and explainability each live in grid areas with **internal** `overflow-y: auto` where content can grow—this preserves “no page scroll” while meeting the PRD’s need for scrollable conversation content.

---

## Spacing and vertical rhythm

- **Spacing scale:** Use **only multiples of 4px** for `padding`, `margin`, `gap`, `min-height`/`max-height` when used as layout spacing (e.g. `4`, `8`, `12`, `16`, `20`, `24`, `32`… in Tailwind: `p-2`, `gap-3`, `mt-4`, etc., where `1` = 4px if using default Tailwind scale aligned to 4).
- **Tailwind config:** Map spacing tokens so arbitrary values stay on the 4px grid (avoid `5px`, `7px`, etc.).

### Line-height vs “multiples of 4”

- **Spacing** (margins, padding, gaps between blocks) = **multiples of 4px** — this is your main vertical rhythm.
- **Line-height** for text is best expressed as **unitless ratios** tied to each typography role (Headline **1.2**, Body **1.4**, Label **1**). Those ratios **do not** need to be multiples of 4; they scale with `font-size` and keep reading comfortable.
- **Why both?** Requiring every *line box* to land on a 4px grid (e.g. 16×1.4 = 22.4px) fights readability. Industry practice: **ratios for line-height**, **4px grid for layout spacing** between elements. If you ever need stricter baseline alignment (print-like), that is a separate, optional refinement (baseline grid), not required for this app.
- **Labels:** Minimum **12px** font size with line-height **1** → line box **12px** (a multiple of 4), which aligns nicely with the grid.

---

## Typography

### Font family

- **Primary:** **General Sans** (self-hosted). Source font files live in **`fonts/`**. Copy/symlink them into **`src/assets/fonts/`** for the Vite app bundle, then register with `@font-face` in global CSS and set `font-family` on `body` / design tokens.

### Modular scale (configurable)

- **Base font size:** **16px** (`1rem` root).
- **Scale ratio:** **1.25** between steps (major third).
- **Implementation:** Centralize in one place so you can change base and ratio later:
  - **CSS custom properties** (recommended), e.g. `--font-size-base`, `--font-scale`, and derived steps `--step--1`, `--step-0`, `--step-1`, … **or**
  - A small **`typography.ts`** / theme file that exports `BASE_PX`, `SCALE`, and computed `fontSizeSteps` for components.

Example (conceptual):

```css
:root {
  --font-size-base: 16px;
  --font-scale: 1.25;
  /* steps: multiply/divide by scale from base */
}
```

Map **Headline** to appropriate steps (e.g. larger steps), **Body** to base or one step down, **Label** to a step that never goes below **12px** (enforce minimum in tokens or component).

### Typography components (use-case names)

| Component | Line-height (unitless) | Notes |
|-----------|-------------------------|--------|
| **Headline** | **1.2** | Titles, section headings |
| **Body**   | **1.4** | Paragraphs, chat content |
| **Label**  | **1**   | Captions, metadata, form labels; **min font-size 12px** |

- **Color:** Expose a `color` prop (e.g. `primary` | `muted` | `secondary` | `danger` — extend as needed) mapping to design tokens / Tailwind semantic classes.
- **Vertical rhythm:** Stack typography with **margins that are multiples of 4px** (e.g. margin between blocks of Body), not by tweaking line-height to fake spacing.

---

## Motion

- Use the **`motion`** package ([motion.dev](https://motion.dev/) — npm [`motion`](https://www.npmjs.com/package/motion)) for transitions and micro-interactions. Prefer **subtle** duration and easing to support a **calm** feel; respect **`prefers-reduced-motion`** and reduce or disable non-essential motion when set.

---

## ElevenLabs UI alignment

- [`Conversation`](https://ui.elevenlabs.io/docs/components/conversation) / [`Message`](https://ui.elevenlabs.io/docs/components/message) / [`ShimmeringText`](https://ui.elevenlabs.io/docs/components/shimmering-text) should be **styled to match** these tokens (wrap or className overrides) so the app does not look like a generic shadcn demo.
- Shimmering text: keep motion gentle; consider softer shimmer colors in theme tokens.

---

## Files (implementation checklist)

| Item | Location |
|------|----------|
| General Sans source files | `fonts/` |
| App-consumed fonts | `src/assets/fonts/` |
| `@font-face` + root font | `src/index.css` or `src/styles/fonts.css` |
| Scale variables | `src/styles/typography.css` or theme layer |
| `Headline`, `Body`, `Label` | e.g. `src/components/typography/` |
| Layout shell | e.g. `src/App.tsx` or `src/layouts/AppLayout.tsx` |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-30 | Initial spec from product owner: grid, mobile-first, General Sans, 1.25 scale, 4px spacing, typography components, motion, calm brand. |
