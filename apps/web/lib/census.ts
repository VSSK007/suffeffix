// Figures for the technical report, computed at build time from the dataset.
// Nothing here is typed in by hand: every number on /research is derived.

import { promises as fs } from "fs";
import path from "path";
import { data } from "./data";

const ROOT = path.join(process.cwd(), "..", "..");

interface RawEdge {
  id: string;
  type: string;
  status: "accepted" | "contested";
  confidence: number;
  from: { family: string; form: string; lang_or_family: string };
  to: { family: string; form: string; lang_or_family: string };
  source_ref: string[];
}

export interface Source { id: string; title: string; citation: string; url: string | null; kind: string }

export async function loadSources(): Promise<Source[]> {
  return JSON.parse(await fs.readFile(path.join(ROOT, "data", "sources.json"), "utf-8"));
}

function band(f: string): string {
  if (f.startsWith("Dravidian") || f === "Reconstructed:Proto-Dravidian") return "dr";
  if (f.startsWith("IE") || f === "Reconstructed:PIE") return "ie";
  return f;
}

export interface Census {
  entries: number;
  reg: Record<string, { n: number; counts: Record<string, number>; examples: Record<string, string[]>; derived: number }>;
  heat: { id: string; label: string; en: string[]; hi: string[]; te: string[] }[];
  affixTotals: Record<string, number>;
  edgeTypes: { type: string; within: number; crosses: number; contested: number }[];
  crossExamples: string[];
  edgeTotal: number;
  contested: number;
  conf: { bin: number; accepted: number; contested: number }[];
  counts: { concepts: number; affixes: number; functions: number; classes: number; atoms: number; roots: number; sources: number };
}

let cache: Census | null = null;

export async function loadCensus(): Promise<Census> {
  if (cache) return cache;
  const [entries, affixes, functions, meta] = await Promise.all([data.entries(), data.affixes(), data.functions(), data.meta()]);
  const edges: RawEdge[] = JSON.parse(await fs.readFile(path.join(ROOT, "data", "etymology_edges.json"), "utf-8"));

  const reg: Census["reg"] = {};
  for (const l of ["en", "hi", "te"]) {
    const list = entries.filter((e) => e.lang === l);
    const counts: Record<string, number> = {};
    const examples: Record<string, string[]> = {};
    for (const e of list) {
      counts[e.register] = (counts[e.register] ?? 0) + 1;
      (examples[e.register] ??= []).length < 4 && examples[e.register].push(e.form);
    }
    reg[l] = { n: list.length, counts, examples, derived: 0 };
  }

  const label = new Map(functions.map((f) => [f.id, f.label]));
  const rows = new Map<string, { id: string; label: string; en: string[]; hi: string[]; te: string[] }>();
  for (const a of affixes) {
    for (const f of a.functions) {
      const r = rows.get(f) ?? { id: f, label: label.get(f) ?? f, en: [], hi: [], te: [] };
      r[a.lang].push(a.form);
      rows.set(f, r);
    }
  }
  const heat = [...rows.values()].sort(
    (a, b) => b.en.length + b.hi.length + b.te.length - (a.en.length + a.hi.length + a.te.length) || a.label.localeCompare(b.label),
  );

  const types = new Map<string, { type: string; within: number; crosses: number; contested: number }>();
  const crossExamples: string[] = [];
  for (const e of edges) {
    const s = types.get(e.type) ?? { type: e.type, within: 0, crosses: 0, contested: 0 };
    const cross = band(e.from.family) !== band(e.to.family);
    if (cross) s.crosses++; else s.within++;
    if (e.status === "contested") s.contested++;
    if (cross && crossExamples.length < 6) crossExamples.push(`${e.from.form} → ${e.to.form}`);
    types.set(e.type, s);
  }
  for (const s of types.values()) {
    if (s.crosses && (s.type === "INHERITED" || s.type === "COGNATE")) {
      throw new Error(`family constraint violated in data: ${s.type} crosses a boundary`);
    }
  }
  const edgeTypes = [...types.values()].sort((a, b) => b.within + b.crosses - (a.within + a.crosses));

  const conf = Array.from({ length: 12 }, (_, i) => ({ bin: Math.round((0.4 + 0.05 * i) * 100) / 100, accepted: 0, contested: 0 }));
  for (const e of edges) {
    const bin = Math.round(Math.round(e.confidence / 0.05) * 0.05 * 100) / 100;
    const slot = conf.find((c) => c.bin === bin);
    if (!slot) throw new Error(`confidence ${e.confidence} outside histogram range`);
    slot[e.status]++;
  }

  cache = {
    entries: meta.counts.entries,
    reg, heat,
    affixTotals: { en: affixes.filter((a) => a.lang === "en").length, hi: affixes.filter((a) => a.lang === "hi").length, te: affixes.filter((a) => a.lang === "te").length },
    edgeTypes, crossExamples,
    edgeTotal: edges.length,
    contested: edges.filter((e) => e.status === "contested").length,
    conf,
    counts: {
      concepts: meta.counts.concepts as number, affixes: meta.counts.affixes as number,
      functions: meta.counts.affix_functions as number, classes: meta.counts.equivalence_classes as number, atoms: meta.counts.atoms as number,
      roots: meta.counts.roots as number, sources: meta.counts.sources as number,
    },
  };
  return cache;
}
