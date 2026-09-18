# API — read-only, versioned under /v0

OpenAPI served at `/openapi.json`. All responses JSON; errors RFC 7807 `application/problem+json` (`{type, title, status, detail, instance}`). No write endpoints in v0.1.

| Endpoint | Returns |
|---|---|
| `GET /v0/search?q=&lang=` | ranked entries (exact form > translit > normalized translit > gloss substring) |
| `GET /v0/entries/{id}` | full entry: resolved affixes, concept, atoms, etymology edges, aligned forms, generated explanation w/ trace |
| `GET /v0/entries?lang=&function=&affix=&atom=&register=&page=` | filtered, paginated list (page size 50) |
| `GET /v0/affixes?lang=&function=` | affix list |
| `GET /v0/affixes/{id}` | affix + resolved examples + equivalents |
| `GET /v0/affix-functions` | all functions |
| `GET /v0/equivalence-classes` | classes with resolved member affixes (matrix data for the Atlas) |
| `GET /v0/atoms` / `GET /v0/atoms/{id}` | atoms; detail includes exponents, related atoms, entries using it |
| `GET /v0/etymology/{entryId}` | lineage subgraph: nodes (with family), edges (type, drift, source, confidence, status) |
| `GET /v0/concepts/{id}` | concept + all lexicalisations + alignment relations |
| `GET /v0/meta` | counts, epistemic-status breakdown, review-status breakdown, build timestamp |
| `GET /health` | ok flag, dataset counts, validation status |

Ids are URL-safe as path params after percent-encoding; ids use ASCII translit forms (e.g. `lex:te:mancitanam`) precisely so that paths stay portable, while display forms carry full script + diacritics.
