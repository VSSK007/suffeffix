"use client";

// The whole dataset as a parallel concordance: one row per meaning, one lane
// per language. Filter by text (any script, transliteration, or gloss), by the
// affix function a word uses, or to rows that are derived in all three.

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ConceptRow, LaneEntry } from "@/lib/model";
import { slug } from "@/lib/model";
import { LANES, normalize, langAttr } from "@/lib/lang";
import { FamilyDot } from "./marks";

function Cell({ list, fn }: { list: LaneEntry[]; fn: string | null }) {
  if (!list.length) return <span className="text-faint text-[13px]">—</span>;
  return (
    <div className="space-y-1.5">
      {list.map((e) => (
        <div key={e.id} className="min-w-0">
          <Link href={slug.entryHref(e.id)} lang={langAttr(e.lang)} className="text-[17px] font-medium hover:text-ie-ink transition-colors">
            {e.form}
          </Link>
          {e.form !== e.translit && <span className="mono text-[11px] text-faint ml-2">{e.translit}</span>}
          {e.morphemes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {e.morphemes.map((m) => (
                <span
                  key={m.affixId + m.fnId}
                  className={`${e.lang === "te" ? "chip-dr" : "chip-ie"} rounded px-1.5 text-[11.5px] leading-[1.6]`}
                  style={fn && m.fnId !== fn ? { opacity: 0.4 } : undefined}
                >
                  {m.form}
                  <span className="mono text-[9.5px] opacity-70 ml-1">{m.fnId.replace("fn:", "")}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Concordance({
  rows, functions,
}: { rows: ConceptRow[]; functions: { id: string; label: string; count: number }[] }) {
  const [q, setQ] = useState("");
  const [fn, setFn] = useState<string | null>(null);
  const [allDerived, setAllDerived] = useState(false);

  const index = useMemo(
    () =>
      rows.map((r) => ({
        r,
        keys: [
          normalize(r.gloss),
          ...LANES.flatMap((l) => r.lanes[l.code].flatMap((e) => [normalize(e.form), normalize(e.translit)])),
        ],
      })),
    [rows],
  );

  const shown = useMemo(() => {
    const qn = normalize(q);
    return index
      .filter(({ r, keys }) => {
        if (qn && !keys.some((k) => k.includes(qn))) return false;
        if (fn && !r.functions.includes(fn)) return false;
        if (allDerived && !LANES.every((l) => r.lanes[l.code].some((e) => e.morphemes.length > 0))) return false;
        return true;
      })
      .map(({ r }) => r);
  }, [index, q, fn, allDerived]);

  return (
    <div>
      {/* controls */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[16rem]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <label htmlFor="concordance-filter" className="sr-only">Filter the concordance</label>
            <input
              id="concordance-filter"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by word, transliteration, or meaning"
              className="w-full panel pl-10 pr-4 py-2.5 text-[15px] outline-none focus:border-ie placeholder:text-faint"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-[13px] text-ink-2 cursor-pointer select-none">
            <input
              id="all-derived"
              type="checkbox"
              checked={allDerived}
              onChange={(e) => setAllDerived(e.target.checked)}
              className="accent-[var(--ie)] w-4 h-4"
            />
            Derived in all three languages
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by affix function">
          <button
            onClick={() => setFn(null)}
            className="rounded-full px-3 py-1 text-[12.5px] border transition-colors"
            style={fn === null ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } : { borderColor: "var(--line)", color: "var(--muted)" }}
          >
            All functions
          </button>
          {functions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFn(fn === f.id ? null : f.id)}
              className="rounded-full px-3 py-1 text-[12.5px] border transition-colors"
              style={fn === f.id ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } : { borderColor: "var(--line)", color: "var(--muted)" }}
            >
              {f.label} <span className="font-semibold tnum">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mono text-[11.5px] text-muted mb-3 tnum">
        {shown.length} of {rows.length} meanings
      </p>

      {/* header */}
      <div className="lanes-labelled border-b-2 border-ink pb-2 hidden md:grid">
        <div className="text-[12px] font-semibold">Meaning</div>
        {LANES.slice(0, 2).map((l) => (
          <div key={l.code} className="px-4 text-[12px] font-semibold inline-flex items-center gap-2">
            <FamilyDot lang={l.code} /> {l.name}
          </div>
        ))}
        <div />
        <div className="px-4 text-[12px] font-semibold inline-flex items-center gap-2">
          <FamilyDot lang="te" /> Telugu
        </div>
      </div>

      {shown.length === 0 && (
        <p className="py-10 text-[14px] text-muted">
          No meanings match. Clear the function filter or try the gloss in English.
        </p>
      )}

      {shown.map((r) => (
        <div key={r.id} className="lanes-labelled border-b border-line">
          <div className="py-3.5 pr-4">
            <Link href={slug.conceptHref(r.id)} className="text-[13.5px] text-ink-2 hover:text-ie-ink leading-snug block">
              {r.gloss}
            </Link>
          </div>
          {LANES.slice(0, 2).map((l) => (
            <div key={l.code} className="py-3.5 md:px-4">
              <span className="md:hidden inline-flex items-center gap-1.5 text-[11px] text-faint mb-1">
                <FamilyDot lang={l.code} size={6} /> {l.name}
              </span>
              <Cell list={r.lanes[l.code]} fn={fn} />
            </div>
          ))}
          <div className="gutter" aria-hidden="true" />
          <div className="py-3.5 md:px-4">
            <span className="md:hidden inline-flex items-center gap-1.5 text-[11px] text-faint mb-1">
              <FamilyDot lang="te" size={6} /> Telugu
            </span>
            <Cell list={r.lanes.te} fn={fn} />
          </div>
        </div>
      ))}
    </div>
  );
}
