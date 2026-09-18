"""Suffeffix data schemas (Pydantic v2).

Suffeffix is an explainable lexical knowledge graph that jointly represents
morphology, semantic decomposition, etymology, and affix alignment.
Every content object carries an epistemic status and provenance.
"""

from .models import (
    Affix,
    AffixFunction,
    AffixUse,
    AlignedForm,
    AtomExponents,
    AtomRelation,
    AtomStructure,
    Concept,
    Dataset,
    EpistemicStatus,
    EquivalenceClass,
    EtymologyEdge,
    EtymNode,
    Explanation,
    ExplanationSentence,
    Family,
    Lang,
    Lemma,
    LexicalEntry,
    Morphology,
    Provenance,
    Register,
    ReviewStatus,
    Root,
    SemanticAtom,
    Source,
    TraceItem,
    pretty_structure,
)

__all__ = [
    "Affix", "AffixFunction", "AffixUse", "AlignedForm", "AtomExponents",
    "AtomRelation", "AtomStructure", "Concept", "Dataset", "EpistemicStatus",
    "EquivalenceClass", "EtymologyEdge", "EtymNode", "Explanation",
    "ExplanationSentence", "Family", "Lang", "Lemma", "LexicalEntry",
    "Morphology", "Provenance", "Register", "ReviewStatus", "Root",
    "SemanticAtom", "Source", "TraceItem", "pretty_structure",
]
