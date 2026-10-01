# Deploying suffeffix.com on an IONOS VPS

The site is a **fully static export**: plain HTML, CSS, JS and downloadable data files. There is no application server,
database or Python in production. The VPS only needs **nginx** to serve a folder, plus a free Let's Encrypt certificate.

```
GitHub push ─► CI builds the site ─► rsync over SSH ─► /var/www/suffeffix/releases/<timestamp>/
                                                    └► `current` symlink flips ─► nginx serves it
```

Each deploy goes into a fresh release directory and the `current` symlink flips in one step, so visitors never see a
half-uploaded site. The last five releases stay on disk, so rollback is instant.

> **Status.** The scripts are syntax-checked, and the release / prune / rollback logic was exercised locally against a
> fake server, but the nginx configuration and `setup-server.sh` have **not been run against a real server**. Setup
> runs `nginx -t` before every reload, so a mistake cannot take a running site down, but expect to fix small things on
> the first real run.

## What is on the server afterwards

| Path | Purpose |
|---|---|
| `/etc/nginx/sites-available/suffeffix.conf` | the site (from `deploy/nginx/suffeffix.conf`) |
| `/etc/nginx/snippets/suffeffix-security-headers.conf` | CSP, HSTS and the other security headers |
| `/var/www/suffeffix/releases/…` | uploaded builds; `current` points at the live one |
| `/etc/letsencrypt/` | certificate, renewed automatically by certbot's systemd timer |
| user `deploy` | key-only SSH user that owns the web root and has no sudo rights |

nginx handles: HTTP → HTTPS, `www` → `suffeffix.com`, TLS 1.2/1.3, gzip, immutable caching for hashed assets,
open CORS and a one-hour cache for `/data/` downloads, the custom 404 page, and no dotfiles.

## One-time setup

Assumes **Ubuntu 22.04 or 24.04** (or Debian) with root SSH access, which is what IONOS provisions by default.

### 1. Point the domain at the server (IONOS DNS)

IONOS → **Domains & SSL** → your domain → **DNS**:

- `A` record, host `@` (the bare domain) → the VPS's **IPv4** address.
- `A` record, host `www` → the same IPv4 address (or a `CNAME` for `www` → `suffeffix.com`).
- Add `AAAA` records with the VPS's **IPv6** address *only if* the server really has working IPv6 — a wrong `AAAA`
  record sends IPv6 visitors to a dead end.
- Delete any default parking or "website builder" `A`/`AAAA` records IONOS created for the domain.

Check propagation before continuing: `nslookup suffeffix.com` and `nslookup www.suffeffix.com` should both show your IP.

### 2. Open the ports in the IONOS firewall

In the IONOS **Cloud Panel** → your server → **Network → Firewall Policies**, make sure the policy attached to the server
allows inbound **22 (SSH), 80 (HTTP) and 443 (HTTPS)**. The setup script also enables the server's own `ufw` firewall
with the same three ports, but a restrictive Cloud Panel policy would block traffic before it reaches the server.

### 3. Make a deploy key (on your computer)

```sh
ssh-keygen -t ed25519 -f ~/.ssh/suffeffix_deploy -C suffeffix-deploy   # no passphrase if CI will use it
```

Keep the **private** key (`suffeffix_deploy`) secret; the **public** key (`suffeffix_deploy.pub`) goes to the server.

### 4. Provision the server

```sh
ssh root@YOUR_SERVER_IP
git clone https://github.com/VSSK007/suffeffix.git && cd suffeffix
sudo DEPLOY_PUBKEY="ssh-ed25519 AAAA... suffeffix-deploy" CERT_EMAIL="you@example.com" bash deploy/setup-server.sh
```

Replace the `DEPLOY_PUBKEY` value with the single line inside `suffeffix_deploy.pub`.

The script installs nginx, certbot, ufw and rsync; creates the `deploy` user; sets up the web root; opens the firewall;
obtains the certificate with an HTTP challenge; installs the final HTTPS config and a renewal hook. It is safe to re-run.

### 5. Trust the server's host key, and test the login

From your computer (this also records the server's key so later connections cannot be silently redirected):

```sh
ssh -i ~/.ssh/suffeffix_deploy deploy@YOUR_SERVER_IP    # answer "yes", then `exit`
ssh-keyscan YOUR_SERVER_IP                              # copy this output for step 6
```

## Deploying

### Automatic (recommended): GitHub Actions

`.github/workflows/deploy-vps.yml` validates the dataset, builds the site, checks every link and uploads it to the server
on every push to `main`. In GitHub → repository → **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `VPS_HOST` | the server's IP address or hostname |
| `VPS_SSH_KEY` | the contents of the **private** key `suffeffix_deploy` |
| `VPS_KNOWN_HOSTS` | the output of `ssh-keyscan YOUR_SERVER_IP` from step 5 |
| `VPS_USER` *(optional)* | defaults to `deploy` |
| `VPS_PORT` *(optional)* | defaults to `22` |

Until `VPS_HOST` and `VPS_SSH_KEY` exist the deploy step is skipped rather than failed. Then push to `main`, or run the
**deploy-vps** workflow by hand from the Actions tab.

### Manual

Needs `rsync` on your machine (macOS/Linux have it; on Windows use WSL):

```sh
make deploy HOST=deploy@YOUR_SERVER_IP      # builds, uploads, flips the symlink, checks the site
```

### Roll back

Switches `current` to the previous release; needs only `ssh`:

```sh
bash deploy/deploy.sh deploy@YOUR_SERVER_IP rollback
```

## After the first deploy

```sh
curl -I https://suffeffix.com/            # 200, with Strict-Transport-Security and Content-Security-Policy
curl -I http://suffeffix.com/             # 301 to https://suffeffix.com/
curl -I https://www.suffeffix.com/        # 301 to https://suffeffix.com/
curl -I https://suffeffix.com/data/suffeffix-v0.2.0.zip   # 200, Access-Control-Allow-Origin: *
curl -I https://suffeffix.com/nope/       # 404
```

Then:

- On the server: `sudo certbot renew --dry-run` (renewal works) and `systemctl list-timers | grep certbot` (it is scheduled).
- Submit `https://suffeffix.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Run Lighthouse against production and record the scores in `docs/LAUNCH_CHECKLIST.md`.
- Once key login works, turn off SSH password logins: set `PasswordAuthentication no` in `/etc/ssh/sshd_config`, then
  `sudo systemctl reload ssh`. Keep a second terminal open while you do it, in case you lock yourself out.
- Consider `sudo apt install unattended-upgrades` so security updates install themselves, and a free uptime monitor.

## Build locally

```sh
pip install "pydantic>=2.7,<3" fastapi uvicorn httpx   # once
cd apps/web && pnpm install && cd ../..                 # once
make site                                               # export data, build, check links
make preview                                            # http://localhost:3000, behaves like the nginx config
```

`make site` fails if the dataset does not validate, if the family constraint is violated, or if any internal link or
`#anchor` is broken.

## Updating content

Data lives in `data/*.json`. After editing: `make validate && make test && make site`, then push. CI re-validates and the
workflow deploys. The dataset release under `/data/` is rebuilt from the same files on every build, with fresh checksums,
so the page can never list a file that is not downloadable.

## Other hosts

Nothing here is specific to IONOS. Any static host works if you upload `apps/web/out/`, serve directories with a trailing
slash (`/lexicon/`, which is what every canonical URL uses), serve `404.html` for missing paths, and send the headers in
`deploy/nginx/security-headers.conf`. Netlify, Vercel, Cloudflare Pages and GitHub Pages are all fine; this repository
no longer ships configuration for them.
