import Link from "next/link";
import { api, type Meta } from "@/lib/api";
import { SearchBox } from "@/components/search-box";

export const dynamic = "force-dynamic";

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-neutral-300 rounded p-3">
      <div className="font-mono text-2xl">{value}</div>
      <div className="text-xs text-neutral-600">{label}</div>
    </div>
  );
}

export default async function Home() {
  let meta: Meta | null = null;
  try {
    meta = await api.meta();
  } catch {
    meta = null;
  }
  const c = meta?.counts;
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl mb-2">An explainable lexical knowledge graph</h1>
        <p className="max-w-2xl text-neutral-700 leading-relaxed">
          Suffeffix jointly represents <em>morphology</em>, <em>semantic decomposition</em>,{" "}
          <em>etymology</em>, and <em>affix alignment</em> for English, Telugu, and Hindi. Every fact
          carries an epistemic status, a source, and a review state; every explanation carries its trace.
        </p>
      </section>

      <SearchBox />

      {meta && c ? (
        <section>
          <h2 className="text-lg mb-3">Dataset, honestly counted</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Count label={`lexical entries (en ${c.entries_by_lang.en} · te ${c.entries_by_lang.te} · hi ${c.entries_by_lang.hi})`} value={c.entries} />
            <Count label="affixes" value={c.affixes as number} />
            <Count label="semantic atoms" value={c.atoms as number} />
            <Count label={`etymology edges (${c.contested_edges as number} contested)`} value={c.etymology_edges as number} />
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Review status: {Object.entries(meta.review_status).map(([k, v]) => `${k} ${v}`).join(" · ")} — nearly
            everything ships as <span className="font-mono">draft</span>; see{" "}
            <Link href="/about" className="underline">About</Link> for what that means.
          </p>
        </section>
      ) : (
        <p className="text-sm text-red-700">API unreachable — run <code className="font-mono">make api</code>.</p>
      )}

      <section className="grid sm:grid-cols-2 gap-4">
        {[
          ["/lexicon", "Lexical Explorer", "Morphology, atoms, etymology and aligned forms for each word, with a traced explanation."],
          ["/affixes", "Affix Atlas", "Affixes by language and function, with register, productivity, and cross-lingual equivalence classes."],
          ["/atoms", "Semantic Atom Explorer", "The bounded atom interlingua: definitions, per-language exponents, relationships."],
          ["/lexicon/lex%3Aen%3Asugar", "Etymology View", "Lineage graphs with family boundaries, drift labels, sources, and contested badges — try sugar."],
        ].map(([href, title, desc]) => (
          <Link key={href} href={href} className="border border-neutral-300 rounded p-4 hover:border-accent">
            <h3 className="font-serif text-lg mb-1">{title}</h3>
            <p className="text-sm text-neutral-600">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
