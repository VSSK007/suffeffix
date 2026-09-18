// Types mirroring the Suffeffix API response models (docs/schema/*.json,
// /openapi.json). The static site consumes these shapes from .sitedata JSON
// exported by scripts/export_site.py, so the API remains the contract.

export type Lang = "en" | "te" | "hi";
export type EpistemicStatus = "ESTABLISHED" | "ENGINEERING" | "HYPOTHESIS" | "FUTURE";
export type ReviewStatus = "draft" | "reviewed" | "published";

export interface Provenance {
  annotator: string;
  date: string;
  review_status: ReviewStatus;
  source_refs: string[];
}

export interface EntrySummary {
  id: string;
  lang: Lang;
  form: string;
  translit: string;
  gloss: string;
  pos: string;
  register: string;
}

export interface SearchResult {
  entry: EntrySummary;
  score: number;
}

export interface Atom {
  id: string;
  category: string;
  definition: string;
  epistemic_status: EpistemicStatus;
  nsm_prime: boolean;
  exponents: { en: string; te: string; hi: string };
  related: { atom_id: string; relation: string }[];
}

export interface AffixFunction {
  id: string;
  label: string;
  definition: string;
  epistemic_status: EpistemicStatus;
  equivalence_class_id: string | null;
}

export interface Affix {
  id: string;
  lang: Lang;
  form: string;
  script_form: string;
  translit: string;
  kind: string;
  functions: string[];
  register: string;
  productivity: string;
  allomorphs: string[];
  attaches_to: string[];
  examples: string[];
  equivalents: { affix_id: string; note: string }[];
  epistemic_status: EpistemicStatus;
  notes: string;
  provenance: Provenance;
}

export interface Concept {
  id: string;
  gloss: string;
  ili: string | null;
  structure: unknown;
  atoms: string[];
  structure_status: EpistemicStatus;
  partial_coverage: boolean;
}

export interface EtymNode {
  node_ref: string | null;
  lang_or_family: string;
  family: string;
  form: string;
  gloss: string;
}

export interface EtymologyEdge {
  id: string;
  from: EtymNode;
  to: EtymNode;
  type: string;
  drift: string[];
  date_range: string | null;
  source_ref: string[];
  confidence: number;
  status: "accepted" | "contested";
  provenance: Provenance;
}

export interface TraceItem {
  kind: "affix" | "atom" | "edge" | "rule" | "source";
  ref: string;
  confidence: number;
}

export interface Explanation {
  entry_id: string;
  sentences: { text: string; trace: TraceItem[] }[];
}

export interface LexicalEntry {
  id: string;
  lang: Lang;
  lemma: { form: string; script: string; translit: string; ipa: string | null };
  pos: string;
  register: string;
  concept_id: string;
  morphology: {
    stem_form: string;
    stem_ref: string | null;
    affixes: { affix_id: string; function_id: string }[];
    schema: string;
    segmentation_confidence: number;
  };
  etymology: string[];
  aligned: { entry_id: string; relation: string }[];
  notes: string;
  provenance: Provenance;
}

export interface EntryDetail {
  entry: LexicalEntry;
  concept: Concept | null;
  structure_pretty: string | null;
  atoms: Atom[];
  affixes: Affix[];
  functions: AffixFunction[];
  edges: EtymologyEdge[];
  aligned: { entry: EntrySummary; relation: string }[];
  explanation: Explanation;
}

export interface EntryPage {
  total: number;
  page: number;
  page_size: number;
  items: EntrySummary[];
}

export interface AffixDetail {
  affix: Affix;
  functions: AffixFunction[];
  examples: EntrySummary[];
  equivalents: { affix: Affix; note: string }[];
}

export interface EqClassResolved {
  eq: { id: string; function_id: string; members: string[]; notes: string };
  function: AffixFunction | null;
  members: Affix[];
}

export interface AtomDetail {
  atom: Atom;
  related: Atom[];
  entries: EntrySummary[];
}

export interface EtymologyGraph {
  entry_id: string;
  nodes: { key: string; node_ref: string | null; form: string; lang_or_family: string; family: string; gloss: string }[];
  edges: EtymologyEdge[];
}

export interface ConceptDetail {
  concept: Concept;
  structure_pretty: string;
  atoms: Atom[];
  entries: EntrySummary[];
}

export interface Meta {
  counts: Record<string, number | Record<string, number>> & {
    entries: number;
    entries_by_lang: Record<string, number>;
  };
  epistemic_status: Record<string, number>;
  review_status: Record<string, number>;
  build_timestamp: string;
}
