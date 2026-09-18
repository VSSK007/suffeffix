# Repository layout

```
suffeffix/
  README.md
  LICENSE                 (code: Apache-2.0)
  CITATION.cff
  CONTRIBUTING.md
  Makefile                make validate | make api | make web | make test | make dev
  .env.example            NEXT_PUBLIC_API_URL only
  docs/                   ARCHITECTURE, DECISIONS, DATASET, SEMANTICS, FRONTEND,
                          BACKEND, API, IMPLEMENTATION_PLAN, REPO, ROADMAP,
                          LAUNCH_CHECKLIST, schema/*.json (exported JSON Schema)
  data/                   LICENSE (CC BY-SA 4.0), atoms.json, affix_functions.json,
                          equivalence_classes.json, affixes/{en,te,hi}.json,
                          concepts.json, entries/{en,te,hi}.json, roots.json,
                          etymology_edges.json, sources.json
  packages/core/          pyproject.toml, suffeffix_core/ (schema/, load, index,
                          search, explain, validate), tests/
  apps/api/               pyproject.toml, suffeffix_api/ (main, routers/, problem.py), tests/
  apps/web/               Next.js App Router app (TypeScript strict, Tailwind)
  scripts/                validate.py, export_schema.py, build_stats.py
  .github/workflows/ci.yml  (validate data · pytest · tsc · next build)
```

Tooling: **uv** for Python (workspace with `packages/core` + `apps/api`), **pnpm** for Node. Versions pinned in lockfiles.
