# Implementation plan — ordered milestones

Each milestone is committable and runnable on its own.

1. **Schemas + validator + empty dataset** — Pydantic models, JSON Schema export, `make validate` passes on empty-but-well-formed dataset files. ✅ when validator runs and fails correctly on crafted bad data (unit tests).
2. **Dataset authored and validated** — all `data/*.json` populated within §1.2 limits; validator green; flagship etymology chains present and sourced. ✅ `make validate`.
3. **Core index + explanation engine + tests** — graph index, search, deterministic explanations; golden tests for the 10 named entries. ✅ `pytest packages/core`.
4. **API + smoke tests** — all /v0 routes; RFC 7807 errors; `/health`. ✅ `pytest apps/api`.
5. **Frontend shell + Lexical Explorer** — layout, fonts, search, `/lexicon/[id]` with explanation + trace. ✅ `next build`.
6. **Affix Atlas** — list, filters, matrix view, detail page with equivalents.
7. **Atom Explorer** — list + detail with disclaimer sentence verbatim.
8. **Etymology View** — SVG DAG, families, drift, confidence, contested badges.
9. **Docs site + landing** — `/docs` renders `docs/*.md`; `/` shows honest counts; `/about`.
10. **Launch checklist** — run docs/LAUNCH_CHECKLIST.md end to end; CI green.
