"use client";

import Link from "next/link";
import { useState } from "react";
import type { Atom } from "@/lib/api";
import { slug } from "@/lib/model";

const CATEGORIES = ["FOUNDATIONAL", "RELATIONAL", "STATE", "ACTION", "EMOTIONAL", "SOCIAL"];

/* The closed inventory as one table of elements: a column per category,
   numbered in reading order. Hovering an atom lights its relations. */
export function AtomTable({ atoms, usage }: { atoms: Atom[]; usage: Record<string, number> }) {
  const [hover, setHover] = useState<string | null>(null);
  const byId = new Map(atoms.map((a) => [a.id, a]));
  const related = new Map<string, string>();
  if (hover) {
    for (const r of byId.get(hover)?.related ?? []) related.set(r.atom_id, r.relation);
    for (const a of atoms) for (const r of a.related) if (r.atom_id === hover && !related.has(a.id)) related.set(a.id, r.relation);
  }

  let n = 0;
  const number = new Map<string, number>();
  for (const c of CATEGORIES) for (const a of atoms.filter((x) => x.category === c)) number.set(a.id, ++n);

  return (
    <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
      <div className="grid grid-cols-6 gap-2 min-w-[880px]">
        {CATEGORIES.map((c) => {
          const group = atoms.filter((a) => a.category === c);
          return (
            <div key={c} className="space-y-2">
              <div className="kicker pb-1 border-b border-line">
                {c.toLowerCase()} <span className="text-faint">{group.length}</span>
              </div>
              {group.map((a) => {
                const name = a.id.replace("atom:", "");
                const isHover = hover === a.id;
                const rel = related.get(a.id);
                const dim = hover && !isHover && !rel;
                return (
                  <Link
                    key={a.id}
                    href={slug.atomHref(a.id)}
                    onMouseEnter={() => setHover(a.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(a.id)}
                    onBlur={() => setHover(null)}
                    className="block rounded-lg p-2.5 transition-all duration-150"
                    style={{
                      background: a.nsm_prime ? "var(--surface)" : "transparent",
                      border: `1.5px ${a.nsm_prime ? "solid" : "dashed"} ${isHover ? "var(--ink)" : rel ? "var(--ie)" : "var(--line-2)"}`,
                      opacity: dim ? 0.35 : 1,
                    }}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="mono text-[10px] text-faint tnum">{number.get(a.id)}</span>
                      {rel ? (
                        <span className="mono text-[9.5px] text-ie-ink">{rel}</span>
                      ) : (
                        <span className="mono text-[9.5px] text-faint tnum" title="meanings using this atom">{usage[a.id] ?? 0}</span>
                      )}
                    </div>
                    <div className="mono text-[13.5px] font-medium mt-0.5 truncate">{name}</div>
                    <div className="text-[11.5px] text-muted leading-snug mt-1 truncate">{a.exponents.en} · <span lang="fr">{a.exponents.fr}</span></div>
                    <div lang="hi" className="text-[12px] text-ink-2 leading-snug truncate">{a.exponents.hi}</div>
                    <div className="text-[12px] text-ink-2 leading-snug truncate"><span lang="te">{a.exponents.te}</span> · <span lang="ta">{a.exponents.ta}</span></div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
