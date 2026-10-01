# Deploying suffeffix.com

The site is a **fully static export**. `scripts/export_site.py` replays the FastAPI app and freezes its
responses into `apps/web/.sitedata/`; `scripts/export_downloads.py` builds the dataset release (CSV, JSON,
JSON Schemas, checksums, zip); `next build` pre-renders every page into `apps/web/out/`. There is no server,
database or Python in production — any static host will do.

What is pre-rendered: the home page, the technical report, the dataset page, 338 word pages, 115 meaning
pages, 85 affix pages, 50 atom pages, 45 etymology graphs, the documentation, plus `sitemap.xml`,
`robots.txt`, a web manifest and icons (about 650 URLs).

## Build locally

```sh
pip install "pydantic>=2.7,<3" fastapi uvicorn httpx   # once
cd apps/web && pnpm install && cd ../..                 # once
make site        # export data + release, next build, then the broken-link check
npx serve apps/web/out
```

`make site` fails if the dataset does not validate, if the family constraint is violated, or if any internal
link or `#anchor` is broken.

## Cloudflare Pages (recommended)

Automatic, from this repository: `.github/workflows/deploy.yml` validates, builds and publishes on every push to
`main`.

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Direct Upload** and create a project named
   `suffeffix` (or any name; set the repository variable `CLOUDFLARE_PAGES_PROJECT`).
2. Create an API token with the **Cloudflare Pages: Edit** permission.
3. GitHub → repository → **Settings → Secrets and variables → Actions**: add secrets `CLOUDFLARE_API_TOKEN` and
   `CLOUDFLARE_ACCOUNT_ID`.
4. Push to `main` (or run the *deploy* workflow). The step is skipped, not failed, until the token exists.
5. Pages project → **Custom domains** → add `suffeffix.com` and `www.suffeffix.com`. If the domain's DNS is on
   Cloudflare the records are created for you; otherwise add a `CNAME` for `www` and an `ALIAS`/`ANAME` (or move the
   nameservers) for the apex, as the dashboard instructs. TLS certificates are issued automatically.
6. Redirect `www` to the apex (or the reverse) with a Pages *Redirect rule*, and keep the canonical host
   `https://suffeffix.com` — the site's canonical URLs, sitemap and Open Graph tags all assume it.

Security and caching headers ship with the site in `apps/web/public/_headers` (CSP, HSTS, `X-Frame-Options`,
immutable caching for hashed assets). Cloudflare Pages and Netlify read that file as-is.

## Vercel

`vercel.json` at the repository root sets the build command, output directory, trailing slashes and the same
headers. Import the repository, leave the framework preset on *Other*, add `suffeffix.com` under Domains, and follow
Vercel's DNS instructions.

## Netlify, GitHub Pages, any web server

Upload `apps/web/out/`. Netlify reads `_headers`. For nginx/Apache, replicate the headers in `_headers` and serve
`404.html` for missing paths. Always serve directories with a trailing slash (`/lexicon/`), which is what every
internal link and canonical URL uses.

## After the first deploy

- Submit `https://suffeffix.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Check a page in a social-card validator; the card image is `/og.png`.
- Run Lighthouse against production, not localhost — caching headers only apply there. Record the scores in
  `docs/LAUNCH_CHECKLIST.md`.

## Refreshing content

Data lives in `data/*.json`. After editing: `make validate && make test && make site`, then push. CI re-validates and
the deploy workflow publishes. The dataset release under `/data/` is regenerated from the same files on every build,
and its checksums are recomputed, so the page can never list a file that is not downloadable.
