"use client";

import Link from "next/link";
import { useState } from "react";
import type { ConceptRow } from "@/lib/model";
import { slug } from "@/lib/model";
import { Triptych } from "./triptych";

/** Tabs over a handful of meanings, each rendered as a full triptych. */
export function Showcase({ rows }: { rows: ConceptRow[] }) {
  const [i, setI] = useState(0);
  const row = rows[i];
  return (
    <div className="panel p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
        <span className="kicker">Pick a meaning</span>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Example meanings">
          {rows.map((r, j) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={i === j}
              onClick={() => setI(j)}
              className="rounded-full px-3 py-1 text-[13px] border transition-colors"
              style={
                i === j
                  ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" }
                  : { borderColor: "var(--line)", color: "var(--muted)" }
              }
            >
              {r.gloss.replace(/^the state (of being |or period of being )?/, "").replace(/^one who /, "one who ")}
            </button>
          ))}
        </div>
      </div>

      <div key={row.id} className="rise">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-5">
          <h3 className="text-[15px] text-ink-2">
            <span className="text-faint">meaning · </span>
            {row.gloss}
          </h3>
          <span className="mono text-[12.5px] text-muted">{row.structure}</span>
        </div>
        <Triptych row={row} size="lg" />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-muted max-w-[62ch]">
            Affixes on the same row do the same job. The dashed line is the family boundary: nothing to its
            right is related to anything on its left by descent.
          </p>
          <Link href={slug.conceptHref(row.id)} className="text-[13.5px] font-medium text-ie-ink hover:underline underline-offset-4">
            Open this meaning →
          </Link>
        </div>
      </div>
    </div>
  );
}
