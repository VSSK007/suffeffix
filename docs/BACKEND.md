# Backend architecture

Python 3.12 · FastAPI · Pydantic v2 · uvicorn · uv for env/deps.

## packages/core (`suffeffix_core`) — pure library, zero FastAPI imports

- `schema/` — Pydantic v2 models for every dataset object (see docs/schema/*.json for exports).
- `load.py` — JSON → typed models; a single `Dataset` aggregate.
- `index.py` — in-memory graph index built once: dict adjacency (entry→affixes, affix→examples, atom→entries, concept→entries, entry→edges, equivalence classes, node→etymology neighbors). No networkx (BFS/one-hop expansion is ~30 lines).
- `search.py` — exact form, transliteration, gloss substring; script-agnostic normalization: NFC + lowercase + a small transliteration-normalization layer (strip diacritics from IAST/ISO — ā→a, ṁ/ṃ→m, ñ→n, ṭ/ḍ/ṇ/ś/ṣ→plain — so `manchitanam` finds `mañcitanaṁ`). Ranked: exact form > exact translit > translit-normalized > gloss substring.
- `explain.py` — deterministic template engine. Input: entry + resolved graph. Output: `Explanation` with per-sentence `trace` of `{kind: affix|atom|edge|rule|source, ref, confidence}`. Rules are named (e.g. `rule:morphology-chain`, `rule:atom-structure`, `rule:etymology-hop`, `rule:alignment`); identical input ⇒ identical output; golden-tested for ≥ 10 entries.
- `validate.py` — all research-integrity and referential rules (see docs/DATASET.md); returns a typed report; exit-code CLI via `scripts/validate.py`.

## apps/api (`suffeffix_api`)

Routers + response models + dependency wiring only; no business logic. Dataset loaded once at startup (lifespan), validated; `/health` exposes counts + validation status. Errors are RFC 7807 `application/problem+json`. CORS open for GET (public read-only API).

## Tests

pytest: validators (incl. the family constraint with crafted bad edges), loaders, search normalization, explanation golden outputs (మంచితనం, बचपन, hopeless, चीनी, sugar, పుస్తకం, किताब, अकेलापन, ఒంటరితనం, teacher), plus a smoke test hitting every API route.
