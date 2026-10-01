# Roadmap (text only — no scaffolding in code)

All items below are `FUTURE` and intentionally absent from the current release.

Shipped in v0.2: **French (fr) and Tamil (ta)**, completing the T.H.E.F.T. language set (DECISIONS 13).

- Neologism engine (compose affixes onto stems with constraint checking).
- Analogy playground (A : B :: C : ?) over the affix graph.
- Larger lexicon (beyond the 850-entry cap) with external reviewer workflow; promote `draft` → `reviewed` → `published`.
- IPA coverage for all lemmas; audio.
- Sandhi-aware Telugu/Hindi/Tamil segmentation display.
- Export of the graph as RDF/Linked Data (kept out to avoid ontology creep).
- **Tamil and French review.** The v0.2 French and Tamil records are first drafts; six meanings are flagged `partial_coverage`.

## Known limitations

- Nearly all content ships `review_status: "draft"`; counts are displayed honestly on `/`.
- Atom structures for complex emotions/abstractions are coarse approximations (`HYPOTHESIS`).
- Segmentations follow surface morphology; sandhi alternations recorded only as allomorphs.

## Added during launch preparation (text only)

- **Expert review workflow.** A reviewer-facing view that lists draft records with their sources, so `draft` to `reviewed` can happen item by item.
- **Reference entry numbers.** Verify and add CDIAL and DEDR entry numbers against the printed volumes, lifting the 0.7 confidence cap where justified.
- **Real-user performance data** for Hindi-, Telugu- and Tamil-heavy pages, then reconsider the font strategy (decision 12).
- **Per-page social cards** (one per word or meaning) instead of a single site-wide image.
- **Print or PDF edition** of the technical report.
