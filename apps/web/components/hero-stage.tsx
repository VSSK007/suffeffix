"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ConceptRow, LaneEntry } from "@/lib/model";
import { slug } from "@/lib/model";
import { LANES, langAttr, type LangCode } from "@/lib/lang";
import { LaneRow } from "./lane-row";
import { AffixChip, StemChip } from "./morphemes";
import { FamilyDot } from "./marks";

function Lane({ e, delay, animate }: { e: LaneEntry | undefined; delay: number; animate: boolean }) {
  if (!e) return <span className="text-faint">—</span>;
  const pre = e.morphemes.filter((m) => m.kind === "prefix");
  const post = e.morphemes.filter((m) => m.kind !== "prefix");
  return (
    <div className={animate ? "slide-in" : undefined} style={animate ? { animationDelay: `${delay}ms` } : undefined}>
      <Link href={slug.entryHref(e.id)} className="block group">
        <span lang={langAttr(e.lang)} className="display block text-[clamp(26px,2.2vw,34px)] group-hover:text-ie-ink transition-colors">
          {e.form}
        </span>
        {e.form !== e.translit && <span className="mono block text-[13px] text-muted mt-2">{e.translit}</span>}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
        {pre.map((m) => (
          <span key={m.affixId} className="inline-flex items-center gap-2">
            <AffixChip m={m} lang={e.lang} size="md" showFn={false} />
            <span className="text-faint text-[13px]">+</span>
          </span>
        ))}
        <StemChip text={e.stem} size="md" lang={langAttr(e.lang)} />
        {post.map((m) => (
          <span key={m.affixId + m.fnId} className="inline-flex items-center gap-2">
            <span className="text-faint text-[13px]">+</span>
            <AffixChip m={m} lang={e.lang} size="md" showFn={false} />
          </span>
        ))}
      </div>
      <p className="text-[12.5px] text-muted mt-3">{e.morphemes.map((m) => m.fnLabel).join(" · ") || "simplex"}</p>
    </div>
  );
}

/** The hero: one meaning landing in five languages, cycling through six.
 *  Autoplay pauses on hover/focus, never starts under reduced motion, and has
 *  an explicit pause control (WCAG 2.2.2). */
export function HeroStage({ rows }: { rows: ConceptRow[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [moved, setMoved] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing || hover) return;
    const t = setInterval(() => { setMoved(true); setI((n) => (n + 1) % rows.length); }, 5200);
    return () => clearInterval(t);
  }, [playing, hover, rows.length]);

  const row = rows[i];
  const pick = (l: LangCode) => row.lanes[l][0];

  return (
    <section
      aria-label="One meaning in five languages"
      className="panel p-6 sm:p-10 lg:p-12"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-10">
        <p className="kicker">Meaning</p>
        <p className="text-[15px] text-ink-2 flex-1 min-w-[12rem]" aria-live="polite">
          <span className="font-semibold text-ink">{row.gloss}</span>
          <span className="mono text-[12.5px] text-muted ml-3">{row.structure}</span>
        </p>
      </div>

      <div key={row.id} className="lanes gap-y-8 lg:gap-x-5">
        <LaneRow
          render={(l) => (
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold mb-4"><FamilyDot lang={l.code} /> {l.name}</p>
              <Lane e={pick(l.code)} delay={LANES.indexOf(l) * 80} animate={moved} />
            </div>
          )}
        />
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-line pt-6">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose a meaning">
          {rows.map((r, j) => (
            <button
              key={r.id}
              onClick={() => { setMoved(true); setI(j); setPlaying(false); }}
              aria-pressed={i === j}
              className="rounded-full px-3.5 py-1.5 text-[13px] border transition-colors"
              style={i === j ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } : { borderColor: "var(--line-2)", color: "var(--muted)" }}
            >
              {r.lanes.en[0]?.form ?? r.gloss}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink"
          aria-label={playing ? "Pause the demonstration" : "Play the demonstration"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4l13 8-13 8z" />}
          </svg>
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </section>
  );
}
