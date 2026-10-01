"""Typed models for the Suffeffix lexical knowledge graph.

Epistemic discipline: every content object carries `epistemic_status`
(ESTABLISHED = citable standard knowledge; ENGINEERING = implementation
abstraction, not a linguistic claim; HYPOTHESIS = plausible, untested;
FUTURE = out of scope) and `Provenance` with a review status.
"""

from __future__ import annotations

from typing import Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field

# --- Enums (Literals designed to grow; fr/ta are v0.2, see docs/ROADMAP.md) ---

# T.H.E.F.T.: Telugu, Hindi, English, French, Tamil (v0.2). Two families:
# Indo-European (en, fr, hi) and Dravidian (te, ta).
Lang = Literal["en", "fr", "hi", "te", "ta"]

Family = Literal[
    "IE:Germanic", "IE:Indo-Aryan", "IE:Romance", "IE:Iranian",
    "Dravidian:South-Central", "Dravidian:South",
    "Semitic", "Reconstructed:PIE", "Reconstructed:Proto-Dravidian", "Other",
]

# Register: N native/inherited (tadbhava; French mots populaires), S Sanskritic/tatsama,
# P Perso-Arabic, E English loan, L learned Latin/Greek stratum (English and French
# mots savants — the European counterpart of tatsama), mixed.
Register = Literal["N", "S", "P", "E", "L", "mixed"]

EpistemicStatus = Literal["ESTABLISHED", "ENGINEERING", "HYPOTHESIS", "FUTURE"]
ReviewStatus = Literal["draft", "reviewed", "published"]

AtomCategory = Literal["FOUNDATIONAL", "RELATIONAL", "ACTION", "STATE", "EMOTIONAL", "SOCIAL"]
AtomRelationKind = Literal["opposite", "broader", "narrower", "co-occurs"]
AffixKind = Literal["suffix", "prefix", "circumfix", "compound_element"]
Productivity = Literal["high", "mid", "low", "dead"]
AlignRelation = Literal["TRANSLATION", "COGNATE", "SHARED_LOAN", "CALQUE"]
EdgeType = Literal[
    "INHERITED", "COGNATE", "BORROWED", "CALQUE", "DERIVED",
    "COMPOUNDED", "RECONSTRUCTED", "REBORROWED",
]
Drift = Literal[
    "NONE", "NARROWING", "WIDENING", "METAPHOR", "METONYMY",
    "PEJORATION", "AMELIORATION", "BLEACHING", "SPECIALISATION",
]
EdgeStatus = Literal["accepted", "contested"]
StructureOp = Literal[
    "STATE_OF", "CAUSE", "BECOME", "NEG", "HAVE",
    "AGENT_OF", "EVENT_OF", "PLACE_OF", "DEGREE",
]
TraceKind = Literal["affix", "atom", "edge", "rule", "source"]


