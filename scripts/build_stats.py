"""Print honest dataset counts (used for the landing page and README)."""

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "packages" / "core"))

from suffeffix_core.load import load_dataset  # noqa: E402

ds = load_dataset()
print(f"entries: {len(ds.entries)} ({dict(Counter(e.lang for e in ds.entries))})")
print(f"atoms: {len(ds.atoms)}  functions: {len(ds.affix_functions)}  affixes: {len(ds.affixes)}")
print(f"concepts: {len(ds.concepts)}  edges: {len(ds.etymology_edges)} "
      f"(contested: {sum(1 for e in ds.etymology_edges if e.status == 'contested')})")
print(f"review: {dict(Counter(e.provenance.review_status for e in ds.entries))}")
