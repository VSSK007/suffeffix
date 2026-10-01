"use client";

// Interactive figures for the technical report. Each is a typed, accessible
// port of the dataset census: hover/focus readouts that lead with the value,
// labels that are dropped (never clipped) when they do not fit, a legend that
// highlights its series, and a table twin supplied by <Figure>.

import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";
import type { Census } from "@/lib/census";
import { Figure } from "./figure";

const LANG: Record<string, string> = { en: "English", hi: "Hindi", te: "Telugu" };
const pct = (n: number, d: number) => Math.round((100 * n) / d);

/* ── tooltip ─────────────────────────────────────────────────────────────── */
interface TipContent { color?: string; value: string; label: string; lines?: string[] }
interface TipState { c: TipContent; x: number; y: number }
type Bind = (c: TipContent) => {
  tabIndex: number;
  onPointerEnter: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  onFocus: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
};
const TipCtx = createContext<Bind | null>(null);
const useBind = () => {
  const b = useContext(TipCtx);
  if (!b) throw new Error("figure used outside TipProvider");
  return b;
};

function TipProvider({ children }: { children: React.ReactNode }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const bind = useCallback<Bind>(
    (c) => ({
      tabIndex: 0,
      onPointerEnter: (e) => setTip({ c, x: e.clientX, y: e.clientY }),
      onPointerMove: (e) => setTip({ c, x: e.clientX, y: e.clientY }),
      onPointerLeave: () => setTip(null),
      onFocus: (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTip({ c, x: r.left + r.width / 2, y: r.top });
      },
      onBlur: () => setTip(null),
    }),
    [],
  );
  const flipX = tip ? tip.x > (typeof window !== "undefined" ? window.innerWidth : 1200) - 330 : false;
  const flipY = tip ? tip.y > (typeof window !== "undefined" ? window.innerHeight : 800) - 160 : false;
  return (
    <TipCtx.Provider value={bind}>
      {children}
      {tip && (
        <div
          role="tooltip"
          className="fixed z-50 pointer-events-none rounded-[12px] border border-line bg-bg px-3.5 py-3 text-[12.5px] leading-snug shadow-lift"
          style={{
            left: tip.x, top: tip.y, maxWidth: 300,
            transform: `translate(${flipX ? "calc(-100% - 14px)" : "14px"}, ${flipY ? "calc(-100% - 12px)" : "16px"})`,
          }}
        >
          <div className="flex items-center gap-2">
            {tip.c.color && <span className="inline-block h-[3px] w-[14px] rounded-full" style={{ background: tip.c.color }} />}
            <strong className="text-[15px] font-bold">{tip.c.value}</strong>
            <span className="text-ink-2">{tip.c.label}</span>
          </div>
          {(tip.c.lines ?? []).filter(Boolean).map((l, i) => (
            <div key={i} className="mt-1.5 text-muted">{l}</div>
          ))}
        </div>
      )}
    </TipCtx.Provider>
  );
}

/* ── a bar segment whose label is dropped, never clipped, when it will not fit ── */
let measureCtx: CanvasRenderingContext2D | null = null;
function textWidth(text: string, font: string): number {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return 0;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

function Seg({
  full, short, bg, fg, style, className = "", tip, label,
}: {
  full: string; short?: string; bg: string; fg: string; style?: React.CSSProperties; className?: string;
  tip: TipContent; label: string;
}) {
  const bind = useBind();
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const font = getComputedStyle(el).font;
      for (const t of [full, short]) {
        if (t && textWidth(t, font) + 16 <= el.clientWidth) return setText(t);
      }
      setText("");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [full, short]);
  return (
    <div
      ref={ref}
      {...bind(tip)}
      role="img"
      aria-label={label}
      className={`flex items-center justify-center whitespace-nowrap transition-[opacity,filter] hover:brightness-110 focus-visible:brightness-110 ${className}`}
      style={{ background: bg, color: fg, font: "600 11.5px var(--font-sans)", minWidth: 0, ...style }}
    >
      {text}
    </div>
  );
}

