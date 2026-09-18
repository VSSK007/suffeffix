"""All /v0 endpoints. Read-only; RFC 7807 on errors."""

from __future__ import annotations

from collections import Counter
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from suffeffix_core.explain import explain
from suffeffix_core.schema import (
    Affix, AffixFunction, Concept, EquivalenceClass, EtymologyEdge,
    Explanation, LexicalEntry, SemanticAtom, pretty_structure,
)
from suffeffix_core.search import search as core_search

from .. import state

router = APIRouter()


def _idx():
    return state.index


def _get_or_404(mapping: dict, key: str, what: str):
    if key not in mapping:
        raise HTTPException(404, f"{what} '{key}' not found")
    return mapping[key]


class EntrySummary(BaseModel):
    id: str
    lang: str
    form: str
    translit: str
    gloss: str
    pos: str
    register: str


def _summary(e: LexicalEntry) -> EntrySummary:
    idx = _idx()
    gloss = idx.concepts[e.concept_id].gloss if e.concept_id in idx.concepts else ""
    return EntrySummary(id=e.id, lang=e.lang, form=e.lemma.form,
                        translit=e.lemma.translit, gloss=gloss, pos=e.pos,
                        register=e.register)


class SearchResult(BaseModel):
    entry: EntrySummary
    score: int


@router.get("/search")
def search(q: str = Query(min_length=1), lang: Optional[str] = None) -> list[SearchResult]:
    return [SearchResult(entry=_summary(e), score=s)
            for e, s in core_search(_idx(), q, lang)[:25]]


class AlignedResolved(BaseModel):
    entry: EntrySummary
    relation: str


class EntryDetail(BaseModel):
    entry: LexicalEntry
    concept: Optional[Concept]
    structure_pretty: Optional[str]
    atoms: list[SemanticAtom]
    affixes: list[Affix]
    functions: list[AffixFunction]
    edges: list[EtymologyEdge]
    aligned: list[AlignedResolved]
    explanation: Explanation


@router.get("/entries/{entry_id}")
def entry_detail(entry_id: str) -> EntryDetail:
    idx = _idx()
    e: LexicalEntry = _get_or_404(idx.entries, entry_id, "entry")
    concept = idx.concepts.get(e.concept_id)
    affixes = [idx.affixes[u.affix_id] for u in e.morphology.affixes if u.affix_id in idx.affixes]
    functions = [idx.functions[u.function_id] for u in e.morphology.affixes if u.function_id in idx.functions]
    atoms = [idx.atoms[a] for a in (concept.atoms if concept else []) if a in idx.atoms]
    edges = [idx.edges[i] for i in e.etymology if i in idx.edges]
    aligned = [AlignedResolved(entry=_summary(idx.entries[a.entry_id]), relation=a.relation)
               for a in e.aligned if a.entry_id in idx.entries]
    return EntryDetail(
        entry=e, concept=concept,
        structure_pretty=pretty_structure(concept.structure) if concept else None,
        atoms=atoms, affixes=affixes, functions=functions, edges=edges,
        aligned=aligned, explanation=explain(idx, entry_id),
    )


