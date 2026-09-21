import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import type { EtymologyGraph } from "@/lib/api";
import { ContestedBadge, Confidence, familyColor } from "@/components/badges";

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
  return { title: d ? `Etymology of ${d.entry.lemma.form}` : "Etymology" };
}

const HEX: Record<string, string> = {
  "IE:Germanic": "#2f4f8f", "IE:Indo-Aryan": "#2f4f8f", "IE:Romance": "#2f4f8f", "IE:Iranian": "#2f4f8f",
  "Reconstructed:PIE": "#6b5f8a", "Reconstructed:Proto-Dravidian": "#8a6a55",
  "Dravidian:South-Central": "#8a5a12", "Dravidian:South": "#8a5a12",
  Semitic: "#4a6b3f", Other: "#7c8884",
};

const NODE_W = 196;
const COL_W = 268;
const ROW_H = 96;

function layout(g: EtymologyGraph) {
  const nodeKey = (n: { node_ref: string | null; lang_or_family: string; form: string }) =>
    n.node_ref ?? `${n.lang_or_family}:${n.form}`;
  const keys = g.nodes.map((n) => n.key);
  const level = new Map<string, number>(keys.map((k) => [k, 0]));
  for (let i = 0; i < keys.length + 2; i++) {
    for (const e of g.edges) {
      const f = level.get(nodeKey(e.from)) ?? 0;
      const t = nodeKey(e.to);
      if ((level.get(t) ?? 0) < f + 1) level.set(t, f + 1);
    }
  }
  const byLevel = new Map<number, string[]>();
  for (const k of keys) {
    const l = level.get(k) ?? 0;
    byLevel.set(l, [...(byLevel.get(l) ?? []), k]);
  }
  const pos = new Map<string, { x: number; y: number }>();
  for (const [l, ks] of byLevel) {
    ks.sort().forEach((k, i) => pos.set(k, { x: 32 + l * COL_W, y: 60 + i * ROW_H }));
  }
  return {
    pos,
    nodeKey,
    width: 64 + (Math.max(...byLevel.keys()) + 1) * COL_W,
    height: 110 + Math.max(...[...byLevel.values()].map((v) => v.length)) * ROW_H,
  };
}

