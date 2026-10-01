import { data } from "@/lib/data";
import { Concordance } from "@/components/concordance";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Concordance", description: "Every meaning in the Suffeffix graph with its word in English, French, Hindi, Telugu and Tamil side by side, filterable by the affix function each word uses.", path: "/lexicon/" });

export default async function LexiconPage() {
  const [rows, functions, meta] = await Promise.all([data.concepts(), data.functions(), data.meta()]);
  const counts = new Map<string, number>();
  for (const r of rows) for (const f of r.functions) counts.set(f, (counts.get(f) ?? 0) + 1);
  const fns = functions
    .filter((f) => counts.has(f.id))
    .map((f) => ({ id: f.id, label: f.label, count: counts.get(f.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <header className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-end mb-10">
        <div>
          <p className="kicker mb-3">Concordance</p>
          <h1 className="display text-[40px] sm:text-[52px] font-semibold">
            {rows.length} meanings,
            <br />
            {meta.counts.entries} words
          </h1>
        </div>
        <p className="text-[15px] leading-[1.7] text-ink-2 max-w-[54ch]">
          Every meaning in the graph, with its word in each language side by side. Affix tags carry their
          function, so a row shows at a glance whether the five languages build the meaning the same way —
          or whether one of them doesn’t derive it at all.
        </p>
      </header>
      <Concordance rows={rows} functions={fns} />
    </div>
  );
}
