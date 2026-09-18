// Build-time data access for the static site. Reads apps/web/.sitedata/*.json,
// which scripts/export_site.py generates by replaying the FastAPI app — the
// API's response shapes remain the contract (`make site-data`).

import { promises as fs } from "fs";
import path from "path";
import type {
  Affix, AffixDetail, AffixFunction, Atom, AtomDetail, EntryDetail,
  EntrySummary, EqClassResolved, EtymologyGraph, Meta,
} from "./api";

const DIR = path.join(process.cwd(), ".sitedata");
const cache = new Map<string, unknown>();

async function read<T>(name: string): Promise<T> {
  if (!cache.has(name)) {
    cache.set(name, JSON.parse(await fs.readFile(path.join(DIR, name), "utf-8")));
  }
  return cache.get(name) as T;
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
};

// URL slugs <-> graph ids. Ids contain ":" (invalid in exported file paths),
// so routes use /{kind}/{lang}/{slug} and /atoms/{name}.
export const slug = {
  entry: (id: string) => id.split(":").slice(1) as [string, string], // [lang, slug]
  entryId: (lang: string, s: string) => `lex:${lang}:${s}`,
  entryHref: (id: string) => `/lexicon/${slug.entry(id).join("/")}/`,
  affix: (id: string) => id.split(":").slice(1) as [string, string],
  affixId: (lang: string, s: string) => `affix:${lang}:${s}`,
  affixHref: (id: string) => `/affixes/${slug.affix(id).join("/")}/`,
  atom: (id: string) => id.replace(/^atom:/, ""),
  atomId: (name: string) => `atom:${name}`,
  atomHref: (id: string) => `/atoms/${slug.atom(id)}/`,
  etymologyHref: (entryId: string) => `/etymology/${slug.entry(entryId).join("/")}/`,
};
