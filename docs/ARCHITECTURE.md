# Suffeffix — Architecture

> **Suffeffix is an explainable lexical knowledge graph that jointly represents morphology, semantic decomposition, etymology, and affix alignment.**

Every design decision below serves that sentence. `[ENGINEERING]` unless noted.

## Layers (dependencies point inward only)

```
data/            linguistic content (JSON, CC BY-SA 4.0)
   ↓ loaded by
packages/core    pure Python domain library: schemas, loaders, validators,
                 graph index, search, explanation engine. Zero FastAPI imports.
   ↓ wrapped by
apps/api         FastAPI adapters: routers, response wiring, RFC 7807 errors.
   ↓ consumed by
apps/web         Next.js UI. Talks only to the API via typed clients
                 generated from /openapi.json.
```

## Why JSON-first, no database

- The dataset is capped at 300–500 entries plus supporting tables (§1.2 of the spec). This fits trivially in memory (< 2 MB). A database adds operational surface (migrations, connections, a second source of truth) and zero value at this scale.
- JSON files are diffable, reviewable in PRs, and are themselves the published dataset artifact. The data *is* the repo.
- The FastAPI process loads JSON into typed Pydantic models at startup, builds dict-based indexes, and serves reads. There are no write endpoints in v0.1, so no persistence problem exists.

## Why the frontend consumes the API rather than importing JSON

The API is the public contract. Future consumers (researchers, other UIs, scripts) get the same resolved, validated, explanation-enriched view the UI gets. Importing raw JSON into the frontend would duplicate resolution logic in TypeScript and let the two views drift.

## Why domain logic lives in a pure package

- Validators run in CI without an ASGI server.
- The explanation engine is deterministic and golden-tested; keeping it framework-free makes those tests trivial.
- `apps/api` stays thin: routers + response models only.

## Graph model

The knowledge graph is heterogeneous: nodes are entries, affixes, atoms, concepts, roots, and free-standing etymology nodes (historical forms that are not entries); edges are morphology attachments, concept membership, atom decomposition, alignment relations, and etymology edges. It is stored as normalized JSON tables with string-id references, and materialized at load time into dict adjacency indexes (`packages/core/suffeffix_core/index.py`). No networkx: the traversals needed (id resolution, one-hop expansion, etymology subgraph extraction by BFS) are ~30 lines of code and networkx would add a dependency for nothing.

## Assumptions challenged (see docs/DECISIONS.md for full log)

1. **"Suffix-focused" name vs. reality** — Hindi privatives निर्- / बे- and English un- are prefixes. The model uses a general `Affix.kind`; the brand name stays, the data model does not privilege suffixes.
2. **"Cognate" across families** — hard-rejected by the validator, not just documented. Telugu–Hindi lookalikes are shared Sanskrit loans (`SHARED_LOAN`), never cognates. `[ESTABLISHED]`
3. **One-affix-per-word** — wrong; e.g. *hopelessness* = hope + -less + -ness. Morphology holds an ordered affix list.
4. **Atoms as an ontology** — rejected. Atoms are a bounded engineering interlingua (≤ 50), seeded from NSM primes; no reasoning engine, no OWL. `[ENGINEERING]`
5. **Graph database / GraphQL** — rejected. Dataset scale makes both pure overhead; REST + in-memory indexes are the honest fit.
6. **Wiktionary as a source** — allowed but capped at confidence 0.6, because it is crowd-edited; reference works (OED, CDIAL, DEDR, Monier-Williams, Platts, Brown) anchor higher confidence.

## Epistemic discipline

Every content object carries `epistemic_status` (`ESTABLISHED | ENGINEERING | HYPOTHESIS | FUTURE`) and `Provenance.review_status` (`draft | reviewed | published`). Explanations are assembled by a deterministic template engine from graph facts, each sentence carrying a trace of the nodes/rules/sources that produced it. Freehand notes render separately as "annotator note".
