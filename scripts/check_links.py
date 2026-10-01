"""Crawl the built static site and fail on broken internal links or anchors.

Checks every <a href>, <link href>, <img src> and <script src> that points at
the same origin: the target file must exist in apps/web/out, and a #fragment
must match an id in the target page. External links are not fetched.

    python scripts/check_links.py [out_dir]
"""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urldefrag, urlparse

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "apps" / "web" / "out"
ORIGIN = "https://suffeffix.com"


class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("name"):
            self.ids.add(a["name"])
        for key in ("href", "src"):
            v = a.get(key)
            if v and tag in ("a", "link", "img", "script", "source"):
                if tag == "link" and a.get("rel") in ("canonical", "alternate", "preconnect", "dns-prefetch"):
                    continue
                self.links.append(v)


def resolve(url: str, page: Path) -> Path | None:
    u = urlparse(url)
    if u.scheme in ("mailto", "tel", "javascript", "data", "blob"):
        return None
    if u.scheme in ("http", "https"):
        if f"{u.scheme}://{u.netloc}" != ORIGIN:
            return None  # external
        path = unquote(u.path)
    elif url.startswith("//"):
        return None
    elif url.startswith("#") or not u.path:
        return page
    elif u.path.startswith("/"):
        path = unquote(u.path)
    else:
        path = unquote((Path("/" + page.parent.relative_to(OUT).as_posix()) / u.path).as_posix())
    target = OUT / path.lstrip("/")
    if target.is_dir():
        target = target / "index.html"
    return target


def main() -> int:
    if not OUT.exists():
        print(f"no build at {OUT}; run `pnpm build` first")
        return 2
    pages: dict[Path, Page] = {}
    for f in OUT.rglob("*.html"):
        p = Page()
        p.feed(f.read_text(encoding="utf-8", errors="replace"))
        pages[f] = p

    broken: list[str] = []
    checked = 0
    for f, p in pages.items():
        for link in p.links:
            href, frag = urldefrag(link)
            target = resolve(link, f)
            if target is None:
                continue
            checked += 1
            if not target.exists():
                # allow extension-less route files
                alt = target.with_suffix(".html") if target.suffix == "" else None
                if not (alt and alt.exists()):
                    broken.append(f"{f.relative_to(OUT)}: {link} -> missing {target.relative_to(OUT)}")
                    continue
                target = alt
            if frag and target.suffix == ".html":
                tp = pages.get(target)
                if tp is not None and unquote(frag) not in tp.ids:
                    broken.append(f"{f.relative_to(OUT)}: {link} -> no #{frag} in {target.relative_to(OUT)}")
    print(f"checked {checked} internal links across {len(pages)} pages")
    if broken:
        uniq = sorted(set(broken))
        print(f"{len(uniq)} BROKEN:")
        for b in uniq[:80]:
            print("  ", b)
        return 1
    print("no broken internal links")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