export default async function EtymologyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const id = slug.entryId(lang, s);
  const g = (await data.etymology())[id];
  const entry = await data.entry(id);
  if (!g || !entry) notFound();

  const { pos, nodeKey, width, height } = layout(g);
  const families = [...new Set(g.nodes.map((n) => n.family))].sort();
  const crossings = g.edges.filter(
    (e) => familyColor(e.from.family) !== familyColor(e.to.family),
  ).length;

  return (
    <div className="space-y-12">
      <header className="max-w-[60ch]">
        <p className="label mb-4">lineage · {g.nodes.length} forms · {g.edges.length} edges</p>
        <h1 className="font-serif text-[32px] leading-tight">
          Etymology of{" "}
          <Link href={slug.entryHref(id)} className="hover:text-accent transition-colors">
            {entry.entry.lemma.form}
          </Link>
        </h1>
        <p className="mt-5 text-[14.5px] leading-[1.75] text-muted">
          Colour is family. Inheritance and cognacy never cross between colours — the validator
          rejects such an edge outright — so every colour change you see below is a borrowing or a
          calque, {crossings === 1 ? "and there is one here" : `and there are ${crossings} here`}.
          Dashed edges are contested.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 font-mono text-[11.5px]">
          {families.map((f) => (
            <span key={f} className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5" style={{ background: HEX[f] ?? HEX.Other }} />
              <span className="text-muted">{f}</span>
            </span>
          ))}
        </div>
      </header>

      <div className="overflow-x-auto -mx-6 px-6">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Etymology lineage of ${entry.entry.lemma.form}`}
          style={{ minWidth: width }}
        >
          <defs>
            <marker id="tip" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="var(--faint)" />
            </marker>
          </defs>

          {/* edges: orthogonal routing (out, across, in) — reads as a wiring
              diagram rather than a web of diagonals */}
          {g.edges.map((e) => {
            const a = pos.get(nodeKey(e.from));
            const b = pos.get(nodeKey(e.to));
            if (!a || !b) return null;
            const x1 = a.x + NODE_W;
            const x2 = b.x - 8;
            const midX = x1 + (x2 - x1) / 2;
            const d =
              a.y === b.y
                ? `M${x1},${a.y} L${x2},${b.y}`
                : `M${x1},${a.y} H${midX} V${b.y} H${x2}`;
            const drift = e.drift.filter((x) => x !== "NONE");
            return (
              <g key={e.id}>
                <path
                  d={d}
                  fill="none"
                  stroke="var(--faint)"
                  strokeWidth={1}
                  strokeDasharray={e.status === "contested" ? "3 3" : undefined}
                  markerEnd="url(#tip)"
                />
                <text
                  x={midX}
                  y={(a.y + b.y) / 2 - 7}
                  fontSize="9.5"
                  fill="var(--muted)"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  {e.type.toLowerCase()}
                  {drift.length ? ` · ${drift.join("/").toLowerCase()}` : ""}
                </text>
                <text
                  x={midX}
                  y={(a.y + b.y) / 2 + 5}
                  fontSize="8.5"
                  fill="var(--faint)"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  {e.source_ref.join(", ")} · {e.confidence.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* nodes: a coloured family rule on the left edge, form and gloss set
              in the page's own type */}
          {g.nodes.map((n) => {
            const p = pos.get(n.key);
            if (!p) return null;
            const hue = HEX[n.family] ?? HEX.Other;
            const isFocus = n.node_ref === id;
            const label = n.form.length > 23 ? n.form.slice(0, 22) + "…" : n.form;
            const body = (
              <g>
                <rect
                  x={p.x}
                  y={p.y - 26}
                  width={NODE_W}
                  height={n.gloss ? 54 : 40}
                  fill="var(--raised)"
                  stroke={isFocus ? "var(--ink)" : "var(--rule)"}
                  strokeWidth={isFocus ? 1.5 : 1}
                />
                <rect x={p.x} y={p.y - 26} width={3} height={n.gloss ? 54 : 40} fill={hue} />
                <text x={p.x + 14} y={p.y - 7} fontSize="15" fill="var(--ink)" fontFamily="var(--font-serif)">
                  {label}
                </text>
                <text x={p.x + 14} y={p.y + 8} fontSize="9" fill={hue} fontFamily="var(--font-mono)">
                  {n.lang_or_family}
                </text>
                {n.gloss && (
                  <text x={p.x + 14} y={p.y + 21} fontSize="9.5" fill="var(--muted)" fontFamily="var(--font-serif)">
                    {n.gloss.length > 30 ? n.gloss.slice(0, 29) + "…" : n.gloss}
                  </text>
                )}
              </g>
            );
            return n.node_ref?.startsWith("lex:") ? (
              <Link key={n.key} href={slug.entryHref(n.node_ref)}>
                {body}
              </Link>
            ) : (
              <g key={n.key}>{body}</g>
            );
          })}
        </svg>
      </div>

      <section>
        <h2 className="font-serif text-[15px] mb-4" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Every edge, with its source
        </h2>
        <ul>
          {g.edges.map((e) => (
            <li
              key={e.id}
              className="grid sm:grid-cols-[7rem_1fr_auto] gap-x-5 gap-y-1 py-3 items-baseline"
              style={{ borderTop: "1px solid var(--rule)" }}
            >
              <span
                className="text-[11px] tracking-[0.07em] text-faint"
                style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
              >
                {e.type}
              </span>
              <span className="text-[15px] leading-snug">
                <span style={{ color: HEX[e.from.family] ?? HEX.Other }}>{e.from.form}</span>
                <span className="text-faint mx-2">→</span>
                <span style={{ color: HEX[e.to.family] ?? HEX.Other }}>{e.to.form}</span>
                {e.status === "contested" && <span className="ml-2.5"><ContestedBadge /></span>}
              </span>
              <span className="flex items-baseline gap-3 sm:justify-end">
                <span className="font-mono text-[10.5px] text-faint">{e.source_ref.join(", ")}</span>
                <Confidence value={e.confidence} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
