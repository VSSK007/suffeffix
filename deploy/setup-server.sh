#!/usr/bin/env bash
# One-time provisioning of an Ubuntu/Debian VPS (tested target: IONOS VPS, Ubuntu 22.04/24.04)
# to serve suffeffix.com as static files behind nginx with a Let's Encrypt certificate.
#
# Run as root ON THE SERVER, from a checkout of this repository:
#
#   git clone https://github.com/VSSK007/suffeffix.git && cd suffeffix
#   sudo DEPLOY_PUBKEY="ssh-ed25519 AAAA... you@laptop" CERT_EMAIL="you@example.com" bash deploy/setup-server.sh
#
# Before running: DNS A (and AAAA, if the VPS has IPv6) records for suffeffix.com and
# www.suffeffix.com must already point at this server, or certificate issuance fails.
# Safe to re-run: every step is idempotent, and nginx config is tested before every reload.
#
# SHARED SERVER: if this machine already hosts other sites, add SHARED_SERVER=1. It then
#   - aborts unless nginx is already the web server on port 80 (so it cannot fight Apache/Docker),
#   - does not touch the firewall (ufw), and
#   - does not remove nginx's default site.
# Only suffeffix's own files are written: /etc/nginx/sites-available/suffeffix.conf, the suffeffix
# security-headers snippet, /var/www/suffeffix, /var/www/certbot and the deploy user.
set -euo pipefail
SHARED="${SHARED_SERVER:-0}"

DOMAIN="suffeffix.com"
WEBROOT="/var/www/suffeffix"
DEPLOY_USER="deploy"
: "${DEPLOY_PUBKEY:?set DEPLOY_PUBKEY to the public SSH key that will be allowed to deploy}"
: "${CERT_EMAIL:?set CERT_EMAIL to the email address the certificate authority should use for expiry notices}"

[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$SHARED" == "1" ]]; then
  echo "==> shared-server mode: checking that nginx owns port 80"
  command -v nginx >/dev/null || { echo "nginx is not installed; refusing in shared-server mode"; exit 1; }
  systemctl is-active --quiet nginx || { echo "nginx is not running; refusing in shared-server mode"; exit 1; }
  nginx -t || { echo "the existing nginx config does not pass nginx -t; fix that first"; exit 1; }
fi

echo "==> packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot ufw rsync curl

echo "==> deploy user ($DEPLOY_USER): key-only, owns the web root, no shell privileges"
id "$DEPLOY_USER" &>/dev/null || adduser --disabled-password --gecos "" "$DEPLOY_USER"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
AUTH="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH"
grep -qxF "$DEPLOY_PUBKEY" "$AUTH" || echo "$DEPLOY_PUBKEY" >> "$AUTH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"; chmod 600 "$AUTH"

echo "==> web root"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$WEBROOT" "$WEBROOT/releases"
install -d /var/www/certbot
# a placeholder so nginx can start before the first deploy
if [[ ! -e "$WEBROOT/current" ]]; then
  install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$WEBROOT/releases/00-placeholder"
  echo "<!doctype html><title>suffeffix.com</title><p>Deploying soon.</p>" > "$WEBROOT/releases/00-placeholder/index.html"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$WEBROOT/releases/00-placeholder/index.html"
  ln -sfn "$WEBROOT/releases/00-placeholder" "$WEBROOT/current"
  chown -h "$DEPLOY_USER:$DEPLOY_USER" "$WEBROOT/current"
fi

if [[ "$SHARED" == "1" ]]; then
  echo "==> firewall: left untouched (shared server). Ports 22, 80 and 443 must already be open."
else
  echo "==> firewall (ssh + web only)"
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
fi

echo "==> nginx: bootstrap (HTTP) config, to obtain the certificate"
install -m 644 "$HERE/nginx/security-headers.conf" /etc/nginx/snippets/suffeffix-security-headers.conf
install -m 644 "$HERE/nginx/bootstrap.conf" /etc/nginx/sites-available/suffeffix.conf
ln -sfn /etc/nginx/sites-available/suffeffix.conf /etc/nginx/sites-enabled/suffeffix.conf
[[ "$SHARED" == "1" ]] || rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "==> certificate"
if [[ ! -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
  certbot certonly --webroot -w /var/www/certbot \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --email "$CERT_EMAIL" --agree-tos --no-eff-email --non-interactive
fi
# renew automatically (certbot installs a systemd timer); reload nginx after each renewal
install -d /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nnginx -t && systemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo "==> nginx: final HTTPS config"
install -m 644 "$HERE/nginx/suffeffix.conf" /etc/nginx/sites-available/suffeffix.conf
nginx -t
systemctl reload nginx

echo
echo "Done. Next, from your laptop or CI:  bash deploy/deploy.sh $DEPLOY_USER@<this-server>"
echo "Then check:  curl -I https://$DOMAIN/"
