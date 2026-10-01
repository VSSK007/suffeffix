"""Guard the wordmark's spelling: the live-text wordmark must read exactly "suffeffix"
(two "ff" pairs, four f's). It is split into spans so each "ff" can be joined, which
makes a typo easy to introduce and hard to see.
"""

import re
import sys
from pathlib import Path

src = (Path(__file__).resolve().parents[1] / "apps" / "web" / "components" / "wordmark.tsx").read_text(encoding="utf-8")
m = re.search(r'aria-hidden="true">\s*(.*?)\s*</span>\s*\);', src, re.S)
if not m:
    sys.exit("could not find the wordmark text in wordmark.tsx")
text = re.sub(r"<[^>]+>", "", m.group(1)).strip()
if text != "suffeffix":
    sys.exit(f'wordmark reads "{text}", expected "suffeffix"')
print('wordmark spelling OK: "suffeffix"')
