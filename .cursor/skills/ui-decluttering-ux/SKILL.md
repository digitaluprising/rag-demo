---
name: ui-decluttering-ux
description: >-
  Applies decluttering principles for UI and UX—balancing simplicity with clarity,
  progressive disclosure, hierarchy, and feedback. Use when reviewing or designing
  interfaces, simplifying screens, reducing visual noise, improving flow, or when
  the user asks for UX tips, UI critique, or decluttering guidance.
---

# UI decluttering (UX)

## Guiding principle

**Clarity > simplicity.** Decluttering is not maximal removal—it is **intentionally choosing what to show, hide, or emphasize** so users can reach goals with less cognitive load.

**Core balance:** removing/hiding reduces noise; keeping/adding the *right* things enables clarity and function. Too much of either hurts UX.

## When reviewing or advising

1. **User goals first** — What must they accomplish on this screen or flow?
2. **Context** — Product type (marketing vs app), novice vs expert users, dense forms vs content pages.
3. **Iterate** — Prefer specific, testable changes over vague “simplify everything.”

## How to declutter (levers)

### Reduce visual noise

Fewer colors; softer shadows; fewer borders; limit typefaces; consistent icons; whitespace; simpler controls.

### Progressive disclosure

Do not show everything at once. Reveal as needed; signal that more exists; put critical actions and content first. Patterns: advanced toggles, accordions, stepped flows.

### Visual hierarchy

Order by importance; group related items; headings and bullets over walls of text; clear **primary vs secondary** actions; distinguish **interactive vs static** elements.

### Keep or add the right things

- **Interaction cost** — Pick patterns that reduce effort (e.g. small sets in dropdowns; radios when comparing options; avoid gratuitous clicks).
- **Needs** — Information (clarity, context) and function (actions, navigation).
- **Feedback** — Status, errors, success; do not strip these in the name of minimalism.

### When “more” helps UX

Hierarchy needs contrast; navigation must be findable; icons often need labels; multi-step flows need progress; empty states need guidance.

## Over-decluttering risks

Removing too much, hiding essential features, or oversimplifying interactions can cause confusion and frustration. Call out this risk when recommending aggressive removal.

## Review checklist

Copy or mentally run through:

- [ ] Is the primary action obvious at a glance?
- [ ] Is anything competing unnecessarily for attention?
- [ ] Would a first-time user find needed guidance (or is too much hidden)?
- [ ] Are feedback and error states still clear?
- [ ] Does hierarchy match importance?
- [ ] Would progressive disclosure help dense areas?

## Output format for suggestions

For each recommendation, provide:

1. **Issue** — What creates noise, confusion, or friction?
2. **Change** — Concrete UI or pattern adjustment.
3. **Why** — Which goal: focus, cognitive load, or flow.
4. **Risk** — What breaks if this is overdone (e.g. hiding essential actions).

## Additional detail

For the full narrative guide (goals, tradeoffs, examples), see [reference.md](reference.md).
