# Frontend architecture

Next.js (App Router) + TypeScript strict + Tailwind. No component library, no state-management library. Data comes from the API: `scripts/export_site.py` replays the FastAPI app at build time, and the site is pre-rendered as a static export from those exact payloads (see docs/DEPLOY.md).

## Design language — a parallel-text instrument

Suffeffix exists to show one meaning landing in three languages and two families, so
every view is built on three **lanes** in a fixed order: **English | Hindi ‖ Telugu**.
The two Indo-European languages sit together; a dashed **gutter** separates Dravidian
Telugu. The family boundary — the one hard constraint in the dataset — is part of the
layout, not a footnote.

- **Type**: one family across all three scripts — Anek Latin, Anek Devanagari and Anek
  Telugu share proportions and stroke, so mixed-script lines read as one voice. Anek is
  variable on width: display type runs wide (`.display`, `wdth 118`). IBM Plex Mono
  carries ids, transliterations and traces.
- **Colour**: two *data* hues, never decoration — ultramarine (`--ie`) means
  Indo-European, turmeric (`--dr`) means Dravidian. Affix chips, family dots, lane
  headers, etymology bands and the logo all use them in that one sense. Contested is the
  only other loud colour. Light and dark palettes are both defined as tokens.
- **The mark**: three bars — two ultramarine, a gap, one turmeric. The lanes, as a logo.
- **The triptych** (`components/triptych.tsx`) is the signature object: a meaning's
  words in three lanes, with each affix placed on the row of its *function*, so
  functionally equivalent affixes line up horizontally. Alignment is shown by position.
- **Etymology bands**: lineage graphs put every form in its family's band; inheritance
  stays inside a band, so any edge crossing a boundary is visibly a borrowing.
- **Atoms** are a closed inventory, so they are laid out as one table of elements;
  hovering an atom lights its relations.
- **Search** is a global command palette (⌘K, Ctrl+K or `/`) over words, meanings,
  affixes and atoms, keyboard-driven, with indexes loaded lazily.
- No hero gradients, no marketing copy, no testimonials, no pricing.

## Routes

| Route | View |
|---|---|
| `/` | thesis, live triptych over eight meanings, previews of Atlas / etymology / atoms, honest counts |
| `/lexicon/` | the **Concordance**: all 115 meanings × three lanes, filter by text, function, derived-in-all-three |
| `/concepts/[slug]/` | one meaning: triptych, decomposition, atoms, each word |
| `/lexicon/[lang]/[slug]/` | one word: morpheme equation, its triptych, traced explanation, etymology, facts rail |
| `/affixes/` | **Affix Atlas**: function × lane matrix; rows expand to show real words doing that job |
| `/affixes/[lang]/[slug]/` | one affix: register, productivity meter, words built with it, equivalents by lane |
| `/atoms/`, `/atoms/[name]/` | table of elements; atom page with exponents in lanes and every meaning using it |
| `/etymology/[lang]/[slug]/` | lineage in family bands, cross-family borrowings highlighted, every edge sourced |
| `/docs/`, `/about/` | documentation and principles |
| `/nav-index.json` | static index of meanings, affixes and atoms for the palette |

## Responsive

Single column on mobile; trace panels collapsible (`<details>`); tables become card lists under 640 px; the etymology SVG pans/scrolls horizontally.

## Explanation display

Each sentence of a generated explanation is followed by an expandable trace listing `{kind, ref, confidence}` items (affix / atom / edge / rule / source) with links into the graph. Freehand notes render in a visually distinct "annotator note" block. Explanations are never presented as authoritative.