class Base(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Provenance(Base):
    annotator: str
    date: str  # ISO date
    review_status: ReviewStatus = "draft"
    source_refs: list[str] = Field(default_factory=list)


class Source(Base):
    """Bibliographic entry; its id is the `source_ref` key used across the data."""
    id: str
    title: str
    citation: str
    url: Optional[str] = None
    kind: Literal["reference_work", "dictionary", "corpus", "crowd", "paper"] = "reference_work"


class AtomExponents(Base):
    en: str
    fr: str
    hi: str
    te: str
    ta: str


class AtomRelation(Base):
    atom_id: str
    relation: AtomRelationKind


class SemanticAtom(Base):
    """A member of the bounded (<=50) engineering interlingua.

    Semantic atoms are an engineering interlingua, not a theory of human cognition.
    NSM primes carry nsm_prime=True and ESTABLISHED status (as NSM inventory items).
    """
    id: str  # atom:GOOD
    category: AtomCategory
    definition: str
    epistemic_status: EpistemicStatus
    nsm_prime: bool = False
    exponents: AtomExponents
    related: list[AtomRelation] = Field(default_factory=list)


class AtomRef(Base):
    atom: str  # atom id


class OpNode(Base):
    op: StructureOp
    args: list["AtomStructure"] = Field(default_factory=list)


AtomStructure = Union[OpNode, AtomRef]
OpNode.model_rebuild()


def pretty_structure(s: AtomStructure) -> str:
    """Deterministic human-readable rendering, e.g. STATE_OF(GOOD)."""
    if isinstance(s, AtomRef):
        return s.atom.removeprefix("atom:")
    return f"{s.op}({', '.join(pretty_structure(a) for a in s.args)})"


class AffixFunction(Base):
    id: str  # fn:ST
    label: str
    definition: str
    epistemic_status: EpistemicStatus
    equivalence_class_id: Optional[str] = None


class AffixEquivalent(Base):
    affix_id: str
    note: str = ""


class Affix(Base):
    id: str  # affix:te:-tanam
    lang: Lang
    form: str  # citation form in native script (or Latin for en)
    script_form: str
    translit: str
    kind: AffixKind
    functions: list[str]  # AffixFunction ids
    register: Register
    productivity: Productivity
    allomorphs: list[str] = Field(default_factory=list)
    attaches_to: list[str] = Field(default_factory=list)  # POS tags
    examples: list[str] = Field(default_factory=list)  # entry ids
    equivalents: list[AffixEquivalent] = Field(default_factory=list)
    epistemic_status: EpistemicStatus = "ESTABLISHED"
    notes: str = ""
    provenance: Provenance


class EquivalenceClass(Base):
    """Functional (not distributional) cross-lingual grouping — ENGINEERING."""
    id: str  # eq:ST
    function_id: str
    members: list[str]  # affix ids
    notes: str


class Concept(Base):
    id: str  # concept:GOODNESS
    gloss: str
    ili: Optional[str] = None  # optional WordNet ILI id, stored as string
    structure: AtomStructure
    atoms: list[str]  # atom ids used
    structure_status: EpistemicStatus = "ENGINEERING"
    partial_coverage: bool = False


class Lemma(Base):
    form: str
    script: str  # e.g. Latn, Telu, Deva
    translit: str
    ipa: Optional[str] = None


class AffixUse(Base):
    affix_id: str
    function_id: str


class Morphology(Base):
    stem_form: str
    stem_ref: Optional[str] = None  # entry id or root id
    affixes: list[AffixUse] = Field(default_factory=list)
    schema_: str = Field(alias="schema")  # e.g. "STEM+ST", "SIMPLEX"
    segmentation_confidence: float = Field(ge=0.0, le=1.0, default=1.0)

    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class AlignedForm(Base):
    entry_id: str
    relation: AlignRelation


class LexicalEntry(Base):
    id: str  # lex:te:mancitanam (ASCII id; display forms carry full script)
    lang: Lang
    lemma: Lemma
    pos: str
    register: Register
    concept_id: str
    morphology: Morphology
    etymology: list[str] = Field(default_factory=list)  # edge ids
    aligned: list[AlignedForm] = Field(default_factory=list)
    notes: str = ""  # freehand; rendered separately as "annotator note"
    provenance: Provenance


class Root(Base):
    id: str  # root:pie:mehter
    form: str  # display form, e.g. *méh₂tēr
    family: Family
    gloss: str
    source_ref: str


class EtymNode(Base):
    node_ref: Optional[str] = None  # entry id or root id if in-graph
    lang_or_family: str  # Lang value or Family value or plain language name
    family: Family
    form: str
    gloss: str = ""


class EtymologyEdge(Base):
    id: str
    from_: EtymNode = Field(alias="from")
    to: EtymNode
    type: EdgeType
    drift: list[Drift] = Field(default_factory=lambda: ["NONE"])
    date_range: Optional[str] = None
    source_ref: list[str]
    confidence: float = Field(ge=0.0, le=1.0)
    status: EdgeStatus = "accepted"
    provenance: Provenance

    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class TraceItem(Base):
    kind: TraceKind
    ref: str
    confidence: float = 1.0


class ExplanationSentence(Base):
    text: str
    trace: list[TraceItem]


class Explanation(Base):
    entry_id: str
    sentences: list[ExplanationSentence]


class Dataset(Base):
    """Aggregate of all loaded data files."""
    atoms: list[SemanticAtom]
    affix_functions: list[AffixFunction]
    equivalence_classes: list[EquivalenceClass]
    affixes: list[Affix]
    concepts: list[Concept]
    entries: list[LexicalEntry]
    roots: list[Root]
    etymology_edges: list[EtymologyEdge]
    sources: list[Source]
