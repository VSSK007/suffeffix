import Link from "next/link";
import { EpiTag, ContestedTag } from "@/components/marks";
import { LANES } from "@/lib/lang";
import { FamilyDot } from "@/components/marks";
import { Wordmark } from "@/components/wordmark";
import { data } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "About", description: "What Suffeffix is, what it refuses to be, and how to read its epistemic statuses, its family constraint and its data statement.", path: "/about/" });

function Row({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-x-12 gap-y-3 py-10 border-t border-line">
      <h2 className="wide text-[19px] font-semibold">{title}</h2>
      <div className="text-[15px] leading-[1.75] text-ink-2 max-w-[64ch] space-y-4">{children}</div>
    </section>
  );
}

export default async function AboutPage() {
  const affixes = await data.affixes();
  const kinds = (k: string) => affixes.filter((a) => a.kind === k).length;
  const notSuffix = affixes.length - kinds("suffix");
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

      <Row title="The name" id="name">
        <p className="!text-[22px] !leading-[1.45] !text-ink font-medium">
          Suffeffix means <em>suffix</em> — and every effing affix.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-4 py-2" role="img" aria-label="suff, plus the infix eff, plus ix, makes suffeffix">
          <span className="chip-stem rounded-lg px-3.5 py-1.5 text-[26px] font-medium leading-tight">suff</span>
          <span className="text-faint" aria-hidden="true">+</span>
          <span className="chip-ie rounded-lg px-3.5 py-1.5 text-[26px] font-semibold leading-tight">eff</span>
          <span className="text-faint" aria-hidden="true">+</span>
          <span className="chip-stem rounded-lg px-3.5 py-1.5 text-[26px] font-medium leading-tight">ix</span>
          <span className="text-faint" aria-hidden="true">=</span>
          <Wordmark size={34} />
        </div>
        <p>
          Take <em>suffix</em> and open it between its stem and its ending: <em>suff·ix</em>. Drop <em>eff</em> into the
          middle — the spoken name of the letter F, and the polite way of writing the word English speakers wedge into the
          middle of other words for emphasis. The result, <em>suff·eff·ix</em>, is a suffix with an infix inside it: a small
          joke about the very thing this project catalogues.
        </p>
        <p>
          English really does this. Expletive infixation (<em>abso-bloody-lutely</em>, <em>fan-effing-tastic</em>) is a
          documented morphological process, and McCarthy (1982) showed that where the infix lands follows the stress pattern
          of the host word. Our name is a playful cousin of it, not an instance: it infixes the bare <em>eff</em>, without the{" "}
          <em>-ing</em>, and it does not honour the stress rule. We never claimed it was grammatical.
        </p>
        <p>
          The first half of the name says <em>suffix</em>; the second half is the real scope — <em>every effing affix</em>.
          Suffixes are only the commonest kind. Of the {affixes.length} affixes in v0.1, {kinds("suffix")} are suffixes,{" "}
          {kinds("prefix")} are prefixes (<span lang="en">un-</span>, <span lang="hi">निर्-</span>, <span lang="hi">बे-</span>,{" "}
          <span lang="te">నిర్-</span>) and {kinds("compound_element")} are compound elements (such as{" "}
          <span lang="hi">-शाला</span> and <span lang="te">-శాస్త్రం</span>) — {notSuffix} that the name, taken literally, leaves out.
          The schema has room for circumfixes too, and nothing in it assumes an affix belongs at the end of a word.
        </p>
        <p className="!text-[14px] !text-muted">
          A coinage, not a finding: this is the project&rsquo;s own word-play and no claim from a reference work. McCarthy, J. J.
          (1982).{" "}
          <a href="https://works.bepress.com/john_j_mccarthy/11/" className="underline underline-offset-4 hover:text-ie-ink">
            Prosodic structure and expletive infixation
          </a>
          . <em>Language</em> 58: 574–590.
        </p>
      </Row>

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
