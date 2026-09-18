import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import type { EtymologyGraph } from "@/lib/api";
import { ContestedBadge } from "@/components/badges";

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

const FAMILY_COLOR: Record<string, string> = {
  "IE:Germanic": "#4649c0",
  "IE:Indo-Aryan": "#9a3cb0",
  "IE:Romance": "#22799e",
  "IE:Iranian": "#2e8a68",
  "Dravidian:South-Central": "#c06236",
  "Dravidian:South": "#c06236",
  Semitic: "#8a8a2a",
  "Reconstructed:PIE": "#6b6b99",
  "Reconstructed:Proto-Dravidian": "#8a6a55",
  Other: "#808088",
};

function layout(g: EtymologyGraph) {
  const keys = g.nodes.map((n) => n.key);
  const level = new Map<string, number>(keys.map((k) => [k, 0]));
  const nodeKey = (n: { node_ref: string | null; lang_or_family: string; form: string }) =>
    n.node_ref ?? `${n.lang_or_family}:${n.form}`;
  for (let i = 0; i < keys.length + 2; i++) {
    for (const e of g.edges) {
      const f = level.get(nodeKey(e.from)) ?? 0;
      const tKey = nodeKey(e.to);
      if ((level.get(tKey) ?? 0) < f + 1) level.set(tKey, f + 1);
    }
  }
  const byLevel = new Map<number, string[]>();
  for (const k of keys) {
    const l = level.get(k) ?? 0;
    byLevel.set(l, [...(byLevel.get(l) ?? []), k]);
  }
  const pos = new Map<string, { x: number; y: number }>();
  const colW = 250, rowH = 92;
  for (const [l, ks] of byLevel) {
    ks.sort().forEach((k, i) => pos.set(k, { x: 40 + l * colW, y: 56 + i * rowH }));
  }
  return {
    pos,
    width: 100 + (Math.max(...byLevel.keys()) + 1) * colW,
    height: 90 + Math.max(...[...byLevel.values()].map((v) => v.length)) * rowH,
    nodeKey,
  };
}

export default async function EtymologyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const id = slug.entryId(lang, s);
  const g = (await data.etymology())[id];
  const entry = await data.entry(id);
  if (!g || !entry) notFound();
  const { pos, width, height, nodeKey } = layout(g);
  const families = [...new Set(g.nodes.map((n) => n.family))];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2">lineage graph</p>
        <h1 className="text-3xl">
          Etymology of{" "}
          <Link href={slug.entryHref(id)} className="hover:text-accent transition-colors">
            {entry.entry.lemma.form}
          </Link>
        </h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 text-[11.5px] text-muted">
          {families.map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: FAMILY_COLOR[f] ?? "#808088" }} />
              {f}
            </span>
          ))}
        </div>
        <p className="text-[12.5px] text-muted mt-2 max-w-[68ch] leading-relaxed">
          Inheritance and cognacy never cross a top-level family boundary — the validator rejects such edges.
          Cross-family links are borrowings or calques only. Dashed edges are contested.
        </p>
      </header>

      <div className="overflow-x-auto border hairline rounded-md bg-card">
        <svg width={width} height={height} role="img" aria-label={`Etymology lineage of ${entry.entry.lemma.form}`}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="var(--muted)" />
            </marker>
          </defs>
          {g.edges.map((e) => {
            const a = pos.get(nodeKey(e.from)), b = pos.get(nodeKey(e.to));
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2 + 45, my = (a.y + b.y) / 2;
            const drift = e.drift.filter((d) => d !== "NONE");
            return (
              <g key={e.id}>
                <line x1={a.x + 100} y1={a.y} x2={b.x - 12} y2={b.y} stroke="var(--muted)" strokeWidth={1}
                  strokeDasharray={e.status === "contested" ? "4 3" : undefined} markerEnd="url(#arrow)" />
                <text x={mx} y={my - 6} fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)" textAnchor="middle">
                  {e.type.toLowerCase()}{drift.length ? ` · ${drift.join("/").toLowerCase()}` : ""} · {e.confidence.toFixed(2)}
                  {e.status === "contested" ? " · contested" : ""}
                </text>
                <text x={mx} y={my + 6} fontSize="8" fill="var(--muted)" opacity={0.75} fontFamily="var(--font-mono)" textAnchor="middle">
                  [{e.source_ref.join(", ")}]
                </text>
              </g>
            );
          })}
          {g.nodes.map((n) => {
            const p = pos.get(n.key);
            if (!p) return null;
            const color = FAMILY_COLOR[n.family] ?? "#808088";
            const label = n.form.length > 24 ? n.form.slice(0, 23) + "…" : n.form;
            const inner = (
              <g>
                <rect x={p.x - 10} y={p.y - 26} width={210} height={n.gloss ? 52 : 40} rx={5}
                  fill="var(--card)" stroke={color} strokeWidth={n.node_ref === id ? 2.5 : 1.2} />
                <text x={p.x + 2} y={p.y - 8} fontSize="14" fill="var(--ink)">{label}</text>
                <text x={p.x + 2} y={p.y + 6} fontSize="8.5" fill={color} fontFamily="var(--font-mono)">
                  {n.lang_or_family}
                </text>
                {n.gloss && (
                  <text x={p.x + 2} y={p.y + 18} fontSize="8.5" fill="var(--muted)">
                    ‘{n.gloss.length > 34 ? n.gloss.slice(0, 33) + "…" : n.gloss}’
                  </text>
                )}
              </g>
            );
            return n.node_ref?.startsWith("lex:") ? (
              <Link key={n.key} href={slug.entryHref(n.node_ref)}>{inner}</Link>
            ) : (
              <g key={n.key}>{inner}</g>
            );
          })}
        </svg>
      </div>

      <section>
        <h2 className="text-xl mb-3">Every edge, with its source</h2>
        <ul className="space-y-1.5 text-[14px]">
          {g.edges.map((e) => (
            <li key={e.id} className="flex flex-wrap gap-x-2.5 gap-y-0.5 items-baseline">
              <span className="font-mono text-[10.5px] text-muted w-24">{e.type}</span>
              <span>{e.from.form} → {e.to.form}</span>
              <span className="font-mono text-[10.5px] text-muted tnum">
                conf {e.confidence.toFixed(2)} · [{e.source_ref.join(", ")}]
              </span>
              {e.status === "contested" && <ContestedBadge />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
