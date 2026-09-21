# Frontend architecture

Next.js (App Router) + TypeScript strict + Tailwind. No component library, no state-management library. Data comes only from the API via typed clients generated with `openapi-typescript` from `/openapi.json` (`pnpm gen:api`).

## Design language — the philologist's apparatus

The subject is a machine that cuts words apart and traces them across two language
families, so the design borrows from the apparatus of comparative philology rather
than from dashboard convention.

- **Ground**: unbleached manuscript paper (`#eceae1`), faintly ruled with a 32px
  baseline grid, like a notebook. Ink is iron-gall — near-black with a blue-green cast.
- **Accent**: cinnabar (`#a8321e`), the red of manuscript rubrication. Spent in exactly
  two places: the vertical rule that marks a morpheme boundary, and live links.
- **Families own permanent hues** (`--indo`, `--drav`, `--recon`, `--semi`) because
  family membership is the one hard constraint in the dataset. The Telugu column of the
  Atlas matrix is tinted by its family hue; every etymology node carries a family rule.
- **The cut**: a 1px cinnabar rule is the site's signature mark. It splits the wordmark
  (Suff|effix), separates every segment in the `Segmentation` component, and precedes an
  affix on its own page.
- **Type**: Spectral (display and body — a serif with sharp, slightly severe detailing)
  paired with IBM Plex Mono for ids, transliterations and the trace apparatus. Labels are
  set in small caps in the serif, not as mono eyebrows.
- **Not cards**: content sits on hairline rules in ruled indexes and tables. The raised
  `.specimen` surface is spent only where something genuinely is a separate object.
- **Status marks** are typographic, not pills: small caps with a coloured hairline
  underline. `contested` is the one exception — it is the project's central honesty claim,
  so it gets a filled ground and a dagger. Confidence renders as a five-step bar so a
  quantity reads as a quantity.
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
| `/etymology/[entryId]` | lineage DAG rendered as plain SVG with a hand-rolled longest-path layered layout (no graph library); families as node hues, drift labels on edges, sources + confidence, contested badges |
| `/docs` | renders `docs/*.md` |
| `/about` | principle, epistemic key, data statement, licences |

## Responsive

Single column on mobile; trace panels collapsible (`<details>`); tables become card lists under 640 px; the etymology SVG pans/scrolls horizontally.

## Explanation display

Each sentence of a generated explanation is followed by an expandable trace listing `{kind, ref, confidence}` items (affix / atom / edge / rule / source) with links into the graph. Freehand notes render in a visually distinct "annotator note" block. Explanations are never presented as authoritative.
