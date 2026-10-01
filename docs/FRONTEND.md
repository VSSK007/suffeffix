# Frontend architecture

Next.js 15 (App Router) + TypeScript (strict) + Tailwind, exported as a fully static site (see `DEPLOY.md`).
No component library and no state-management library. Data reaches the pages at build time:
`scripts/export_site.py` replays the FastAPI app, so the website, the API and the downloadable files are built from
the same payloads and cannot disagree.

## Design language — a research publication

Suffeffix presents a piece of research, so it is laid out like one: large editorial type, generous space, figures with
numbers and captions, explicit limitations, a citation block. It is also built around its subject — one meaning landing
in three languages and two families.

- **Lanes.** Wherever words appear, the order is fixed: **English | Hindi ‖ Telugu**. The two Indo-European languages
  sit together; a dashed gutter separates Dravidian Telugu. The family boundary — the one hard constraint in the
  dataset — is part of the layout, not a footnote.
- **Two data hues, nothing else.** Ultramarine (`--ie`) means Indo-European; turmeric (`--dr`) means Dravidian. Chips,
  family dots, lane headers, etymology bands and the logo use them in that sense only. Everything else is ink on a crisp
  white (or near-black) ground. Contested is the only other loud colour.
- **Type.** One family across all three scripts: Anek Latin, Anek Devanagari and Anek Telugu, self-hosted via
  `next/font`. Display type uses Anek's width axis (`.display`, `.h-xl`, `.h-lg`); IBM Plex Mono carries identifiers,
  transliterations and traces. Hindi and Telugu text carries a `lang` attribute so screen readers and browsers choose
  the right voice and font.
- **The mark.** Three bars — two ultramarine, a gap, one turmeric. The lanes, as a logo.
- **The triptych** (`components/triptych.tsx`) is the signature object: one meaning's words in three lanes, each affix
  placed on the row of its *function*, so functionally equivalent affixes line up horizontally. Alignment is shown by
  position.
- **Figures** (`components/figure.tsx`, `figures.tsx`) are numbered, captioned and interactive: hover/focus readouts that
  lead with the value, direct labels dropped (never clipped) when they do not fit, legends that highlight their series,
  and a table twin for every chart so no value is reachable only by hover or colour. Chart colours were checked for
  colour-vision separation. Wide diagrams show their table first on phones.
- **Both themes are designed.** Light is the default; dark is a separate token set, not an inversion. The header control
  cycles system / light / dark and an inline script applies the choice before first paint (no flash).
- **Honest by default.** Every page that states a number says where it comes from; the report states its limitations;
  statistics over the dataset are caveated as describing a *selection*, not the languages.
- No hero gradients, no testimonials, no pricing, no sign-up.

## Routes

| Route | View |
|---|---|
| `/` | thesis, a live one-meaning-three-languages demonstration (pausable), numbers, featured research, four ways in |
| `/research/`, `/research/suffeffix-v0-1/` | the technical report: abstract, six interactive figures, limitations, data statement, citation, references |
| `/data/` | the dataset release: files with sizes, row counts and SHA-256, column guide, verification, release notes |
| `/lexicon/` | the **Concordance**: all meanings × three lanes, filter by text, function, derived-in-all-three |
| `/concepts/[slug]/` | one meaning: triptych, decomposition, atoms, each word |
| `/lexicon/[lang]/[slug]/` | one word: morpheme equation, its triptych, traced explanation, etymology, facts rail |
| `/affixes/`, `/affixes/[lang]/[slug]/` | the **Affix Atlas** (function × lane, rows expand to real example words) and one affix |
| `/atoms/`, `/atoms/[name]/` | the closed inventory as a table of elements; one atom with exponents and the meanings using it |
| `/etymology/[lang]/[slug]/` | lineage in family bands, cross-family borrowings highlighted, every edge sourced |
| `/docs/`, `/about/` | documentation (rendered from `docs/*.md`) and principles |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/nav-index.json` | generated at build |

Search is a global command palette (⌘K, Ctrl+K or `/`) over words, meanings, affixes and atoms, keyboard-driven, with
indexes loaded lazily.

## Production concerns

- **SEO**: every page has its own canonical URL, description, Open Graph and Twitter card (`lib/seo.ts`,
  `/og.png`); JSON-LD for the site, the report (`ScholarlyArticle`) and the dataset (`Dataset`); a sitemap of ~650 URLs.
- **Security**: strict CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies, immutable caching
  for hashed assets — in `public/_headers` (Cloudflare Pages, Netlify) and `vercel.json`. The site makes no third-party
  requests (fonts are self-hosted) and sets no cookies.
- **Accessibility**: skip link, landmarks, `aria-current`, visible focus, `lang` on Indic text, keyboard-operable charts and
  palette, a pause control on moving content, `prefers-reduced-motion` respected, table twins for charts.
- **Correctness gates**: `scripts/check_links.py` fails the build on a broken internal link or anchor.

## Responsive

Single column on phones with a full-screen menu; lanes stack; tables scroll in their own containers; the schema
diagram shows its table first; the etymology and affix matrices scroll horizontally within their cards.
