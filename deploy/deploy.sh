#!/usr/bin/env bash
# Publish the built site (apps/web/out) to the VPS as an atomic release.
#
#   bash deploy/deploy.sh deploy@<server>            # upload + switch
#   bash deploy/deploy.sh deploy@<server> rollback   # switch back to the previous release
#
# Each deploy uploads into a new directory under /var/www/suffeffix/releases/ and then flips the
# `current` symlink in one step, so visitors never see a half-uploaded site, and the previous
# release stays on disk (the last 5 are kept) for instant rollback.
#
# Optional environment: SSH_PORT (default 22), SSH_KEY (path to a private key), SITE_URL for the
# post-deploy check (default https://suffeffix.com).
set -euo pipefail

TARGET="${1:?usage: deploy.sh user@host [rollback]}"
MODE="${2:-deploy}"
SSH_PORT="${SSH_PORT:-22}"
SITE_URL="${SITE_URL:-https://suffeffix.com}"
WEBROOT="${WEBROOT:-/var/www/suffeffix}"
SSH_OPTS=(-p "$SSH_PORT" -o StrictHostKeyChecking=yes)
[[ -n "${SSH_KEY:-}" ]] && SSH_OPTS+=(-i "$SSH_KEY")
ssh_run() { ssh "${SSH_OPTS[@]}" "$TARGET" "$@"; }

if [[ "$MODE" == "rollback" ]]; then
  ssh_run "set -e; cd $WEBROOT/releases
    cur=\$(basename \"\$(readlink $WEBROOT/current)\")
    prev=\$(ls -1 | grep -v '^00-placeholder\$' | sort | grep -B1 -x \"\$cur\" | head -n1)
    if [ -z \"\$prev\" ] || [ \"\$prev\" = \"\$cur\" ]; then echo 'no earlier release to roll back to'; exit 1; fi
    ln -sfn $WEBROOT/releases/\$prev $WEBROOT/current
    echo \"rolled back: \$cur -> \$prev\""
  exit 0
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/../apps/web/out"
[[ -f "$OUT/index.html" ]] || { echo "no build at apps/web/out — run 'make site' first"; exit 1; }
[[ -f "$OUT/sitemap.xml" && -f "$OUT/data/manifest.json" ]] || { echo "build looks incomplete (sitemap or dataset release missing)"; exit 1; }

REL="$(date -u +%Y%m%d-%H%M%S)"
echo "==> uploading release $REL ($(du -sh "$OUT" | cut -f1))"
ssh_run "mkdir -p $WEBROOT/releases/$REL"
if command -v rsync >/dev/null 2>&1; then
  rsync -az --delete --chmod=D755,F644 -e "ssh ${SSH_OPTS[*]}" "$OUT"/ "$TARGET:$WEBROOT/releases/$REL/"
else
  # No rsync (e.g. Git Bash on Windows): stream a tar archive over ssh instead.
  echo "    (rsync not found; sending with tar over ssh)"
  tar -C "$OUT" -cf - . | ssh "${SSH_OPTS[@]}" "$TARGET" "tar -xf - --no-same-owner -C $WEBROOT/releases/$REL"
  ssh_run "find $WEBROOT/releases/$REL -type d -exec chmod 755 {} + && find $WEBROOT/releases/$REL -type f -exec chmod 644 {} +"
fi

echo "==> switching to $REL"
ssh_run "set -e
  test -f $WEBROOT/releases/$REL/index.html
  ln -sfn $WEBROOT/releases/$REL $WEBROOT/current
  cd $WEBROOT/releases && ls -1 | grep -v '^00-placeholder\$' | sort | head -n -5 | xargs -r rm -rf --"

echo "==> checking $SITE_URL"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL/" || true)"
if [[ "$code" == "200" ]]; then
  echo "live: $SITE_URL/ -> $code (release $REL)"
else
  echo "WARNING: $SITE_URL/ returned '$code' — if this is the first deploy, DNS or the certificate may not be ready."
  echo "         roll back with: bash deploy/deploy.sh $TARGET rollback"
  exit 1
fi
