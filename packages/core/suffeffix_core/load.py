"""Load the JSON dataset from data/ into typed models."""

from __future__ import annotations

import json
from pathlib import Path

from .schema import Dataset


def _read(path: Path) -> list:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def find_data_dir(start: Path | None = None) -> Path:
    """Walk upward from `start` (or this file) to find the repo's data/ dir."""
    here = start or Path(__file__).resolve()
    for parent in [here, *here.parents]:
        candidate = parent / "data"
        if (candidate / "atoms.json").exists():
            return candidate
    raise FileNotFoundError("Could not locate data/ directory with atoms.json")


def load_dataset(data_dir: Path | None = None) -> Dataset:
    d = data_dir or find_data_dir()
    return Dataset(
        atoms=_read(d / "atoms.json"),
        affix_functions=_read(d / "affix_functions.json"),
        equivalence_classes=_read(d / "equivalence_classes.json"),
        affixes=[a for lang in ("en", "te", "hi") for a in _read(d / "affixes" / f"{lang}.json")],
        concepts=_read(d / "concepts.json"),
        entries=[e for lang in ("en", "te", "hi") for e in _read(d / "entries" / f"{lang}.json")],
        roots=_read(d / "roots.json"),
        etymology_edges=_read(d / "etymology_edges.json"),
        sources=_read(d / "sources.json"),
    )
