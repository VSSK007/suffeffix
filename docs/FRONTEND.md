# Frontend architecture

Next.js (App Router) + TypeScript strict + Tailwind. No component library, no state-management library. Data comes only from the API via typed clients generated with `openapi-typescript` from `/openapi.json` (`pnpm gen:api`).

## Design language — "linguistic observatory"

- Monochrome base (near-black on paper-white; dark inverse) with **one accent** (deep indigo `#3b3bb3`).
- Serif for headings (source-serif stack), monospace for forms, transliterations, and ids; generous whitespace.
- Provenance and confidence are always visible: every rendered fact carries its epistemic badge (`ESTABLISHED / ENGINEERING / HYPOTHESIS / FUTURE`), review status, and — for etymology — confidence and a **contested** badge where applicable.
- No hero gradients, no marketing copy, no CTAs, no testimonials, no pricing.

## Scripts & typography

Noto Sans Telugu and Noto Sans Devanagari loaded via `next/font`; transliteration shown beside every non-Latin form. NFC normalization on input.

## Routes

| Route | Feature |
|---|---|
| `/` | landing: live search + honest dataset counts from `/v0/meta` |
| `/lexicon`, `/lexicon/[id]` | Lexical Explorer: morphology segmentation, atoms, etymology, aligned forms, generated explanation with expandable trace |
| `/affixes`, `/affixes/[id]` | Affix Atlas: filter by language and function; **matrix view** (function × language); affix page shows role, function, register, productivity, examples, cross-lingual equivalents |
| `/atoms`, `/atoms/[id]` | Semantic Atom Explorer (carries the interlingua disclaimer verbatim) |
| `/etymology/[entryId]` | lineage DAG rendered as plain SVG with d3-hierarchy layout; families as swimlane hues, drift labels on edges, sources + confidence, contested badges |
| `/docs` | renders `docs/*.md` |
| `/about` | principle, epistemic key, data statement, licences |

## Responsive

Single column on mobile; trace panels collapsible (`<details>`); tables become card lists under 640 px; the etymology SVG pans/scrolls horizontally.

## Explanation display

Each sentence of a generated explanation is followed by an expandable trace listing `{kind, ref, confidence}` items (affix / atom / edge / rule / source) with links into the graph. Freehand notes render in a visually distinct "annotator note" block. Explanations are never presented as authoritative.
