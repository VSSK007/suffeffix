"use client";

import Link from "next/link";
import { useState } from "react";
import type { LangCode } from "@/lib/lang";
import { LANES, REGISTER_NAME, langAttr } from "@/lib/lang";
import { slug } from "@/lib/model";
import { FamilyDot } from "./marks";

export interface AffixLite {
  id: string;
  form: string;
  translit: string;
  register: string;
  productivity: string;
}
export interface ExampleRow {
  conceptId: string;
  gloss: string;
  lanes: Record<LangCode, { id: string; form: string; translit: string; affix: string } | null>;
}
export interface AtlasRow {
  id: string;
  label: string;
  definition: string;
  status: string;
  cells: Record<LangCode, AffixLite[]>;
  examples: ExampleRow[];
  note: string | null;
}

function Chip({ a, lang }: { a: AffixLite; lang: LangCode }) {
  const dead = a.productivity === "dead";
  return (
    <Link
      href={slug.affixHref(a.id)}
      onClick={(e) => e.stopPropagation()}
      className={`${lang === "te" ? "chip-dr" : "chip-ie"} inline-flex items-baseline gap-1 rounded-md px-2 py-0.5 text-[15px] hover:-translate-y-[1px] transition-transform`}
      style={dead ? { borderStyle: "dashed", fontStyle: "italic" } : undefined}
      title={`${a.translit} · ${REGISTER_NAME[a.register] ?? a.register} · productivity ${a.productivity}`}
    >
      <span lang={langAttr(lang)}>{a.form}</span>
      <span className="mono text-[9.5px] opacity-70">{a.register}</span>
    </Link>
  );
}

export function Atlas({ rows, initial }: { rows: AtlasRow[]; initial: string }) {
  const [open, setOpen] = useState<string | null>(initial);

  return (
    <div>
      <div className="lanes-labelled border-b-2 border-ink pb-2 hidden md:grid sticky top-14 z-10" style={{ background: "var(--bg)" }}>
        <div className="text-[12px] font-semibold pt-2">Function</div>
        {LANES.slice(0, 2).map((l) => (
          <div key={l.code} className="px-4 pt-2 text-[12px] font-semibold inline-flex items-center gap-2">
            <FamilyDot lang={l.code} /> {l.name}
          </div>
        ))}
        <div />
        <div className="px-4 pt-2 text-[12px] font-semibold inline-flex items-center gap-2">
          <FamilyDot lang="te" /> Telugu
        </div>
      </div>

      {rows.map((r) => {
        const isOpen = open === r.id;
        return (
          <div key={r.id} className="border-b border-line">
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(isOpen ? null : r.id);
                }
              }}
              className="lanes-labelled cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_3%,transparent)]"
              style={isOpen ? { background: "color-mix(in srgb, var(--ink) 4%, transparent)" } : undefined}
            >
              <div className="py-4 pr-4 flex items-start gap-2.5">
                <span
                  className="mono text-[11px] text-muted mt-[3px] transition-transform inline-block"
                  style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                  aria-hidden="true"
                >
                  ▸
                </span>
                <div>
                  <div className="text-[15px] font-semibold leading-tight">{r.label}</div>
                  <div className="mono text-[10.5px] text-faint mt-1">{r.id}</div>
                </div>
              </div>
              {LANES.slice(0, 2).map((l) => (
                <div key={l.code} className="py-4 md:px-4 flex flex-wrap content-start gap-1.5">
                  <span className="md:hidden w-full inline-flex items-center gap-1.5 text-[11px] text-faint">
                    <FamilyDot lang={l.code} size={6} /> {l.name}
                  </span>
                  {r.cells[l.code].length ? r.cells[l.code].map((a) => <Chip key={a.id} a={a} lang={l.code} />) : <span className="text-faint">—</span>}
                </div>
              ))}
              <div className="gutter" aria-hidden="true" />
              <div className="py-4 md:px-4 flex flex-wrap content-start gap-1.5">
                <span className="md:hidden w-full inline-flex items-center gap-1.5 text-[11px] text-faint">
                  <FamilyDot lang="te" size={6} /> Telugu
                </span>
                {r.cells.te.length ? r.cells.te.map((a) => <Chip key={a.id} a={a} lang="te" />) : <span className="text-faint">—</span>}
              </div>
            </div>

            {isOpen && (
              <div className="rise pb-7 pt-1 md:pl-[10rem]">
                <div className="panel p-5 sm:p-6">
                  <p className="text-[14.5px] text-ink-2 max-w-[70ch]">{r.definition}</p>
                  {r.note && <p className="text-[12.5px] text-muted mt-2 max-w-[70ch]">{r.note}</p>}

                  {r.examples.length > 0 ? (
                    <div className="mt-5">
                      <p className="kicker mb-2">The same job, in words from the graph</p>
                      {r.examples.map((ex) => (
                        <div key={ex.conceptId} className="lanes-labelled border-t border-line">
                          <div className="py-2.5 pr-4">
                            <Link href={slug.conceptHref(ex.conceptId)} className="text-[12.5px] text-muted hover:text-ie-ink leading-snug block">
                              {ex.gloss}
                            </Link>
                          </div>
                          {(["en", "hi"] as const).map((l) => (
                            <div key={l} className="py-2.5 md:px-4">
                              <ExampleWord w={ex.lanes[l]} lang={l} />
                            </div>
                          ))}
                          <div className="gutter" aria-hidden="true" />
                          <div className="py-2.5 md:px-4">
                            <ExampleWord w={ex.lanes.te} lang="te" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-faint mt-4">
                      No meaning in the dataset uses this function in more than one language yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExampleWord({ w, lang }: { w: ExampleRow["lanes"][LangCode]; lang: LangCode }) {
  if (!w) return <span className="text-faint text-[13px]">—</span>;
  return (
    <Link href={slug.entryHref(w.id)} className="group inline-flex flex-wrap items-baseline gap-x-2">
      <span lang={langAttr(lang)} className="text-[16px] font-medium group-hover:text-ie-ink">{w.form}</span>
      <span className={`${lang === "te" ? "chip-dr" : "chip-ie"} rounded px-1.5 text-[11.5px]`}>{w.affix}</span>
    </Link>
  );
}