function Legend({ items, onHover }: { items: { k: string; name: string; color: string }[]; onHover?: (k: string | null) => void }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
      {items.map((s) => (
        <span
          key={s.k}
          className="inline-flex items-center gap-2 text-[12.5px] text-ink-2"
          onPointerEnter={() => onHover?.(s.k)}
          onPointerLeave={() => onHover?.(null)}
        >
          <span className="h-3 w-3 rounded-[3px]" style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-[14px]" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>{head.map((h, i) => (
          <th key={h} className={`py-2.5 pr-4 font-semibold border-b-2 border-ink whitespace-nowrap ${i ? "text-right" : "text-left"}`}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => (
            <td key={j} className={`py-2.5 pr-4 border-b border-line text-ink-2 tnum ${j ? "text-right" : "text-left font-medium text-ink"}`}>{c}</td>
          ))}</tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Figure: register layers ─────────────────────────────────────────────── */
const SERIES = [
  { k: "N", name: "Native", v: "s1" },
  { k: "S", name: "Sanskritic", v: "s2" },
  { k: "P", name: "Perso-Arabic", v: "s3" },
  { k: "E", name: "Learned (Latin, Greek)", short: "Learned", v: "s4" },
  { k: "mixed", name: "Mixed", short: "Mixed", v: "neutral" },
] as const;

export function RegisterFigure({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  const [hl, setHl] = useState<string | null>(null);
  const R = c.reg;
  const share = (l: string, k: string) => pct(R[l].counts[k] ?? 0, R[l].n);

  const row = (l: string) => (
    <div key={l} className="grid sm:grid-cols-[7.2rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 mb-3.5">
      <div className="text-[14px] font-semibold leading-tight">
        {LANG[l]}
        <span className="mono block text-[11px] font-normal text-muted mt-0.5">{R[l].n} words</span>
      </div>
      <div className="flex gap-[2px] h-6">
        {SERIES.map((s) => {
          const count = R[l].counts[s.k];
          if (!count) return null;
          const p = pct(count, R[l].n);
          return (
            <Seg
              key={s.k}
              full={`${"short" in s ? s.short : s.name} ${p}%`}
              short={`${p}%`}
              bg={`var(--${s.v})`}
              fg={`var(--on-${s.v})`}
              style={{ flex: `${count} 1 0`, opacity: hl && hl !== s.k ? 0.28 : 1 }}
              className="last:rounded-r-[4px]"
              label={`${LANG[l]}, ${s.name}: ${count} of ${R[l].n} words`}
              tip={{ color: `var(--${s.v})`, value: `${count} words · ${p}%`, label: `${LANG[l]} · ${s.name}`, lines: [(R[l].examples[s.k] ?? []).join(" · ")] }}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <TipProvider>
      <Figure
        n={n}
        id="fig-register"
        title={`Each language layers its vocabulary differently: Telugu is ${share("te", "S")}% Sanskritic, Hindi stacks three layers, English is ${share("en", "N")}% native`}
        caption={caption}
        table={
          <Table
            head={["Language", ...SERIES.map((s) => s.name), "Words"]}
            rows={["en", "hi", "te"].map((l) => [
              LANG[l], ...SERIES.map((s) => (R[l].counts[s.k] ? `${R[l].counts[s.k]} (${pct(R[l].counts[s.k], R[l].n)}%)` : "—")), R[l].n,
            ])}
          />
        }
      >
        <Legend items={SERIES.map((s) => ({ k: s.k, name: s.name, color: `var(--${s.v})` }))} onHover={setHl} />
        <p className="kicker mb-3">Indo-European</p>
        {row("en")}
        {row("hi")}
        <div className="border-t-[1.5px] border-dashed border-line-2 my-5" />
        <p className="kicker mb-3">Dravidian</p>
        {row("te")}
      </Figure>
    </TipProvider>
  );
}

/* ── Figure: affix function × language ───────────────────────────────────── */
export function HeatFigure({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  return (
    <TipProvider>
      <HeatInner n={n} c={c} caption={caption} />
    </TipProvider>
  );
}

function HeatInner({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  const bind = useBind();
  const H = c.heat, T = c.affixTotals;
  const agent = H.find((r) => r.id === "fn:AG");
  const langs = ["en", "hi", "te"] as const;
  return (
    <Figure
      n={n}
      id="fig-affixes"
      title={agent ? `Agent suffixes: English ${agent.en.length}, Hindi ${agent.hi.length}, Telugu ${agent.te.length}` : "Affixes by function and language"}
      caption={caption}
      table={
        <table className="w-full text-[14px]" style={{ borderCollapse: "collapse" }}>
          <thead><tr>{["Function", "English", "Hindi", "Telugu"].map((h) => <th key={h} className="py-2.5 pr-4 text-left font-semibold border-b-2 border-ink">{h}</th>)}</tr></thead>
          <tbody>
            {H.map((r) => (
              <tr key={r.id}>
                <td className="py-2.5 pr-4 border-b border-line font-medium">{r.label}</td>
                {langs.map((l) => <td key={l} lang={l === "en" ? undefined : l} className="py-2.5 pr-4 border-b border-line text-ink-2">{r[l].length ? `${r[l].length} — ${r[l].join(" ")}` : "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] gap-[2px]" style={{ gridTemplateColumns: "minmax(8rem,13rem) repeat(2,minmax(0,1fr)) 1.4rem minmax(0,1fr)" }}>
          <div />
          <div className="kicker pb-2 pl-1.5" style={{ gridColumn: "2 / 4" }}>Indo-European</div>
          <div />
          <div className="kicker pb-2 pl-1.5">Dravidian</div>
          <div />
          {(["en", "hi"] as const).map((l) => (
            <div key={l} className="pb-2 pl-1.5 text-[13px] font-semibold leading-tight">{LANG[l]}<span className="mono block text-[11px] font-normal text-muted mt-0.5">{T[l]} affixes</span></div>
          ))}
          <div />
          <div className="pb-2 pl-1.5 text-[13px] font-semibold leading-tight">Telugu<span className="mono block text-[11px] font-normal text-muted mt-0.5">{T.te} affixes</span></div>

          {H.map((r) => (
            <HeatRow key={r.id} r={r} bind={bind} />
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-[3px] text-[12px] text-muted">
        <span className="mr-2">Affixes per cell</span>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span key={i} className="grid h-[14px] w-[26px] place-items-center rounded-[2px] text-[9.5px] font-semibold" style={{ background: `var(--h${i})`, color: `var(--on-h${i})` }}>{i}</span>
        ))}
      </div>
    </Figure>
  );
}

function HeatRow({ r, bind }: { r: Census["heat"][number]; bind: Bind }) {
  return (
    <>
      <div className="flex min-h-[30px] items-center pr-2.5 text-[13px] leading-tight text-ink-2">{r.label}</div>
      {(["en", "hi", "te"] as const).map((l, i) => {
        const count = r[l].length;
        const cell = (
          <div
            key={l}
            {...bind({ color: count ? `var(--h${Math.min(count, 7)})` : "var(--line-2)", value: `${count} ${count === 1 ? "affix" : "affixes"}`, label: `${r.label} · ${LANG[l]}`, lines: [count ? r[l].join("   ") : "none in this dataset"] })}
            role="img"
            aria-label={`${r.label}, ${LANG[l]}: ${count} affixes`}
            className="grid min-h-[30px] place-items-center rounded-[3px] text-[12.5px] font-semibold tnum hover:shadow-[inset_0_0_0_2px_var(--ink)] focus-visible:shadow-[inset_0_0_0_2px_var(--ink)]"
            style={count ? { background: `var(--h${Math.min(count, 7)})`, color: `var(--on-h${Math.min(count, 7)})` } : { boxShadow: "inset 0 0 0 1px var(--line)", color: "var(--line-2)" }}
          >
            {count || "–"}
          </div>
        );
        return i === 2 ? (
          <span key={l} style={{ display: "contents" }}>
            <div className="ml-1/2 border-l-[1.5px] border-dashed border-line-2" style={{ marginLeft: "50%" }} />
            {cell}
          </span>
        ) : cell;
      })}
    </>
  );
}

/* ── Figure: edge types, within vs across families ───────────────────────── */
const EDGE_NAME: Record<string, [string, string]> = {
  INHERITED: ["Inherited", "handed down in a family"],
  BORROWED: ["Borrowed", "taken from another language"],
  COGNATE: ["Cognate", "shared ancestor"],
  DERIVED: ["Derived", "built within a language"],
};

export function EdgeFigure({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  return (
    <TipProvider>
      <EdgeInner n={n} c={c} caption={caption} />
    </TipProvider>
  );
}

function EdgeInner({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  const E = c.edgeTypes;
  const crossTotal = E.reduce((a, e) => a + e.crosses, 0);
  const onlyBorrowed = E.every((e) => e.crosses === 0 || e.type === "BORROWED");
  const AX = 45;
  const ticks = [0, 10, 20, 30, 40];
  return (
    <Figure
      n={n}
      id="fig-edges"
      title={onlyBorrowed ? `All ${crossTotal} edges that cross a family boundary are borrowings` : `${crossTotal} edges cross a family boundary`}
      caption={caption}
      table={
        <Table
          head={["Edge type", "Within one family", "Across a boundary", "Total", "Contested"]}
          rows={E.map((e) => [(EDGE_NAME[e.type] ?? [e.type])[0], e.within, e.crosses, e.within + e.crosses, e.contested])}
        />
      }
    >
      <Legend items={[{ k: "w", name: "Stays within one family", color: "var(--neutral)" }, { k: "c", name: "Crosses a family boundary", color: "var(--cross)" }]} />
      <div className="relative pb-8">
        <div className="pointer-events-none absolute right-0 top-0 hidden sm:block" style={{ left: "8.2rem", bottom: "2rem" }} aria-hidden="true">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-y-0 border-l border-line" style={{ left: `${(t / AX) * 100}%` }}>
              <span className="mono absolute top-full mt-1.5 -translate-x-1/2 text-[10.5px] text-muted">{t}</span>
            </div>
          ))}
        </div>
        {E.map((e) => {
          const tot = e.within + e.crosses;
          const nm = EDGE_NAME[e.type] ?? [e.type, ""];
          return (
            <div key={e.type} className="relative grid items-center sm:grid-cols-[8.2rem_minmax(0,1fr)] gap-x-0 gap-y-1.5 py-3">
              <div className="pr-3 text-[13.5px] font-semibold leading-tight">
                {nm[0]}
                <span className="block text-[11px] font-normal text-muted mt-0.5">{nm[1]}</span>
              </div>
              <div className="flex items-center">
                <div className="flex h-[22px] gap-[2px]" style={{ width: `${(tot / AX) * 100}%` }}>
                  {(["within", "crosses"] as const).map((k) => {
                    if (!e[k]) return null;
                    const css = k === "within" ? "neutral" : "cross";
                    const lab = k === "within" ? "within one family" : "across a family boundary";
                    return (
                      <Seg
                        key={k}
                        full={String(e[k])}
                        bg={`var(--${css})`}
                        fg={`var(--on-${css})`}
                        style={{ flex: `${e[k]} 1 0` }}
                        className="last:rounded-r-[4px]"
                        label={`${nm[0]}, ${lab}: ${e[k]} edges`}
                        tip={{ color: `var(--${css})`, value: `${e[k]} edges`, label: `${nm[0]} · ${lab}`, lines: [e.contested ? `† ${e.contested} of this type are contested` : ""] }}
                      />
                    );
                  })}
                </div>
                <span className="mono ml-2.5 whitespace-nowrap text-[12px] text-ink-2">{e.crosses ? `${tot} · ${e.crosses} across` : tot}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-2 text-[13.5px]">
        <span className="kicker mr-1">Sample crossings</span>
        {c.crossExamples.map((x) => (
          <span key={x} className="rounded-full border border-line px-3 py-0.5">{x}</span>
        ))}
      </div>
    </Figure>
  );
}

/* ── Figure: confidence ──────────────────────────────────────────────────── */
export function ConfFigure({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  return (
    <TipProvider>
      <ConfInner n={n} c={c} caption={caption} />
    </TipProvider>
  );
}

function ConfInner({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  const C = c.conf, AX = 25, H = 200;
  const maxCont = Math.max(...C.filter((x) => x.contested).map((x) => x.bin));
  const accTot = C.reduce((a, x) => a + x.accepted, 0);
  const accHi = C.filter((x) => x.bin >= 0.7).reduce((a, x) => a + x.accepted, 0);
  const top = Math.max(...C.map((x) => x.accepted + x.contested));
  const bind = useBind();
  return (
    <Figure
      n={n}
      id="fig-confidence"
      title={`Every contested edge scores ${maxCont.toFixed(2)} or lower; ${accHi} of ${accTot} accepted edges score 0.70 or higher`}
      caption={caption}
      table={<Table head={["Confidence bin", "Accepted", "† Contested"]} rows={C.map((x) => [x.bin.toFixed(2), x.accepted, x.contested])} />}
    >
      <Legend items={[{ k: "a", name: "Accepted", color: "var(--neutral)" }, { k: "c", name: "† Contested", color: "var(--crit)" }]} />
      <div className="relative pl-9 pb-14">
        <div className="relative" style={{ height: H }}>
          {[0, 10, 20].map((t) => (
            <div key={t} className="absolute inset-x-0 border-t" style={{ bottom: `${(t / AX) * 100}%`, borderColor: t === 0 ? "var(--line-2)" : "var(--line)" }}>
              <span className="mono absolute right-full mr-2 -translate-y-1/2 text-[10.5px] text-muted">{t}</span>
            </div>
          ))}
          <div className="absolute inset-0 flex">
            {C.map((x) => {
              const tot = x.accepted + x.contested;
              return (
                <div key={x.bin} className="relative flex flex-1 justify-center">
                  <div className="absolute bottom-0 flex w-[min(24px,70%)] flex-col-reverse gap-[2px]">
                    {([["accepted", "neutral", "Accepted"], ["contested", "crit", "† Contested"]] as const).map(([k, css, nm]) =>
                      x[k] ? (
                        <div
                          key={k}
                          {...bind({ color: `var(--${css})`, value: `${x[k]} ${x[k] === 1 ? "edge" : "edges"}`, label: `${nm} · confidence ${x.bin.toFixed(2)}`, lines: ["Bins are values rounded to the nearest 0.05."] })}
                          role="img"
                          aria-label={`${nm}, confidence ${x.bin.toFixed(2)}: ${x[k]} edges`}
                          className="rounded-t-[4px] first:rounded-t-none last:rounded-t-[4px] hover:brightness-110 focus-visible:brightness-110"
                          style={{ height: (x[k] / AX) * H, background: `var(--${css})` }}
                        />
                      ) : null,
                    )}
                  </div>
                  {(x.contested || tot === top) ? (
                    <span className="mono absolute -translate-y-1 text-[11.5px] font-medium" style={{ bottom: (tot / AX) * H }}>
                      {x.contested ? `${x.contested}†` : tot}
                    </span>
                  ) : null}
                  <span className="mono absolute top-full mt-2 text-[10.5px] text-muted max-sm:[&:nth-of-type(odd)]:hidden">{x.bin.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mono absolute bottom-0 left-9 text-[11px] text-muted">Edges per bin, by confidence rounded to 0.05 — higher is stronger</p>
      </div>
    </Figure>
  );
}

