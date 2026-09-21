import { EpiBadge } from "@/components/badges";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="space-y-16">
      <header className="max-w-[58ch]">
        <p className="label mb-4">what this is, and what it refuses to be</p>
        <h1 className="font-serif text-[34px] leading-tight">About Suffeffix</h1>
        <p className="mt-6 font-serif text-[21px] leading-[1.6] pl-5" style={{ borderLeft: "2px solid var(--accent)" }}>
          An explainable lexical knowledge graph that jointly represents morphology, semantic
          decomposition, etymology, and affix alignment.
        </p>
      </header>

      <section className="grid md:grid-cols-[minmax(0,14rem)_1fr] gap-x-10 gap-y-4">
        <h2 className="font-serif text-[15px]" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Epistemic key
        </h2>
        <div>
          <p className="text-[14.5px] text-muted mb-4 max-w-[52ch]">
            Every piece of linguistic content in the dataset carries one of four tags, so a reader can
            tell a citable fact from a convenience of the implementation:
          </p>
          <dl className="max-w-[54ch]">
            {[
              ["ESTABLISHED", "standard linguistic knowledge, citable from reference works"],
              ["ENGINEERING", "an abstraction chosen for implementation convenience — not a linguistic claim"],
              ["HYPOTHESIS", "plausible and testable, not yet demonstrated"],
              ["FUTURE", "out of scope for v0.1"],
            ].map(([tag, gloss]) => (
              <div key={tag} className="grid grid-cols-[8.5rem_1fr] gap-x-4 py-2.5" style={{ borderTop: "1px solid var(--rule)" }}>
                <dt className="pt-[2px]"><EpiBadge status={tag} /></dt>
                <dd className="text-[14px] leading-relaxed">{gloss}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="grid md:grid-cols-[minmax(0,14rem)_1fr] gap-x-10 gap-y-4">
        <h2 className="font-serif text-[15px]" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Two families
        </h2>
        <p className="text-[15px] leading-[1.75] max-w-[58ch]">
          Telugu is Dravidian; Hindi is Indo-Aryan and English is Germanic, both Indo-European. There
          are no cognates between Telugu and either of the others — only borrowing links them, mostly
          through Sanskrit, through Perso-Arabic vocabulary, and through English. The validator
          rejects any cognate or inheritance edge that crosses that boundary, so the constraint is
          enforced by the build rather than promised in prose. English and Hindi genuinely are
          related, so <span className="font-serif italic">name</span>/नाम,{" "}
          <span className="font-serif italic">mother</span>/माता,{" "}
          <span className="font-serif italic">three</span>/तीन and{" "}
          <span className="font-serif italic">tooth</span>/दाँत are stored as cognates, each with a source.
        </p>
      </section>

      <section className="grid md:grid-cols-[minmax(0,14rem)_1fr] gap-x-10 gap-y-4">
        <h2 className="font-serif text-[15px]" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Semantic atoms
        </h2>
        <p className="text-[15px] leading-[1.75] max-w-[58ch]">
          <em>Semantic atoms are an engineering interlingua, not a theory of human cognition.</em>{" "}
          Atoms seeded from NSM primes are marked ESTABLISHED as members of that inventory; the rest
          are ENGINEERING additions, and the total is capped at fifty so the interlingua cannot drift
          into being an ontology.
        </p>
      </section>

      <section className="grid md:grid-cols-[minmax(0,14rem)_1fr] gap-x-10 gap-y-4">
        <h2 className="font-serif text-[15px]" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Data statement
        </h2>
        <p className="text-[15px] leading-[1.75] max-w-[58ch]">
          338 concept-aligned entries in English, Telugu, and Hindi, authored for this project against
          the reference works in its bibliography — the OED; Turner&rsquo;s CDIAL; Burrow and
          Emeneau&rsquo;s DEDR; Monier-Williams; Platts; Brown; McGregor; Krishnamurti; Watkins.
          Nearly all of it ships as <span className="font-mono text-[13px]">draft</span>: authored
          carefully, not yet reviewed item by item. Reference-work entry numbers are deliberately
          absent until someone verifies them against the physical volumes, and etymologies the
          literature disputes are stored contested rather than quietly settled.
        </p>
      </section>

      <section className="grid md:grid-cols-[minmax(0,14rem)_1fr] gap-x-10 gap-y-4">
        <h2 className="font-serif text-[15px]" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          No model in the loop
        </h2>
        <p className="text-[15px] leading-[1.75] max-w-[58ch]">
          Suffeffix contains no language-model inference of any kind — no embeddings, no retrieval, no
          generation at read time. The explanations are assembled by named template rules from graph
          facts, which is why each one can show you the nodes, rules, and sources behind every
          sentence. Code is Apache-2.0; the dataset is CC BY-SA 4.0; cite via{" "}
          <span className="font-mono text-[13px]">CITATION.cff</span>.
        </p>
      </section>
    </div>
  );
}
