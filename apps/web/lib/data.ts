// Build-time data access for the static site. Reads apps/web/.sitedata/*.json,
// which scripts/export_site.py generates by replaying the FastAPI app — the
// API's response shapes remain the contract (`make site-data`).

import { promises as fs } from "fs";
import path from "path";
import type {
  Affix, AffixDetail, AffixFunction, Atom, AtomDetail, EntryDetail,
  EntrySummary, EqClassResolved, EtymologyGraph, Meta,
} from "./api";
import { LANG_CODES, type LangCode } from "./lang";
import { conceptSlug, type ConceptRow, type LaneEntry, type Relation } from "./model";

const DIR = path.join(process.cwd(), ".sitedata");
const cache = new Map<string, unknown>();

async function read<T>(name: string): Promise<T> {
  if (!cache.has(name)) {
    cache.set(name, JSON.parse(await fs.readFile(path.join(DIR, name), "utf-8")));
  }
  return cache.get(name) as T;
}

function laneEntry(d: EntryDetail): LaneEntry {
  const fnLabel = new Map(d.functions.map((f) => [f.id, f.label]));
  const affix = new Map(d.affixes.map((a) => [a.id, a]));
  return {
    id: d.entry.id,
    lang: d.entry.lang as LangCode,
    form: d.entry.lemma.form,
    translit: d.entry.lemma.translit,
    pos: d.entry.pos,
    register: d.entry.register,
    stem: d.entry.morphology.stem_form,
    review: d.entry.provenance.review_status,
    morphemes: d.entry.morphology.affixes.map((u) => {
      const a = affix.get(u.affix_id);
      return {
        affixId: u.affix_id,
        form: a?.form ?? u.affix_id,
        translit: a?.translit ?? "",
        kind: a?.kind ?? "suffix",
        fnId: u.function_id,
        fnLabel: fnLabel.get(u.function_id) ?? u.function_id,
      };
    }),
  };
}

let conceptCache: ConceptRow[] | null = null;

async function buildConcepts(): Promise<ConceptRow[]> {
  if (conceptCache) return conceptCache;
  const details = await read<Record<string, EntryDetail>>("entry-details.json");
  const byConcept = new Map<string, EntryDetail[]>();
  for (const d of Object.values(details)) {
    const list = byConcept.get(d.entry.concept_id) ?? [];
    list.push(d);
    byConcept.set(d.entry.concept_id, list);
  }
  const rows: ConceptRow[] = [];
  for (const [id, list] of byConcept) {
    const c = list[0].concept;
    if (!c) continue;
    const lanes = Object.fromEntries(LANG_CODES.map((l) => [l, [] as LaneEntry[]])) as Record<LangCode, LaneEntry[]>;
    for (const d of list) lanes[d.entry.lang as LangCode].push(laneEntry(d));
    for (const k of Object.keys(lanes) as LangCode[]) lanes[k].sort((a, b) => a.id.localeCompare(b.id));
    const functions: string[] = [];
    for (const k of LANG_CODES) {
      for (const e of lanes[k]) for (const m of e.morphemes) if (!functions.includes(m.fnId)) functions.push(m.fnId);
    }
    const seen = new Set<string>();
    const relations: Relation[] = [];
    for (const d of list) {
      for (const al of d.entry.aligned) {
        if (al.relation === "TRANSLATION") continue;
        const key = [d.entry.id, al.entry_id].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        relations.push({ a: d.entry.id, b: al.entry_id, relation: al.relation });
      }
    }
    rows.push({
      id,
      slug: conceptSlug(id),
      gloss: c.gloss,
      structure: list[0].structure_pretty ?? "",
      structureStatus: c.structure_status,
      atoms: c.atoms,
      partial: c.partial_coverage,
      functions,
      lanes,
      relations,
    });
  }
  const key = (g: string) => g.replace(/^(a|an|the|one who|able to be) /i, "");
  rows.sort((a, b) => key(a.gloss).localeCompare(key(b.gloss)));
  conceptCache = rows;
  return rows;
}

export const data = {
  meta: () => read<Meta>("meta.json"),
  entries: () => read<EntrySummary[]>("entries.json"),
  entryDetails: () => read<Record<string, EntryDetail>>("entry-details.json"),
  entry: async (id: string) => (await data.entryDetails())[id],
  affixes: () => read<Affix[]>("affixes.json"),
  affixDetails: () => read<Record<string, AffixDetail>>("affix-details.json"),
  affix: async (id: string) => (await data.affixDetails())[id],
  functions: () => read<AffixFunction[]>("functions.json"),
  eqClasses: () => read<EqClassResolved[]>("eq-classes.json"),
  atoms: () => read<Atom[]>("atoms.json"),
  atomDetails: () => read<Record<string, AtomDetail>>("atom-details.json"),
  atom: async (id: string) => (await data.atomDetails())[id],
  etymology: () => read<Record<string, EtymologyGraph>>("etymology.json"),
  concepts: buildConcepts,
  concept: async (id: string) => (await buildConcepts()).find((c) => c.id === id),
  conceptBySlug: async (s: string) => (await buildConcepts()).find((c) => c.slug === s),
};

export { slug, conceptSlug } from "./model";
export type { ConceptRow, LaneEntry, Morpheme, Relation } from "./model";
