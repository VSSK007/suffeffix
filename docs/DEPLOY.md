# Deploying suffeffix.com

The site is a **fully static export**: `scripts/export_site.py` replays the FastAPI app
and freezes its responses into `apps/web/.sitedata/`, and `next build` pre-renders every
page (338 entries, 85 affixes, 50 atoms, 45 etymology graphs, docs) into `apps/web/out/`.
No server, no database, no Python in production — any static host serves it.

## Build

```sh
pip install "pydantic>=2.7,<3" fastapi uvicorn httpx      # once
make site         # = export_site.py + pnpm build  → apps/web/out/
```

## Host options (pick one)

**Cloudflare Pages** (recommended: free, fast, easy custom domains)
1. Push the repo to GitHub, then Cloudflare Dashboard → Workers & Pages → Create → Pages → connect the repo.
2. Build command: `pip install "pydantic>=2.7,<3" fastapi uvicorn httpx && python scripts/export_site.py && cd apps/web && npx pnpm install && npx pnpm build`
   · Build output directory: `apps/web/out` · Root directory: `/` · Python 3.12 + Node 22 via `PYTHON_VERSION`/`NODE_VERSION` env vars.
3. Custom domains → add `suffeffix.com` and `www.suffeffix.com`. If the domain's DNS is on Cloudflare, records are added automatically; otherwise point a `CNAME` at `<project>.pages.dev`.

**Vercel**: framework Next.js, root `apps/web`, but run `python scripts/export_site.py` in a preceding install step (Vercel images include Python 3), output detected automatically from `output: "export"`. Add both domains under Project → Domains and follow its DNS instructions (A `76.76.21.21` / CNAME `cname.vercel-dns.com`).

**Netlify / GitHub Pages / any web server**: upload `apps/web/out/` as-is. For GitHub Pages, publish `out/` and set `suffeffix.com` as the custom domain with a `CNAME` file.

DNS at your registrar: apex `A`/`ALIAS` per the host's docs, `www` CNAME to the host, and let the host issue the TLS certificate (all three do it automatically).

## Refreshing content

Data lives in `data/*.json`. After editing: `make validate && make test && make site`, then push —
the host rebuilds and the site updates. The API (`make api`) remains available for local exploration
and future dynamic deployments; the static export is generated from its exact response shapes.
