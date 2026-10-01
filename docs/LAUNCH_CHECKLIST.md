# Launch checklist — v0.1

Verified items say how they were verified. Anything unchecked is a real to-do, not an omission.

## Data and research integrity

- [x] `make validate` passes; counts within limits and shown honestly on `/` (338 words, 115 meanings, 85 affixes, 50 atoms, 70 edges).
- [x] Every etymology edge has a source in the bibliography; Wiktionary-only edges ≤ 0.6 (validator-enforced).
- [x] Contested items are badged wherever they appear (6 of 70 edges).
- [x] The family constraint is tested with deliberately malformed edges, and re-asserted when the report figures are built.
- [x] "Semantic atoms are an engineering interlingua, not a theory of human cognition." appears in the UI (`/atoms/`, `/about/`) and in `docs/SEMANTICS.md`.
- [x] The report and dataset page state that the meanings are a *selection*, that every record is a draft, and that CDIAL/DEDR entry numbers are absent.
- [ ] Expert review of any record (`draft` → `reviewed`). None has happened; see `docs/ROADMAP.md`.

## Build and release

- [x] 29 automated tests pass (`make test`). CI runs validate, tests, the prohibited-feature grep, typecheck, build, the link check and checksum verification.
- [x] `next build` succeeds; about 650 static pages are generated.
- [x] `scripts/check_links.py`: 29,480 internal links across 656 pages, none broken.
- [x] The dataset release (CSV, JSON, JSON Schemas, zip) is regenerated on every build with SHA-256 checksums; all verified.
- [x] No prohibited features: the grep for `openai|anthropic|embedding|vector|auth|stripe|langchain` in code and data is clean.
- [x] `CITATION.cff`, `LICENSE` (Apache-2.0) and `data/LICENSE` (CC BY-SA 4.0) are present.

## Quality (Lighthouse, headless Edge, simulated mobile throttling, local static build)

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/data/` | 100 | 100 | 100 | 100 |
| `/research/suffeffix-v0-1/` | 96 | 100 | 100 | 100 |
| `/lexicon/` | 95 | 100 | 100 | 100 |
| `/about/` | 84 | 100 | 100 | 100 |
| `/affixes/` | 74 | 100 | 100 | 100 |
| `/` | 71 | 100 | 100 | 100 |
| `/etymology/en/sugar/` | 71 | 100 | 100 | 100 |
| `/lexicon/te/mancitanam/` | 70 | 100 | 100 | 100 |

Performance varied by up to 25 points between runs of the same page, so treat it as a range, not a score.

- [x] Accessibility ≥ 90: 100 on every page measured, after fixing two real findings (chart marks missing a role; a dimmed chip below contrast).
- [ ] Performance on pages whose content is largely Hindi or Telugu is about 70 under simulated slow 4G. The cause is the two Indic font files (~390 KB), which load only on pages that show that text. Glyph subsetting was measured and rejected (`docs/DECISIONS.md`, entry 12). The localhost run also overstates the cost, because fonts arrive before first paint. **Re-measure on production**, with real-user data, before optimising further.
- [ ] Telugu and Devanagari render correctly on a physical phone. Verified in headless Edge at 390 px (conjuncts form correctly), not on a device.
- [x] Light and dark themes both reviewed in screenshots.
- [ ] Interactive behaviour (hover readouts, the search palette, the theme toggle, table views) exercised in a real browser. It is implemented and compiled, not clicked through.

## Deploy (IONOS VPS; see `docs/DEPLOY.md`)

- [x] Release / prune / rollback logic exercised locally against a fake server (7 deploys keep 5; rollback edge cases); both shell scripts pass `bash -n`.
- [ ] `nginx -t` and `deploy/setup-server.sh` run on the real server. They are written but **not yet run** against one.
- [ ] DNS `A` (and `AAAA` only if IPv6 works) records for `suffeffix.com` and `www` point at the VPS; IONOS firewall policy allows 22, 80 and 443.
- [ ] Certificate issued; `certbot renew --dry-run` succeeds.
- [ ] GitHub secrets `VPS_HOST`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS` added; the first deploy ran and the live check returned 200.
- [ ] Production headers confirmed with `curl -I` (HSTS, CSP), including the `http`→`https` and `www`→apex redirects.
- [ ] SSH password logins disabled after key login is confirmed.
- [ ] `sitemap.xml` submitted to Search Console and Bing; social card checked.
- [ ] Lighthouse re-run against production and recorded above.
