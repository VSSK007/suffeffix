import type { Census } from "@/lib/census";
import { Figure } from "./figure";

interface N { key: string; x: number; y: number; title: string; sub: string; layer: "morph" | "sem" | "ety" }
const W = 190, H = 68;

const LAYER: Record<N["layer"], string> = { morph: "var(--s1)", sem: "var(--s3)", ety: "var(--s2)" };

/** The graph's node types and the relations between them, drawn as a wiring
 *  diagram. Counts come from the dataset, so the figure cannot drift from it. */
export function SchemaFigure({ n, c, caption }: { n: number; c: Census; caption: React.ReactNode }) {
  const nodes: N[] = [
    { key: "entry", x: 385, y: 166, title: "LexicalEntry", sub: `${c.entries} words`, layer: "morph" },
    { key: "affix", x: 40, y: 40, title: "Affix", sub: `${c.counts.affixes} affixes`, layer: "morph" },
    { key: "fn", x: 40, y: 166, title: "AffixFunction", sub: `${c.counts.functions} functions`, layer: "morph" },
    { key: "eq", x: 40, y: 292, title: "EquivalenceClass", sub: `${c.counts.classes} classes`, layer: "morph" },
    { key: "concept", x: 730, y: 40, title: "Concept", sub: `${c.counts.concepts} meanings`, layer: "sem" },
    { key: "atom", x: 730, y: 166, title: "SemanticAtom", sub: `${c.counts.atoms} atoms`, layer: "sem" },
    { key: "edge", x: 385, y: 292, title: "EtymologyEdge", sub: `${c.edgeTotal} edges`, layer: "ety" },
    { key: "root", x: 730, y: 292, title: "Root", sub: `${c.counts.roots} reconstructed roots`, layer: "ety" },
  ];
  const arrows: { d: string; label: string; lx: number; ly: number; anchor?: "middle" | "start" }[] = [
    { d: "M385,190 H308 V74 H232", label: "uses, with a function", lx: 318, ly: 128, anchor: "start" },
    { d: "M135,108 V164", label: "performs", lx: 145, ly: 140, anchor: "start" },
    { d: "M135,290 V236", label: "one class per function", lx: 145, ly: 268, anchor: "start" },
    { d: "M575,190 H652 V74 H728", label: "expresses", lx: 690, ly: 64, anchor: "middle" },
    { d: "M825,108 V164", label: "decomposed into", lx: 835, ly: 140, anchor: "start" },
    { d: "M480,234 V290", label: "has a history", lx: 490, ly: 268, anchor: "start" },
    { d: "M575,326 H728", label: "traces to", lx: 652, ly: 318, anchor: "middle" },
  ];
  return (
    <Figure
      n={n}
      id="fig-schema"
      tableOnMobile
      title="Eight node types, three layers: morphology, semantics and etymology meet at the word"
      caption={caption}
      table={
        <table className="w-full text-[14px]" style={{ borderCollapse: "collapse" }}>
          <thead><tr>{["Node type", "Layer", "Records"].map((h, i) => <th key={h} className={`py-2.5 pr-4 font-semibold border-b-2 border-ink ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead>
          <tbody>
            {nodes.map((x) => (
              <tr key={x.key}>
                <td className="py-2.5 pr-4 border-b border-line font-medium mono text-[13px]">{x.title}</td>
                <td className="py-2.5 pr-4 border-b border-line text-ink-2">{x.layer === "morph" ? "Morphology" : x.layer === "sem" ? "Semantics" : "Etymology"}</td>
                <td className="py-2.5 pr-4 border-b border-line text-ink-2 text-right tnum">{x.sub}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
        {(["morph", "sem", "ety"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-2 text-[12.5px] text-ink-2">
            <span className="h-3 w-3 rounded-[3px]" style={{ background: LAYER[k] }} />
            {k === "morph" ? "Morphology" : k === "sem" ? "Semantics" : "Etymology"}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 960 400" role="img" aria-label="Schema diagram: a lexical entry uses affixes, expresses a concept, and has etymology edges" className="w-full min-w-[640px]" style={{ display: "block" }}>
          <defs>
            <marker id="sch-arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0.5 L7,4 L0,7.5 z" fill="var(--muted)" />
            </marker>
          </defs>
          {arrows.map((a) => (
            <g key={a.d}>
              <path d={a.d} fill="none" stroke="var(--muted)" strokeWidth="1.4" markerEnd="url(#sch-arr)" />
              <text x={a.lx} y={a.ly} fontSize="11" fill="var(--muted)" textAnchor={a.anchor ?? "middle"} style={{ font: "400 11px var(--font-sans)" }}>{a.label}</text>
            </g>
          ))}
          {nodes.map((x) => (
            <g key={x.key}>
              <rect x={x.x} y={x.y} width={W} height={H} rx="12" fill="var(--bg)" stroke={x.key === "entry" ? "var(--ink)" : "var(--line-2)"} strokeWidth={x.key === "entry" ? 2 : 1.2} />
              <rect x={x.x} y={x.y + 12} width="4" height={H - 24} rx="2" fill={LAYER[x.layer]} />
              <text x={x.x + 18} y={x.y + 30} style={{ font: "600 14.5px var(--font-mono)" }} fill="var(--ink)">{x.title}</text>
              <text x={x.x + 18} y={x.y + 52} style={{ font: "400 12.5px var(--font-sans)" }} fill="var(--muted)">{x.sub}</text>
            </g>
          ))}
        </svg>
      </div>
    </Figure>
  );
}
