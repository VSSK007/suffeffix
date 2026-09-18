# Launch checklist — v0.1

- [ ] `make validate` passes; dataset counts within §1.2 limits and displayed honestly on `/`.
- [ ] Every etymology edge has `source_ref`; Wiktionary-only edges ≤ 0.6 confidence (validator-enforced).
- [ ] Contested items (`status: "contested"`) render with a visible badge everywhere they appear.
- [ ] Family constraint unit-tested: COGNATE/INHERITED across top-level families is rejected.
- [ ] "Semantic atoms are an engineering interlingua, not a theory of human cognition." — present verbatim in `/atoms` UI and docs/SEMANTICS.md.
- [ ] No prohibited features: `grep -riE "openai|anthropic|embedding|vector|auth|stripe|langchain" apps packages data` → no hits.
- [ ] Lighthouse accessibility ≥ 90 on `/`, `/lexicon/[id]`, `/affixes`.
- [ ] Telugu and Devanagari render correctly on mobile (Noto fonts via next/font).
- [ ] `/openapi.json` served; typed frontend client generated from it.
- [ ] README covers: foundational principle, two-family constraint, epistemic key, run-locally commands, how to cite, how to contribute a reviewed entry.
- [ ] `CITATION.cff` present; code Apache-2.0; data CC BY-SA 4.0 (`data/LICENSE`).
- [ ] `docs/ROADMAP.md` lists deferred items (French, Tamil, neologism engine, analogy playground, larger lexicon, external review).
- [ ] `make test` green; `next build` succeeds; CI workflow runs all four gates.
