// Pure types and URL helpers shared by server pages and client components
// (no Node APIs here, so client bundles can import it).

import type { LangCode } from "./lang";

// ── concept-centric view ────────────────────────────────────────────────────

export interface Morpheme {
  affixId: string;
  form: string;
  translit: string;
  kind: string;
  fnId: string;
  fnLabel: string;
}

export interface LaneEntry {
  id: string;
  lang: LangCode;
  form: string;
  translit: string;
  pos: string;
  register: string;
  stem: string;
  morphemes: Morpheme[];
  review: string;
}

export interface Relation {
  a: string;
  b: string;
  relation: string;
}

export interface ConceptRow {
  id: string;
  slug: string;
  gloss: string;
  structure: string;
  structureStatus: string;
  atoms: string[];
  partial: boolean;
  functions: string[];
  lanes: Record<LangCode, LaneEntry[]>;
  relations: Relation[];
}


export const conceptSlug = (id: string) => id.replace(/^concept:/, "").toLowerCase().replace(/_/g, "-");

// URL slugs <-> graph ids. Ids contain ":" (invalid in exported file paths),
// so routes use /{kind}/{lang}/{slug} and /atoms/{name}.
export const slug = {
  entry: (id: string) => id.split(":").slice(1) as [string, string],
  entryId: (lang: string, s: string) => `lex:${lang}:${s}`,
  entryHref: (id: string) => `/lexicon/${id.split(":").slice(1).join("/")}/`,
  affix: (id: string) => id.split(":").slice(1) as [string, string],
  affixId: (lang: string, s: string) => `affix:${lang}:${s}`,
  affixHref: (id: string) => `/affixes/${id.split(":").slice(1).join("/")}/`,
  atom: (id: string) => id.replace(/^atom:/, ""),
  atomId: (name: string) => `atom:${name}`,
  atomHref: (id: string) => `/atoms/${id.replace(/^atom:/, "")}/`,
  etymologyHref: (entryId: string) => `/etymology/${entryId.split(":").slice(1).join("/")}/`,
  conceptHref: (id: string) => `/concepts/${conceptSlug(id)}/`,
};
