# Contributing

Suffeffix is an explainable lexical knowledge graph that jointly represents
morphology, semantic decomposition, etymology, and affix alignment. Contributions
must preserve that explainability.

## Ground rules
- Every claim gets an epistemic tag (`ESTABLISHED | ENGINEERING | HYPOTHESIS | FUTURE`).
- Every etymology edge needs a `source_ref` listed in `data/sources.json` and a
  `confidence` in [0,1]. Wiktionary-only edges cap at 0.6. Never invent
  CDIAL/DEDR entry numbers; cite the work without a number (confidence <= 0.7).
- No cognate/inheritance edges across top-level language families (the
  validator enforces this).
- Contested facts stay `status: "contested"`; do not silently resolve them.
- New content ships as `review_status: "draft"`. A maintainer promotes it to
  `reviewed` once checked against the cited reference work.

## Workflow
1. Edit JSON in `data/` per `docs/schema/*.json` and `docs/DATASET.md`.
2. `make validate && make test` must pass.
3. Open a PR citing the reference work and entry/page for each new fact.

## Out of scope (v0.1)
LLMs, embeddings, vector search, auth, payments, translation, text generation.
See `docs/ROADMAP.md` for deferred features (French, Tamil, neologism engine...).
