import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import type { EtymologyGraph } from "@/lib/api";
import { LANG_NAME } from "@/lib/lang";
import { AcceptedTag, Confidence, ContestedTag, familyHue } from "@/components/marks";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const etym = await data.etymology();
  return Object.keys(etym).map((id) => {
    const [lang, s] = slug.entry(id);
    return { lang, slug: s };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.entry(slug.entryId(lang, s));
  if (!d) return { title: "Lineage" };
  return pageMeta({ title: `Etymology of ${d.entry.lemma.form}`, description: `The sourced etymology of ${d.entry.lemma.form}, drawn in family bands so borrowings across language families are visible, with a source and confidence on every edge.`, path: `/etymology/${lang}/${s}/` });
}

/* Family bands: every form sits in the band of its family. Inheritance and
   cognacy stay inside a band (the validator enforces it), so any edge that
   crosses a band boundary is, by construction, a borrowing or a calque. */

type Band = "ie" | "semi" | "other" | "dr";
const BAND_ORDER: Band[] = ["ie", "semi", "other", "dr"];
const BAND_LABEL: Record<Band, string> = {
  ie: "Indo-European", semi: "Semitic", other: "Unclassified / expressive", dr: "Dravidian",
};
const BAND_HUE: Record<Band, string> = { ie: "var(--ie)", semi: "var(--semi)", other: "var(--other)", dr: "var(--dr)" };

function bandOf(family: string): Band {
  if (family.startsWith("Dravidian") || family === "Reconstructed:Proto-Dravidian") return "dr";
  if (family.startsWith("IE") || family === "Reconstructed:PIE") return "ie";
  if (family === "Semitic") return "semi";
  return "other";
}

const NODE_W = 142;
const NODE_H = 54;
const COL_W = 198;
const ROW_H = 74;
const BAND_HEAD = 30;
const BAND_PAD = 14;
const LEFT = 24;

function layout(g: EtymologyGraph) {
  const key = (n: { node_ref: string | null; lang_or_family: string; form: string }) => n.node_ref ?? `${n.lang_or_family}:${n.form}`;
  const level = new Map<string, number>(g.nodes.map((n) => [n.key, 0]));
  for (let i = 0; i < g.nodes.length + 2; i++) {
    for (const e of g.edges) {
      const f = level.get(key(e.from)) ?? 0;
      const t = key(e.to);
      if ((level.get(t) ?? 0) < f + 1) level.set(t, f + 1);
    }
  }
  const bands = BAND_ORDER.filter((b) => g.nodes.some((n) => bandOf(n.family) === b));
  const slots = new Map<string, { band: Band; layer: number; row: number }>();
  const bandRows = new Map<Band, number>();
  for (const b of bands) {
    const perLayer = new Map<number, number>();
    const nodes = g.nodes.filter((n) => bandOf(n.family) === b).sort((x, y) => x.key.localeCompare(y.key));
    for (const n of nodes) {
      const L = level.get(n.key) ?? 0;
      const r = perLayer.get(L) ?? 0;
      perLayer.set(L, r + 1);
      slots.set(n.key, { band: b, layer: L, row: r });
    }
    bandRows.set(b, Math.max(1, ...perLayer.values()));
  }
  const bandTop = new Map<Band, number>();
  let y = 0;
  for (const b of bands) {
    bandTop.set(b, y);
    y += BAND_HEAD + BAND_PAD * 2 + (bandRows.get(b)! - 1) * ROW_H + NODE_H;
  }
  const maxLayer = Math.max(0, ...[...level.values()]);
  const pos = new Map<string, { x: number; y: number }>();
  for (const [k, s] of slots) {
    pos.set(k, { x: LEFT + s.layer * COL_W, y: bandTop.get(s.band)! + BAND_HEAD + BAND_PAD + s.row * ROW_H });
  }
  return { pos, key, bands, bandTop, height: y, width: LEFT * 2 + maxLayer * COL_W + NODE_W };
}

export default async function EtymologyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const id = slug.entryId(lang, s);
  const g = (await data.etymology())[id];
  const entry = await data.entry(id);
  if (!g || !entry) notFound();

  const { pos, key, bands, bandTop, height, width } = layout(g);
  const crossings = g.edges.filter((e) => bandOf(e.from.family) !== bandOf(e.to.family)).length;
  const contested = g.edges.filter((e) => e.status === "contested").length;
  const accepted = g.edges.length - contested;

  return (
    <article className="space-y-12">
      <header>
        <nav className="text-[12.5px] text-muted mb-6" aria-label="Breadcrumb">
          <Link href="/lexicon/" className="hover:text-ink">Concordance</Link>
          <span className="mx-2 text-faint">/</span>
          <Link href={slug.entryHref(id)} className="hover:text-ink">{entry.entry.lemma.form}</Link>
          <span className="mx-2 text-faint">/</span>
          <span>lineage</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-end">
          <div>
            <p className="kicker mb-3">Lineage · {LANG_NAME[entry.entry.lang]}</p>
            <h1 className="display text-[clamp(30px,9vw,60px)] font-semibold">{entry.entry.lemma.form}</h1>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg">
            {(
              [
                [g.nodes.length, "forms"],
                [crossings, crossings === 1 ? "borrowing across families" : "borrowings across families"],
                [accepted, "accepted edges"],
                [contested, "contested edges"],
              ] as [number, string][]
            ).map(([n, l]) => (
              <div key={l} className="border-t border-line pt-2">
                <div className="wide text-[28px] font-semibold tnum leading-none">{n}</div>
                <div className="text-[12px] text-muted mt-1 leading-snug">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[14.5px] leading-[1.7] text-ink-2 max-w-[70ch] mt-6">
          Each band is a language family. Inheritance and cognacy never leave their band — the validator
          rejects any edge that tries — so every line crossing a band boundary is a borrowing. Solid lines
          are accepted, where the reference works agree; dashed lines are contested and left unresolved.
        </p>
      </header>

      <div className="panel overflow-x-auto">
        <svg width={width} height={height} role="img" aria-label={`Lineage graph of ${entry.entry.lemma.form}`} style={{ minWidth: width, display: "block" }}>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0.5 L7,4 L0,7.5 z" fill="var(--muted)" />
            </marker>
            {bands.map((b) => (
              <marker key={b} id={`arr-${b}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0.5 L7,4 L0,7.5 z" fill={BAND_HUE[b]} />
              </marker>
            ))}
          </defs>

          {bands.map((b, i) => {
            const top = bandTop.get(b)!;
            const next = bands[i + 1] ? bandTop.get(bands[i + 1])! : height;
            return (
              <g key={b}>
                <rect x={0} y={top} width={width} height={next - top} fill={BAND_HUE[b]} opacity={0.045} />
                <text x={LEFT} y={top + 20} fontSize="11" fontWeight={600} fill={BAND_HUE[b]} fontFamily="var(--font-mono)" letterSpacing="0.06em">
                  {BAND_LABEL[b].toUpperCase()}
                </text>
                {i > 0 && (
                  <line x1={0} x2={width} y1={top} y2={top} stroke="var(--line-2)" strokeWidth={1.5} strokeDasharray="6 5" />
                )}
              </g>
            );
          })}

          {g.edges.map((e) => {
            const a = pos.get(key(e.from));
            const b = pos.get(key(e.to));
            if (!a || !b) return null;
            const cross = bandOf(e.from.family) !== bandOf(e.to.family);
            const toBand = bandOf(e.to.family);
            const ay = a.y + NODE_H / 2;
            const by = b.y + NODE_H / 2;
            let d: string;
            let lx: number;
            let ly: number;
            if (b.x > a.x) {
              const x1 = a.x + NODE_W;
              const x2 = b.x - 4;
              const mx = x1 + (x2 - x1) / 2;
              d = ay === by ? `M${x1},${ay} L${x2},${by}` : `M${x1},${ay} H${mx} V${by} H${x2}`;
              lx = mx;
              ly = ay === by ? ay - 8 : (ay + by) / 2;
            } else {
              const x = a.x + NODE_W / 2;
              d = `M${x},${a.y + NODE_H} V${b.y - 4}`;
              lx = x + 8;
              ly = (a.y + NODE_H + b.y) / 2;
            }
            const drift = e.drift.filter((x) => x !== "NONE");
            const label = `${e.type.toLowerCase()}${drift.length ? " · " + drift.join("/").toLowerCase() : ""}`;
            return (
              <g key={e.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={cross ? BAND_HUE[toBand] : "var(--muted)"}
                  strokeWidth={cross ? 2 : 1.25}
                  strokeDasharray={e.status === "contested" ? "5 4" : undefined}
                  markerEnd={`url(#${cross ? `arr-${toBand}` : "arr"})`}
                />
                <g transform={`translate(${lx}, ${ly})`}>
                  <rect x={-label.length * 2.9 - 5} y={-9} width={label.length * 5.8 + 10} height={16} rx={8} fill="var(--surface)" stroke="var(--line)" />
                  <text x={0} y={3} fontSize="9.5" textAnchor="middle" fill={cross ? BAND_HUE[toBand] : "var(--muted)"} fontFamily="var(--font-mono)">
                    {label}
                  </text>
                </g>
              </g>
            );
          })}

          {g.nodes.map((n) => {
            const p = pos.get(n.key);
            if (!p) return null;
            const hue = familyHue(n.family);
            const focus = n.node_ref === id;
            const form = n.form.length > 17 ? n.form.slice(0, 16) + "…" : n.form;
            const body = (
              <g>
                <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={10} fill="var(--surface)" stroke={focus ? "var(--ink)" : "var(--line-2)"} strokeWidth={focus ? 2 : 1} />
                <rect x={p.x} y={p.y + 10} width={3.5} height={NODE_H - 20} rx={1.75} fill={hue} />
                <text x={p.x + 14} y={p.y + 23} fontSize="15" fontWeight={600} fill="var(--ink)" fontFamily="var(--font-sans)">{form}</text>
                <text x={p.x + 14} y={p.y + 40} fontSize="10" fill="var(--muted)" fontFamily="var(--font-sans)">
                  {(() => {
                    const where = LANG_NAME[n.lang_or_family] ?? n.lang_or_family;
                    const t = n.gloss ? `${where} · ${n.gloss}` : where;
                    return t.length > 24 ? t.slice(0, 23) + "…" : t;
                  })()}
                </text>
              </g>
            );
            return n.node_ref?.startsWith("lex:") ? (
              <Link key={n.key} href={slug.entryHref(n.node_ref)}>{body}</Link>
            ) : (
              <g key={n.key}>{body}</g>
            );
          })}
        </svg>
      </div>

      <section>
        <h2 className="wide text-[21px] font-semibold mb-4">Every edge, with its source</h2>
        <ol className="border-y border-line divide-y divide-[var(--line)]">
          {g.edges.map((e) => {
            const cross = bandOf(e.from.family) !== bandOf(e.to.family);
            return (
              <li key={e.id} className="py-3.5 grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 items-center">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
                  <span className="font-medium" style={{ boxShadow: `inset 0 -2px 0 ${familyHue(e.from.family)}` }}>{e.from.form}</span>
                  <span className="text-[12px] text-faint">{LANG_NAME[e.from.lang_or_family] ?? e.from.lang_or_family}</span>
                  <span className="text-muted text-[12.5px] px-1">— {e.type.toLowerCase()} →</span>
                  <span className="font-medium" style={{ boxShadow: `inset 0 -2px 0 ${familyHue(e.to.family)}` }}>{e.to.form}</span>
                  <span className="text-[12px] text-faint">{LANG_NAME[e.to.lang_or_family] ?? e.to.lang_or_family}</span>
                  {cross && <span className="text-[11.5px] rounded-full border border-line px-2 text-muted">crosses families</span>}
                  {e.status === "contested" ? <ContestedTag /> : <AcceptedTag />}
                </div>
                <div className="flex items-center gap-4">
                  <span className="mono text-[11.5px] text-muted">{e.source_ref.join(", ")}</span>
                  <Confidence value={e.confidence} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}
