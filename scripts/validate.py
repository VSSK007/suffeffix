"""CLI wrapper over suffeffix_core.validate — exits nonzero on any error."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "packages" / "core"))

from suffeffix_core.load import load_dataset  # noqa: E402
from suffeffix_core.validate import validate_dataset  # noqa: E402


def main() -> int:
    ds = load_dataset()
    report = validate_dataset(ds)
    for w in report.warnings:
        print(f"WARN  {w}")
    for e in report.errors:
        print(f"ERROR {e}")
    print(f"\nentries={len(ds.entries)} atoms={len(ds.atoms)} "
          f"functions={len(ds.affix_functions)} affixes={len(ds.affixes)} "
          f"concepts={len(ds.concepts)} edges={len(ds.etymology_edges)} "
          f"roots={len(ds.roots)} sources={len(ds.sources)}")
    if report.ok:
        print("VALIDATION OK")
        return 0
    print(f"VALIDATION FAILED ({len(report.errors)} errors)")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
