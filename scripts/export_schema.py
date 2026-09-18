"""Export JSON Schema for the main models into docs/schema/*.json."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "core"))

from suffeffix_core.schema import (  # noqa: E402
    Affix, AffixFunction, Concept, EquivalenceClass, EtymologyEdge,
    Explanation, LexicalEntry, Root, SemanticAtom, Source,
)

MODELS = {
    "semantic_atom": SemanticAtom, "affix_function": AffixFunction,
    "equivalence_class": EquivalenceClass, "affix": Affix, "concept": Concept,
    "lexical_entry": LexicalEntry, "root": Root, "etymology_edge": EtymologyEdge,
    "source": Source, "explanation": Explanation,
}

out = ROOT / "docs" / "schema"
out.mkdir(parents=True, exist_ok=True)
for name, model in MODELS.items():
    (out / f"{name}.json").write_text(
        json.dumps(model.model_json_schema(), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
print(f"exported {len(MODELS)} schemas to docs/schema/")
