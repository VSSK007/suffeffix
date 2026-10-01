import Link from "next/link";
import { EpiTag, ContestedTag } from "@/components/marks";
import { LANES } from "@/lib/lang";
import { FamilyDot } from "@/components/marks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "About", description: "What Suffeffix is, what it refuses to be, and how to read its epistemic statuses, its family constraint and its data statement.", path: "/about/" });

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-x-12 gap-y-3 py-10 border-t border-line">
      <h2 className="wide text-[19px] font-semibold">{title}</h2>
      <div className="text-[15px] leading-[1.75] text-ink-2 max-w-[64ch] space-y-4">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div>
      <header className="mb-10">
        <p className="kicker mb-3">About</p>
        <h1 className="display text-[40px] sm:text-[56px] font-semibold max-w-[18ch]">
          A knowledge graph that shows its working
        </h1>
        <p className="text-[19px] leading-[1.55] text-ink-2 max-w-[56ch] mt-6">
          Suffeffix is an explainable lexical knowledge graph that jointly represents morphology, semantic
          decomposition, etymology, and affix alignment — for English, Hindi and Telugu.
        </p>
      </header>

      <Row title="Two families">
        <p>
          Telugu is Dravidian. Hindi (Indo-Aryan) and English (Germanic) are Indo-European. There are no
          cognates between Telugu and either of the others — only borrowing links them, mostly through
          Sanskrit, Perso-Arabic vocabulary, and English. The validator rejects any cognate or inheritance
          edge that crosses that boundary, so the rule is enforced by the build, not promised in prose.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px]">
          {LANES.map((l) => (
            <span key={l.code} className="inline-flex items-center gap-2">
              <FamilyDot lang={l.code} /> <span className="font-medium text-ink">{l.name}</span>
              <span className="text-muted">{l.familyName}</span>
            </span>
          ))}
        </div>
        <p>
          English and Hindi genuinely are related, so <em>name</em>/नाम, <em>mother</em>/माता,{" "}
          <em>three</em>/तीन and <em>tooth</em>/दाँत are stored as cognates, each with a source.
        </p>
      </Row>

      <Row title="Epistemic status">
        <p>Every piece of linguistic content carries one of four tags, so a citable fact is never confused with a convenience of the implementation:</p>
        <dl className="space-y-2.5">
          {(
            [
              ["ESTABLISHED", "standard linguistic knowledge, citable from reference works"],
              ["ENGINEERING", "an abstraction chosen for implementation convenience — not a linguistic claim"],
              ["HYPOTHESIS", "plausible and testable, not yet demonstrated"],
              ["FUTURE", "out of scope for v0.1"],
            ] as [string, string][]
          ).map(([t, g]) => (
            <div key={t} className="grid grid-cols-[8.5rem_1fr] gap-3 items-baseline">
              <dt><EpiTag status={t} /></dt>
              <dd className="text-[14px]">{g}</dd>
            </div>
          ))}
        </dl>
        <p className="flex flex-wrap items-center gap-2">
          Etymologies the literature disputes are stored <ContestedTag /> and never silently resolved.
        </p>
      </Row>

      <Row title="Semantic atoms">
        <p>
          <strong className="text-ink font-semibold">Semantic atoms are an engineering interlingua, not a theory of human cognition.</strong>{" "}
          Atoms seeded from NSM primes are marked established as members of that inventory; the rest are
          engineering additions, and the total is capped at fifty.
        </p>
      </Row>

      <Row title="Data statement">
        <p>
          338 concept-aligned entries, authored for this project against the reference works in its
          bibliography: the OED; Turner’s <em>CDIAL</em>; Burrow and Emeneau’s <em>DEDR</em>;
          Monier-Williams; Platts; Brown; McGregor; Krishnamurti; Watkins. Nearly everything ships as{" "}
          <span className="mono text-[13px]">draft</span> — authored carefully, not yet reviewed item by item.
          Reference-work entry numbers are deliberately absent until someone checks them against the printed
          volumes.
        </p>
      </Row>

      <Row title="No model in the loop">
        <p>
          Suffeffix contains no language-model inference: no similarity search, no retrieval, no generation at read
          time. Explanations are assembled by named template rules from graph facts, which is why every
          sentence can show the nodes, rules and sources behind it.
        </p>
        <p>
          Code is Apache-2.0; the dataset is CC BY-SA 4.0. Cite via <span className="mono text-[13px]">CITATION.cff</span>, or read the{" "}
          <Link href="/docs/DECISIONS/" className="text-ie-ink underline underline-offset-4">decision log</Link>.
        </p>
      </Row>
    </div>
  );
}
