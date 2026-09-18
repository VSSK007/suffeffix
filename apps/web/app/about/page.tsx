import { EpiBadge } from "@/components/badges";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-[72ch]">
      <header>
        <p className="eyebrow mb-2">principles</p>
        <h1 className="text-3xl">About Suffeffix</h1>
        <p className="mt-5 font-serif text-[19px] italic border-l-[3px] pl-4 leading-relaxed"
          style={{ borderColor: "var(--accent)" }}>
          Suffeffix is an explainable lexical knowledge graph that jointly represents morphology,
          semantic decomposition, etymology, and affix alignment.
        </p>
      </header>

      <section>
        <h2 className="text-xl mb-3">Epistemic key</h2>
        <p className="text-[14.5px] text-muted mb-4">Every piece of linguistic content is tagged:</p>
        <ul className="space-y-2.5 text-[14.5px]">
          <li className="flex gap-3 items-baseline"><EpiBadge status="ESTABLISHED" /><span>standard linguistic knowledge citable from reference works</span></li>
          <li className="flex gap-3 items-baseline"><EpiBadge status="ENGINEERING" /><span>an abstraction chosen for implementation convenience, not a linguistic claim</span></li>
          <li className="flex gap-3 items-baseline"><EpiBadge status="HYPOTHESIS" /><span>plausible and testable, not yet demonstrated</span></li>
          <li className="flex gap-3 items-baseline"><EpiBadge status="FUTURE" /><span>out of scope for v0.1</span></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl mb-3">The two-family constraint</h2>
        <p className="text-[14.5px] leading-relaxed">
          Telugu is a Dravidian language; Hindi (Indo-Aryan) and English (Germanic) are Indo-European. There
          are <strong>no cognates between Telugu and either Hindi or English</strong> — only borrowing links
          them, mostly via Sanskrit, Perso-Arabic vocabulary, and English. The validator rejects any cognate
          or inheritance edge that crosses a top-level family boundary. English and Hindi are both
          Indo-European, so genuine cognates (name/नाम, mother/माता, three/तीन, tooth/दाँत) are allowed and sourced.
        </p>
      </section>

      <section>
        <h2 className="text-xl mb-3">Semantic atoms</h2>
        <p className="text-[14.5px] leading-relaxed">
          <em>Semantic atoms are an engineering interlingua, not a theory of human cognition.</em> Atoms seeded
          from NSM primes are marked ESTABLISHED as members of that inventory; additions are ENGINEERING, and
          the total is capped at fifty.
        </p>
      </section>

      <section>
        <h2 className="text-xl mb-3">Data statement</h2>
        <p className="text-[14.5px] leading-relaxed">
          The v0.1 dataset holds 338 concept-aligned entries in English, Telugu, and Hindi, authored for this
          project against the reference works in its bibliography (OED; Turner, CDIAL; Burrow &amp; Emeneau,
          DEDR; Monier-Williams; Platts; Brown; McGregor; Krishnamurti; Watkins). Nearly all content ships
          with review status <code className="font-mono text-[13px] bg-code px-1 rounded">draft</code>;
          contested etymologies are stored as contested and badged, never silently resolved. Generated
          explanations are assembled deterministically from the graph and always display their trace — they
          are not authoritative statements. Reference-work entry numbers are deliberately absent until
          verified against the physical works.
        </p>
      </section>

      <section>
        <h2 className="text-xl mb-3">Licence &amp; citation</h2>
        <p className="text-[14.5px] leading-relaxed">
          Code: Apache-2.0. Dataset: CC BY-SA 4.0. Cite via <code className="font-mono text-[13px] bg-code px-1 rounded">CITATION.cff</code>{" "}
          in the repository. Suffeffix contains no language-model inference of any kind — it is a knowledge
          graph, and everything it says can be traced to a node, a rule, or a source.
        </p>
      </section>
    </div>
  );
}
