# Suffeffix v0.1

> **Suffeffix is an explainable lexical knowledge graph that jointly represents morphology, semantic decomposition, etymology, and affix alignment.**

A morphology explorer, semantic decomposition system, affix-alignment framework, and etymology-aware lexical knowledge graph for **English, Telugu, and Hindi**. It is not a translator, a chatbot, a language model, or a dictionary clone — and it contains no AI inference of any kind.

## The two-family constraint

Telugu is **Dravidian**; Hindi (Indo-Aryan) and English (Germanic) are **Indo-European**. There are no cognates between Telugu and either Hindi or English — only borrowing links them (mostly via Sanskrit, Perso-Arabic vocabulary, and English). The validator **rejects** any cognate/inheritance edge crossing a top-level family boundary. English↔Hindi genuine cognates (*name*/नाम, *mother*/माता, *three*/तीन, *tooth*/दाँत) are allowed and sourced.

## Epistemic key

| Tag | Meaning |
|---|---|
| `ESTABLISHED` | standard linguistic knowledge citable from reference works |
| `ENGINEERING` | an abstraction chosen for implementation convenience, not a linguistic claim |
| `HYPOTHESIS` | plausible, testable, not yet demonstrated |
| `FUTURE` | out of scope for v0.1 |

Every etymology edge carries `source_ref` and `confidence`; contested etymologies stay contested and are badged. Explanations are generated deterministically from the graph, each sentence with a trace — never freehand, never authoritative. **Semantic atoms are an engineering interlingua, not a theory of human cognition.**

## Run locally

```sh
# Python 3.12 — from the repo root
pip install "pydantic>=2.7,<3" fastapi uvicorn pytest httpx

make validate            # validate the dataset (fails the build on any violation)
make test                # core + API test suites (29 tests)
make api                 # FastAPI on http://localhost:8000  (OpenAPI at /openapi.json)

# Website — Node 20+, pnpm
cd apps/web && pnpm install && cd ../..
make web                 # Next.js dev server on http://localhost:3000 (needs `make site-data` once)
make site                # the production build: export data + dataset release, build, check links
npx serve apps/web/out   # preview the static site
```

The public site is a static export built from the API's own responses; see `docs/DEPLOY.md` for deploying to
suffeffix.com on a VPS (nginx config, server setup script and a GitHub Actions deploy included).

## What is on the site

The home page; a **technical report** with six interactive figures; a **dataset release** with CSV and JSON downloads,
JSON Schemas and checksums (`/data/`); the **Concordance**, **Affix Atlas**, **Semantic atoms** and **etymology
lineage graphs**; and a global search palette (⌘K).

## Layout

`data/` (JSON dataset, CC BY-SA 4.0) → `packages/core` (pure domain library) → `apps/api` (FastAPI) → `apps/web` (Next.js). Dependencies point inward only. See `docs/ARCHITECTURE.md`; design decisions and challenged assumptions are logged in `docs/DECISIONS.md`.

## How to cite

See `CITATION.cff`. Code is Apache-2.0; the dataset in `data/` is CC BY-SA 4.0 (`data/LICENSE`).

## Contributing a reviewed entry

1. Add or edit the JSON in `data/` following `docs/schema/*.json` and `docs/DATASET.md`.
2. Every etymology edge needs a `source_ref` present in `data/sources.json`; Wiktionary-only edges cap at confidence 0.6; never invent CDIAL/DEDR numbers.
3. Run `make validate && make test`.
4. In the PR, cite the reference work and page/entry so a reviewer can promote `review_status` from `draft` to `reviewed`. Contested facts stay `contested`.

See `CONTRIBUTING.md` for details and `docs/ROADMAP.md` for deferred work (French, Tamil, neologism engine, analogy playground, larger lexicon, external review).
