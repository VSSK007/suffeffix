# Roadmap (text only — no scaffolding in code)

All items below are `FUTURE` and intentionally absent from v0.1.

- **French (fr) and Tamil (ta)** — v0.2 language targets. Adding a language = extend the `Lang` literal, add `data/affixes/xx.json` + `data/entries/xx.json`, extend atom exponents.
- Neologism engine (compose affixes onto stems with constraint checking).
- Analogy playground (A : B :: C : ?) over the affix graph.
- Larger lexicon (beyond the 500-entry cap) with external reviewer workflow; promote `draft` → `reviewed` → `published`.
- IPA coverage for all lemmas; audio.
- Sandhi-aware Telugu/Hindi segmentation display.
- Export of the graph as RDF/Linked Data (kept out of v0.1 to avoid ontology creep).

## Known v0.1 limitations

- Nearly all content ships `review_status: "draft"`; counts are displayed honestly on `/`.
- Atom structures for complex emotions/abstractions are coarse approximations (`HYPOTHESIS`).
- Segmentations follow surface morphology; sandhi alternations recorded only as allomorphs.

## Added during launch preparation (text only)

- **Expert review workflow.** A reviewer-facing view that lists draft records with their sources, so `draft` to `reviewed` can happen item by item.
- **Reference entry numbers.** Verify and add CDIAL and DEDR entry numbers against the printed volumes, lifting the 0.7 confidence cap where justified.
- **Real-user performance data** for Hindi- and Telugu-heavy pages, then reconsider the font strategy (decision 12).
- **Per-page social cards** (one per word or meaning) instead of a single site-wide image.
- **Print or PDF edition** of the technical report.
