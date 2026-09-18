"""Deterministic explanation engine.

Explanations are generated from the graph, not written freehand: each sentence
is assembled by a named template rule from the entry's morphology, atom
structure, and etymology edges, and carries a trace of the nodes/rules/sources
that produced it. Identical input => identical output (golden-tested).
"""

from __future__ import annotations

from .index import GraphIndex
from .schema import (
    Explanation, ExplanationSentence, LexicalEntry, TraceItem, pretty_structure,
)

_LANG_NAME = {"en": "English", "te": "Telugu", "hi": "Hindi"}
_REL_TEXT = {
    "TRANSLATION": "translation equivalent",
    "COGNATE": "cognate",
    "SHARED_LOAN": "shared loan (both borrowed from the same source)",
    "CALQUE": "calque",
}
_EDGE_TEXT = {
    "INHERITED": "inherited from",
    "COGNATE": "cognate with",
    "BORROWED": "borrowed from",
    "CALQUE": "calqued on",
    "DERIVED": "derived from",
    "COMPOUNDED": "compounded from",
    "RECONSTRUCTED": "reconstructed as",
    "REBORROWED": "re-borrowed from",
}


def _display(e: LexicalEntry) -> str:
    if e.lemma.script == "Latn":
        return e.lemma.form
    return f"{e.lemma.form} ({e.lemma.translit})"


def explain(index: GraphIndex, entry_id: str) -> Explanation:
    e = index.entries[entry_id]
    concept = index.concepts.get(e.concept_id)
    sentences: list[ExplanationSentence] = []

    # 1. Morphology
    if e.morphology.affixes:
        parts = []
        trace: list[TraceItem] = [TraceItem(kind="rule", ref="rule:morphology-chain")]
        for use in e.morphology.affixes:
            affix = index.affixes[use.affix_id]
            fn = index.functions[use.function_id]
            affix_disp = affix.form if affix.lang == "en" else f"{affix.form} ({affix.translit})"
            parts.append(f"the {affix.kind.replace('_', ' ')} {affix_disp} ({fn.label})")
            trace.append(TraceItem(kind="affix", ref=affix.id))
        joined = " and ".join(parts)
        trace.append(TraceItem(kind="rule", ref=f"rule:segmentation-confidence:{e.morphology.segmentation_confidence}"))
        sentences.append(ExplanationSentence(
            text=(f"{_display(e)} is a {_LANG_NAME[e.lang]} {e.pos} formed from the stem "
                  f"{e.morphology.stem_form} with {joined}."),
            trace=trace,
        ))
    else:
        sentences.append(ExplanationSentence(
            text=f"{_display(e)} is a {_LANG_NAME[e.lang]} {e.pos} with no productive affixal segmentation (simplex).",
            trace=[TraceItem(kind="rule", ref="rule:simplex")],
        ))

    # 2. Semantic decomposition
    if concept is not None:
        hedge = ("can be approximated as" if concept.structure_status == "HYPOTHESIS"
                 else "is represented as")
        trace = [TraceItem(kind="rule", ref="rule:atom-structure")]
        trace += [TraceItem(kind="atom", ref=a) for a in concept.atoms]
        sentences.append(ExplanationSentence(
            text=(f"Its meaning ('{concept.gloss}') {hedge} {pretty_structure(concept.structure)} "
                  f"in the Suffeffix atom interlingua."),
            trace=trace,
        ))

    # 3. Etymology (only edges directly listed on the entry, in listed order)
    for edge_id in e.etymology:
        edge = index.edges.get(edge_id)
        if edge is None:
            continue
        verb = _EDGE_TEXT[edge.type]
        drift = [d for d in edge.drift if d != "NONE"]
        drift_txt = f", with semantic {'/'.join(d.lower() for d in drift)}" if drift else ""
        contested = " [contested]" if edge.status == "contested" else ""
        trace = [TraceItem(kind="rule", ref="rule:etymology-hop"),
                 TraceItem(kind="edge", ref=edge.id, confidence=edge.confidence)]
        trace += [TraceItem(kind="source", ref=s, confidence=edge.confidence) for s in edge.source_ref]
        sentences.append(ExplanationSentence(
            text=(f"{edge.to.form} is {verb} {edge.from_.lang_or_family} {edge.from_.form}"
                  f"{' ‘' + edge.from_.gloss + '’' if edge.from_.gloss else ''}"
                  f"{drift_txt} (confidence {edge.confidence:.2f}){contested}."),
            trace=trace,
        ))

    # 4. Alignment
    if e.aligned:
        parts = []
        trace = [TraceItem(kind="rule", ref="rule:alignment")]
        for al in sorted(e.aligned, key=lambda a: a.entry_id):
            other = index.entries.get(al.entry_id)
            if other is None:
                continue
            parts.append(f"{_LANG_NAME[other.lang]} {_display(other)} ({_REL_TEXT[al.relation]})")
        if parts:
            sentences.append(ExplanationSentence(
                text="Aligned forms: " + "; ".join(parts) + ".",
                trace=trace,
            ))

    return Explanation(entry_id=entry_id, sentences=sentences)
