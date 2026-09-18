import { EpiBadge } from "@/components/badges";

export default function AboutPage() {
  return (
    <div className="prose-doc max-w-3xl space-y-6">
      <h1 className="text-2xl">About Suffeffix</h1>

      <blockquote>
        Suffeffix is an explainable lexical knowledge graph that jointly represents morphology,
        semantic decomposition, etymology, and affix alignment.
      </blockquote>

      <section>
        <h2 className="text-xl">Epistemic key</h2>
        <p>Every piece of linguistic content is tagged:</p>
        <ul className="not-prose space-y-2 list-none ml-0">
          <li><EpiBadge status="ESTABLISHED" /> standard linguistic knowledge citable from reference works</li>
          <li><EpiBadge status="ENGINEERING" /> an abstraction chosen for implementation convenience, not a linguistic claim</li>
          <li><EpiBadge status="HYPOTHESIS" /> plausible and testable, not yet demonstrated</li>
          <li><EpiBadge status="FUTURE" /> out of scope for v0.1</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl">The two-family constraint</h2>
        <p>
          Telugu is a Dravidian language; Hindi (Indo-Aryan) and English (Germanic) are Indo-European.
          There are <strong>no cognates between Telugu and either Hindi or English</strong> — only borrowing
          links them, mostly via Sanskrit, Perso-Arabic vocabulary, and English. The validator rejects any
          cognate or inheritance edge that crosses a top-level family boundary. English and Hindi are both
          Indo-European, so genuine cognates (name/नाम, mother/माता, three/तीन, tooth/दाँत) are allowed and sourced.
        </p>
      </section>

      <section>
        <h2 className="text-xl">Semantic atoms</h2>
        <p><em>Semantic atoms are an engineering interlingua, not a theory of human cognition.</em>{" "}
          Atoms seeded from NSM primes are marked ESTABLISHED as members of that inventory; additions are ENGINEERING.</p>
      </section>

      <section>
        <h2 className="text-xl">Data statement</h2>
        <p>
          The v0.1 dataset covers 300–500 concept-aligned entries in English, Telugu, and Hindi, authored for
          this project and reviewed against the reference works listed in <code>data/sources.json</code>{" "}
          (OED, CDIAL, DEDR, Monier-Williams, Platts, Brown, McGregor, Krishnamurti, Watkins). Nearly all
          content ships with review status <code>draft</code>; contested etymologies are stored as contested
          and badged, never silently resolved. Generated explanations are assembled deterministically from the
          graph and always display their trace — they are not authoritative statements.
        </p>
      </section>

      <section>
        <h2 className="text-xl">Licence & citation</h2>
        <p>Code: Apache-2.0. Data (<code>data/</code>): CC BY-SA 4.0. Cite via <code>CITATION.cff</code> in the repository.</p>
      </section>
    </div>
  );
}
