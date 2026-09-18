import Link from "next/link";
import { notFound } from "next/navigation";
import { api, type EtymologyGraph } from "@/lib/api";
import { ContestedBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

const FAMILY_COLOR: Record<string, string> = {
  "IE:Germanic": "#3b3bb3",
  "IE:Indo-Aryan": "#8a2f9e",
  "IE:Romance": "#1f6f8b",
  "IE:Iranian": "#2e7d5b",
  "Dravidian:South-Central": "#b3542f",
  "Dravidian:South": "#b3542f",
  Semitic: "#6b6b1f",
  "Reconstructed:PIE": "#555577",
  "Reconstructed:Proto-Dravidian": "#775544",
  Other: "#777777",
};

// simple layered DAG layout: longest-path layering, one column per layer
function layout(g: EtymologyGraph) {
  const keys = g.nodes.map((n) => n.key);
  const level = new Map<string, number>(keys.map((k) => [k, 0]));
  // iterate to convergence (graph is tiny)
  for (let i = 0; i < keys.length + 2; i++) {
    for (const e of g.edges) {
      const f = level.get(e.from.node_ref ?? `${e.from.lang_or_family}:${e.from.form}`) ?? 0;
      const tKey = e.to.node_ref ?? `${e.to.lang_or_family}:${e.to.form}`;
      if ((level.get(tKey) ?? 0) < f + 1) level.set(tKey, f + 1);
    }
  }
  const byLevel = new Map<number, string[]>();
  for (const k of keys) {
    const l = level.get(k) ?? 0;
    byLevel.set(l, [...(byLevel.get(l) ?? []), k]);
  }
  const pos = new Map<string, { x: number; y: number }>();
  const colW = 240, rowH = 84;
  for (const [l, ks] of byLevel) {
    ks.sort().forEach((k, i) => pos.set(k, { x: 40 + l * colW, y: 50 + i * rowH }));
  }
  const width = 80 + (Math.max(...[...byLevel.keys()]) + 1) * colW;
  const height = 80 + Math.max(...[...byLevel.values()].map((v) => v.length)) * rowH;
  return { pos, width, height };
}

export default async function EtymologyPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  let g: EtymologyGraph;
  try {
    g = await api.etymology(decodeURIComponent(entryId));
  } catch {
    notFound();
  }
  const { pos, width, height } = layout(g);
  const key = (n: { node_ref: string | null; lang_or_family: string; form: string }) =>
    n.node_ref ?? `${n.lang_or_family}:${n.form}`;
  const families = [...new Set(g.nodes.map((n) => n.family))];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl">Etymology lineage</h1>
        <p className="font-mono text-xs text-neutral-400">{g.entry_id}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs">
          {families.map((f) => (
            <span key={f} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: FAMILY_COLOR[f] ?? "#777" }} />
              {f}
            </span>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Cognate and inheritance edges never cross a top-level family boundary; cross-family links are
          borrowings or calques only. Dashed edges are contested.
        </p>
      </header>

      <div className="overflow-x-auto border border-neutral-300 rounded bg-white">
        <svg width={width} height={height} role="img" aria-label="Etymology lineage graph">
          {g.edges.map((e) => {
            const a = pos.get(key(e.from)), b = pos.get(key(e.to));
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const drift = e.drift.filter((d) => d !== "NONE");
            return (
              <g key={e.id}>
                <line x1={a.x + 90} y1={a.y} x2={b.x - 10} y2={b.y} stroke="#999"
                  strokeDasharray={e.status === "contested" ? "4 3" : undefined} markerEnd="url(#arrow)" />
                <text x={mx + 40} y={my - 6} fontSize="9" fill="#666" fontFamily="monospace" textAnchor="middle">
                  {e.type.toLowerCase()}{drift.length ? ` · ${drift.join("/").toLowerCase()}` : ""} · {e.confidence.toFixed(2)}
                  {e.status === "contested" ? " · contested" : ""}
                </text>
                <text x={mx + 40} y={my + 6} fontSize="8" fill="#999" fontFamily="monospace" textAnchor="middle">
                  [{e.source_ref.join(", ")}]
                </text>
              </g>
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#999" />
            </marker>
          </defs>
          {g.nodes.map((n) => {
            const p = pos.get(n.key);
            if (!p) return null;
            const color = FAMILY_COLOR[n.family] ?? "#777";
            const label = n.form.length > 22 ? n.form.slice(0, 21) + "…" : n.form;
            const inner = (
              <g>
                <rect x={p.x - 8} y={p.y - 24} width={196} height={n.gloss ? 48 : 36} rx={4}
                  fill="white" stroke={color} strokeWidth={n.node_ref === g.entry_id ? 2.5 : 1.2} />
                <text x={p.x + 2} y={p.y - 7} fontSize="13">{label}</text>
                <text x={p.x + 2} y={p.y + 6} fontSize="8" fill={color} fontFamily="monospace">
                  {n.lang_or_family}
                </text>
                {n.gloss && (
                  <text x={p.x + 2} y={p.y + 17} fontSize="8" fill="#888">
                    ‘{n.gloss.length > 30 ? n.gloss.slice(0, 29) + "…" : n.gloss}’
                  </text>
                )}
              </g>
            );
            return n.node_ref?.startsWith("lex:") ? (
              <Link key={n.key} href={`/lexicon/${encodeURIComponent(n.node_ref)}`}>{inner}</Link>
            ) : (
              <g key={n.key}>{inner}</g>
            );
          })}
        </svg>
      </div>

      <section>
        <h2 className="text-lg mb-2">Edges</h2>
        <ul className="space-y-1 text-sm">
          {g.edges.map((e) => (
            <li key={e.id} className="flex flex-wrap gap-2 items-baseline">
              <span className="font-mono text-xs text-neutral-500">{e.type}</span>
              <span>{e.from.form} → {e.to.form}</span>
              <span className="font-mono text-[11px] text-neutral-500">conf {e.confidence.toFixed(2)} [{e.source_ref.join(", ")}]</span>
              {e.status === "contested" && <ContestedBadge />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
