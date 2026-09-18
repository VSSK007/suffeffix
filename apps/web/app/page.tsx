import Link from "next/link";
import { data, slug } from "@/lib/data";
import { SearchBox } from "@/components/search-box";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border hairline rounded-md p-4 bg-card">
      <div className="font-mono text-[26px] tnum leading-none">{value}</div>
      <div className="text-[11.5px] text-muted mt-2 leading-snug">{label}</div>
    </div>
  );
}

const SHOWCASE = [
  { id: "lex:te:mancitanam", form: "మంచితనం", note: "మంచి + -తనం → STATE_OF(GOOD)" },
  { id: "lex:hi:bacpan", form: "बचपन", note: "बच्चा + -पन → STATE_OF(CHILD)" },
  { id: "lex:en:hopeless", form: "hopeless", note: "hope + -less, privative" },
  { id: "lex:en:sugar", form: "sugar", note: "śarkarā → Persian → Arabic → Latin → French → English" },
];

export default async function Home() {
  const meta = await data.meta();
  const c = meta.counts;
  return (
    <div className="space-y-14">
      <section className="pt-4">
        <p className="eyebrow mb-3">English · Telugu · Hindi</p>
        <h1 className="text-[40px] leading-[1.1] max-w-2xl">
          An explainable lexical knowledge&nbsp;graph
        </h1>
        <p className="max-w-[62ch] text-muted leading-relaxed mt-4 text-[15.5px]">
          Suffeffix jointly represents <em className="text-ink">morphology</em>,{" "}
          <em className="text-ink">semantic decomposition</em>, <em className="text-ink">etymology</em>, and{" "}
          <em className="text-ink">affix alignment</em>. Every fact carries an epistemic status, a source, and
          a review state; every explanation carries its trace.
        </p>
      </section>

      <SearchBox autoFocus />

      <section>
        <p className="eyebrow mb-3">Start somewhere</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SHOWCASE.map((s) => (
            <Link key={s.id} href={slug.entryHref(s.id)}
              className="border hairline rounded-md p-4 bg-card hover:border-accent transition-colors">
              <div className="text-[19px]">{s.form}</div>
              <div className="text-[11.5px] text-muted mt-1.5 font-mono leading-snug">{s.note}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline gap-4 flex-wrap mb-3">
          <h2 className="text-xl">The dataset, honestly counted</h2>
          <span className="text-[11.5px] text-muted">
            review status: {Object.entries(meta.review_status).map(([k, v]) => `${k} ${v}`).join(" · ")}
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat value={c.entries}
            label={`lexical entries — en ${c.entries_by_lang.en} · te ${c.entries_by_lang.te} · hi ${c.entries_by_lang.hi}`} />
          <Stat value={c.affixes as number} label={`affixes across ${c.affix_functions as number} functions and ${c.equivalence_classes as number} equivalence classes`} />
          <Stat value={c.atoms as number} label="semantic atoms — an engineering interlingua seeded from NSM primes" />
          <Stat value={c.etymology_edges as number} label={`sourced etymology edges — ${c.contested_edges as number} stored as contested, never resolved`} />
        </div>
        <p className="text-xs text-muted mt-3 max-w-[70ch] leading-relaxed">
          Nearly everything ships as <span className="font-mono">draft</span>: authored against the reference
          works in the bibliography, awaiting item-by-item review. Contested etymologies stay contested and
          are badged wherever they appear.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {[
          ["/lexicon/", "Lexical Explorer", "Morphological segmentation, atom decomposition, etymology, and aligned forms in the other two languages — with a traced, generated explanation."],
          ["/affixes/", "Affix Atlas", "Browse affixes by language or by function. A function × language matrix shows equivalence classes; each affix lists register, productivity, allomorphs, and cross-lingual equivalents."],
          ["/atoms/", "Semantic Atom Explorer", "The bounded interlingua: 50 atoms, each with a definition, per-language exponents, and relations. NSM primes are marked as such."],
          ["/lexicon/en/sugar/", "Etymology View", "Family-safe lineage graphs: inheritance and cognacy never cross the Indo-European / Dravidian boundary; borrowings do, with sources and confidence on every edge."],
        ].map(([href, title, desc]) => (
          <Link key={href} href={href} className="group border hairline rounded-md p-5 bg-card hover:border-accent transition-colors">
            <h3 className="font-serif text-[19px] group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-[13.5px] text-muted leading-relaxed mt-2">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