class EntryPage(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[EntrySummary]


@router.get("/entries")
def entries(lang: Optional[str] = None, function: Optional[str] = None,
            affix: Optional[str] = None, atom: Optional[str] = None,
            register: Optional[str] = None, page: int = 1) -> EntryPage:
    idx = _idx()
    items = list(idx.entries.values())
    if lang:
        items = [e for e in items if e.lang == lang]
    if register:
        items = [e for e in items if e.register == register]
    if function:
        items = [e for e in items if any(u.function_id == function for u in e.morphology.affixes)]
    if affix:
        items = [e for e in items if any(u.affix_id == affix for u in e.morphology.affixes)]
    if atom:
        ids = set(idx.entries_by_atom.get(atom, []))
        items = [e for e in items if e.id in ids]
    items.sort(key=lambda e: e.id)
    size = 50
    start = (max(page, 1) - 1) * size
    return EntryPage(total=len(items), page=max(page, 1), page_size=size,
                     items=[_summary(e) for e in items[start:start + size]])


@router.get("/affixes")
def affixes(lang: Optional[str] = None, function: Optional[str] = None) -> list[Affix]:
    idx = _idx()
    out = list(idx.affixes.values())
    if lang:
        out = [a for a in out if a.lang == lang]
    if function:
        out = [a for a in out if function in a.functions]
    return sorted(out, key=lambda a: a.id)


class AffixDetail(BaseModel):
    affix: Affix
    functions: list[AffixFunction]
    examples: list[EntrySummary]
    equivalents: list[dict]


@router.get("/affixes/{affix_id}")
def affix_detail(affix_id: str) -> AffixDetail:
    idx = _idx()
    a: Affix = _get_or_404(idx.affixes, affix_id, "affix")
    examples = [_summary(idx.entries[i]) for i in idx.entries_by_affix.get(affix_id, [])
                if i in idx.entries][:12]
    eqv = []
    for q in a.equivalents:
        other = idx.affixes.get(q.affix_id)
        if other:
            eqv.append({"affix": other.model_dump(), "note": q.note})
    return AffixDetail(affix=a, functions=[idx.functions[f] for f in a.functions if f in idx.functions],
                       examples=examples, equivalents=eqv)


@router.get("/affix-functions")
def affix_functions() -> list[AffixFunction]:
    return sorted(_idx().functions.values(), key=lambda f: f.id)


class EqClassResolved(BaseModel):
    eq: EquivalenceClass
    function: Optional[AffixFunction]
    members: list[Affix]


@router.get("/equivalence-classes")
def equivalence_classes() -> list[EqClassResolved]:
    idx = _idx()
    return [EqClassResolved(eq=c, function=idx.functions.get(c.function_id),
                            members=[idx.affixes[m] for m in c.members if m in idx.affixes])
            for c in sorted(idx.eq_classes.values(), key=lambda c: c.id)]


@router.get("/atoms")
def atoms() -> list[SemanticAtom]:
    return sorted(_idx().atoms.values(), key=lambda a: a.id)


class AtomDetail(BaseModel):
    atom: SemanticAtom
    related: list[SemanticAtom]
    entries: list[EntrySummary]


@router.get("/atoms/{atom_id}")
def atom_detail(atom_id: str) -> AtomDetail:
    idx = _idx()
    a: SemanticAtom = _get_or_404(idx.atoms, atom_id, "atom")
    entries_ = [_summary(idx.entries[i]) for i in idx.entries_by_atom.get(atom_id, [])[:30]]
    return AtomDetail(atom=a, related=[idx.atoms[r.atom_id] for r in a.related if r.atom_id in idx.atoms],
                      entries=entries_)


class EtymologyGraph(BaseModel):
    entry_id: str
    nodes: list[dict]
    edges: list[EtymologyEdge]


@router.get("/etymology/{entry_id}")
def etymology(entry_id: str) -> EtymologyGraph:
    idx = _idx()
    _get_or_404(idx.entries, entry_id, "entry")
    nodes, edges = idx.etymology_subgraph(entry_id)
    return EtymologyGraph(entry_id=entry_id, nodes=nodes, edges=edges)


class ConceptDetail(BaseModel):
    concept: Concept
    structure_pretty: str
    atoms: list[SemanticAtom]
    entries: list[EntrySummary]


@router.get("/concepts/{concept_id}")
def concept_detail(concept_id: str) -> ConceptDetail:
    idx = _idx()
    c: Concept = _get_or_404(idx.concepts, concept_id, "concept")
    return ConceptDetail(
        concept=c, structure_pretty=pretty_structure(c.structure),
        atoms=[idx.atoms[a] for a in c.atoms if a in idx.atoms],
        entries=[_summary(idx.entries[i]) for i in idx.entries_by_concept.get(concept_id, [])],
    )


@router.get("/meta")
def meta() -> dict:
    idx = _idx()
    epi = Counter(a.epistemic_status for a in idx.affixes.values())
    epi.update(a.epistemic_status for a in idx.atoms.values())
    epi.update(f.epistemic_status for f in idx.functions.values())
    review = Counter(e.provenance.review_status for e in idx.entries.values())
    review.update(a.provenance.review_status for a in idx.affixes.values())
    review.update(e.provenance.review_status for e in idx.edges.values())
    return {
        "counts": {
            "entries": len(idx.entries),
            "entries_by_lang": dict(Counter(e.lang for e in idx.entries.values())),
            "affixes": len(idx.affixes), "affix_functions": len(idx.functions),
            "equivalence_classes": len(idx.eq_classes), "atoms": len(idx.atoms),
            "concepts": len(idx.concepts), "etymology_edges": len(idx.edges),
            "contested_edges": sum(1 for e in idx.edges.values() if e.status == "contested"),
            "roots": len(idx.roots), "sources": len(idx.sources),
        },
        "epistemic_status": dict(epi),
        "review_status": dict(review),
        "build_timestamp": state.started_at,
    }
