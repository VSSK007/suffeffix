"""Dataset validation — research-integrity and referential rules.

Run via scripts/validate.py; CI fails on any error.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from .schema import Dataset

_ID_PATTERNS = {
    "atom": re.compile(r"^atom:[A-Z_]+$"),
    "fn": re.compile(r"^fn:[A-Z]+$"),
    "eq": re.compile(r"^eq:[A-Z]+$"),
    "affix": re.compile(r"^affix:(en|te|hi):\S+$"),
    "concept": re.compile(r"^concept:[A-Z_]+$"),
    "lex": re.compile(r"^lex:(en|te|hi):[a-z0-9\-']+$"),
    "root": re.compile(r"^root:[a-z]+:\S+$"),
    "edge": re.compile(r"^edge:[a-z0-9\-:]+$"),
}


def top_family(family: str) -> str:
    return family.split(":", 1)[0]


def source_key(ref: str) -> str:
    """`source_ref` may carry a locator after ':' (e.g. 'cdial:1234');
    the part before ':' must be a sources.json id."""
    return ref.split(":", 1)[0].strip().lower()


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.errors

    def err(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)


def validate_dataset(ds: Dataset) -> Report:  # noqa: C901
    r = Report()
    atoms = {a.id for a in ds.atoms}
    fns = {f.id for f in ds.affix_functions}
    eqs = {e.id for e in ds.equivalence_classes}
    affixes = {a.id: a for a in ds.affixes}
    concepts = {c.id for c in ds.concepts}
    entries = {e.id: e for e in ds.entries}
    roots = {x.id for x in ds.roots}
    edges = {e.id for e in ds.etymology_edges}
    sources = {s.id for s in ds.sources}

    # --- id patterns ---
    for coll, pat_key in [(ds.atoms, "atom"), (ds.affix_functions, "fn"),
                          (ds.equivalence_classes, "eq"), (ds.affixes, "affix"),
                          (ds.concepts, "concept"), (ds.entries, "lex"),
                          (ds.roots, "root"), (ds.etymology_edges, "edge")]:
        for obj in coll:
            if not _ID_PATTERNS[pat_key].match(obj.id):
                r.err(f"id pattern violation ({pat_key}): {obj.id!r}")

    # --- dataset limits (spec §1.2) ---
    if not (300 <= len(ds.entries) <= 500):
        r.err(f"entry count {len(ds.entries)} outside 300–500")
    if not (30 <= len(ds.atoms) <= 50):
        r.err(f"atom count {len(ds.atoms)} outside 30–50")
    if not (20 <= len(ds.affix_functions) <= 30):
        r.err(f"affix-function count {len(ds.affix_functions)} outside 20–30")

    # --- languages ---
    langs = {e.lang for e in ds.entries} | {a.lang for a in ds.affixes}
    bad = langs - {"en", "te", "hi"}
    if bad:
        r.err(f"prohibited languages present: {bad}")

    # --- atoms ---
    for a in ds.atoms:
        for rel in a.related:
            if rel.atom_id not in atoms:
                r.err(f"{a.id}: related atom {rel.atom_id} unresolved")

    # --- functions & equivalence classes ---
    for f in ds.affix_functions:
        if f.equivalence_class_id and f.equivalence_class_id not in eqs:
            r.err(f"{f.id}: equivalence class {f.equivalence_class_id} unresolved")
    for eq in ds.equivalence_classes:
        if eq.function_id not in fns:
            r.err(f"{eq.id}: function {eq.function_id} unresolved")
        for m in eq.members:
            if m not in affixes:
                r.err(f"{eq.id}: member affix {m} unresolved")

    # --- affixes ---
    for a in ds.affixes:
        for fn in a.functions:
            if fn not in fns:
                r.err(f"{a.id}: function {fn} unresolved")
        for ex in a.examples:
            if ex not in entries:
                r.err(f"{a.id}: example entry {ex} unresolved")
        for eqv in a.equivalents:
            if eqv.affix_id not in affixes:
                r.err(f"{a.id}: equivalent affix {eqv.affix_id} unresolved")
        for sref in a.provenance.source_refs:
            if source_key(sref) not in sources:
                r.err(f"{a.id}: source_ref {sref} not in sources.json")

    # --- concepts ---
    concept_langs: dict[str, set[str]] = {c.id: set() for c in ds.concepts}
    for e in ds.entries:
        if e.concept_id in concept_langs:
            concept_langs[e.concept_id].add(e.lang)
    for c in ds.concepts:
        for aid in c.atoms:
            if aid not in atoms:
                r.err(f"{c.id}: atom {aid} unresolved")
        covered = concept_langs[c.id]
        if not covered:
            r.err(f"{c.id}: referenced by no entries")
        elif covered != {"en", "te", "hi"} and not c.partial_coverage:
            r.err(f"{c.id}: covers only {sorted(covered)} but partial_coverage is false")

    # --- entries ---
    for e in ds.entries:
        if e.concept_id not in concepts:
            r.err(f"{e.id}: concept {e.concept_id} unresolved")
        for use in e.morphology.affixes:
            affix = affixes.get(use.affix_id)
            if affix is None:
                r.err(f"{e.id}: affix {use.affix_id} unresolved")
            elif use.function_id not in affix.functions:
                r.err(f"{e.id}: function {use.function_id} not among {use.affix_id}'s declared functions")
            elif affix.lang != e.lang:
                r.err(f"{e.id}: affix {use.affix_id} is {affix.lang}, entry is {e.lang}")
        sr = e.morphology.stem_ref
        if sr is not None and sr not in entries and sr not in roots:
            r.err(f"{e.id}: stem_ref {sr} unresolved")
        for edge_id in e.etymology:
            if edge_id not in edges:
                r.err(f"{e.id}: etymology edge {edge_id} unresolved")
        for al in e.aligned:
            if al.entry_id not in entries:
                r.err(f"{e.id}: aligned entry {al.entry_id} unresolved")

    # --- roots ---
    for root in ds.roots:
        if source_key(root.source_ref) not in sources:
            r.err(f"{root.id}: source_ref {root.source_ref} not in sources.json")

    # --- etymology edges ---
    for edge in ds.etymology_edges:
        if not edge.source_ref:
            r.err(f"{edge.id}: missing source_ref")
        for sref in edge.source_ref:
            if source_key(sref) not in sources:
                r.err(f"{edge.id}: source_ref {sref} not in sources.json")
        # family constraint: no cognates/inheritance across top-level families.
        # Reconstructed:PIE counts as IE; Reconstructed:Proto-Dravidian as Dravidian.
        if edge.type in ("COGNATE", "INHERITED"):
            def norm(fam: str) -> str:
                if fam == "Reconstructed:PIE":
                    return "IE"
                if fam == "Reconstructed:Proto-Dravidian":
                    return "Dravidian"
                return top_family(fam)
            if norm(edge.from_.family) != norm(edge.to.family):
                r.err(f"{edge.id}: {edge.type} edge crosses family boundary "
                      f"({edge.from_.family} vs {edge.to.family}) — forbidden")
        # Wiktionary-only cap
        if edge.source_ref and all(s.startswith("wiktionary") for s in edge.source_ref):
            if edge.confidence > 0.6:
                r.err(f"{edge.id}: Wiktionary-only edge has confidence {edge.confidence} > 0.6")
        for n in (edge.from_, edge.to):
            if n.node_ref is not None and n.node_ref not in entries and n.node_ref not in roots:
                r.err(f"{edge.id}: node_ref {n.node_ref} unresolved")

    return r
