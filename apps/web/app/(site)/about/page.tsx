import Link from "next/link";
import { AcceptedTag, EpiTag, ContestedTag } from "@/components/marks";
import { DR_LANES, IE_LANES, LANES } from "@/lib/lang";
import { loadCensus } from "@/lib/census";
import { FamilyDot } from "@/components/marks";
import { Wordmark } from "@/components/wordmark";
import { data } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "About", description: "What Suffeffix is, what it refuses to be, the T.H.E.F.T. framework behind its five languages, and how to read its epistemic statuses, its family constraint and its data statement.", path: "/about/" });

function Row({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-x-12 gap-y-3 py-10 border-t border-line">
      <h2 className="wide text-[19px] font-semibold">{title}</h2>
      <div className="text-[15px] leading-[1.75] text-ink-2 max-w-[64ch] space-y-4">{children}</div>
    </section>
  );
}

export default async function AboutPage() {
  const [affixes, census, meta] = await Promise.all([data.affixes(), loadCensus(), data.meta()]);
  const share = (l: string, k: string) => Math.round((100 * (census.reg[l].counts[k] ?? 0)) / census.reg[l].n);
  const borrowed = census.edgeTypes.find((t) => t.type === "BORROWED");
  const inheritedAcross = census.edgeTypes.filter((t) => t.type === "INHERITED" || t.type === "COGNATE").reduce((n, t) => n + t.crosses, 0);
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
          decomposition, etymology, and affix alignment — for five languages in two families: Telugu, Hindi,
          English, French and Tamil. Together they make the{" "}
          <a href="#theft" className="underline underline-offset-4 hover:text-ie-ink">T.H.E.F.T. framework</a>.
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
          Suffixes are only the commonest kind. Of the {affixes.length} affixes in v0.2, {kinds("suffix")} are suffixes,{" "}
          {kinds("prefix")} are prefixes (<span lang="en">un-</span>, <span lang="fr">in-</span>, <span lang="hi">निर्-</span>,{" "}
          <span lang="te">నిర్-</span>, <span lang="ta">சிறு-</span>) and {kinds("compound_element")} are compound elements (such as{" "}
          <span lang="hi">-शाला</span>, <span lang="te">-శాస్త్రం</span> and <span lang="ta">-இயல்</span>) — {notSuffix} that the name, taken literally, leaves out.
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

      <Row title="The T.H.E.F.T. framework" id="theft">
        <p className="!text-[22px] !leading-[1.45] !text-ink font-medium">
          Telugu, Hindi, English, French, Tamil. Five languages, two families — and between the families, only theft.
        </p>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 py-2" role="img" aria-label="T for Telugu, H for Hindi, E for English, F for French, T for Tamil">
          {(["te", "hi", "en", "fr", "ta"] as const).map((code) => {
            const l = LANES.find((x) => x.code === code)!;
            return (
              <div key={code} className={`${l.family === "dr" ? "chip-dr" : "chip-ie"} rounded-xl px-1 py-3 text-center`}>
                <div className="display text-[34px] sm:text-[44px] font-semibold leading-none">{l.name[0]}</div>
                <div className="text-[12px] sm:text-[13px] font-medium mt-2">{l.name}</div>
                <div className="text-[10.5px] sm:text-[11px] opacity-75 mt-0.5 leading-tight">{l.familyName.split(" · ")[1]}</div>
              </div>
            );
          })}
        </div>
        <p>The five are not a sample of convenience. Each grouping isolates one thing a lexical graph has to get right.</p>
        <dl className="space-y-4">
          <div>
            <dt className="font-semibold text-ink">Telugu and Tamil — one family, two answers to Sanskrit.</dt>
            <dd>
              Both are Dravidian and share inherited words (<span lang="te">పేరు</span>/<span lang="ta">பெயர்</span> ‘name’,{" "}
              <span lang="te">కన్ను</span>/<span lang="ta">கண்</span> ‘eye’, <span lang="te">మూడు</span>/<span lang="ta">மூன்று</span> ‘three’),
              which the graph stores as cognates. But Telugu absorbs Sanskrit, while modern Tamil often coins from native roots: ‘library’ is{" "}
              <span lang="te">గ్రంథాలయం</span> in Telugu and <span lang="ta">நூலகம்</span>, from <span lang="ta">நூல்</span> ‘book’, in
              Tamil. In this dataset {share("te", "S")}% of Telugu words are Sanskritic, against {share("ta", "S")}% of Tamil words.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">English and French — one family, one long loan.</dt>
            <dd>
              Germanic English took much of its everyday and learned vocabulary from French after 1066: <em>joy</em>,{" "}
              <em>beauty</em> and <em>merchant</em> carry borrowing edges from Old French. Both keep a learned Latin and
              Greek layer (register L): {share("en", "L")}% of the English words here and {share("fr", "L")}% of the French ones.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">English, French and Hindi — distant cousins.</dt>
            <dd>
              Three branches of Indo-European that parted thousands of years ago still share inherited roots:{" "}
              <em>mother</em>/<span lang="fr">mère</span>/<span lang="hi">माता</span>, <em>name</em>/<span lang="fr">nom</span>/<span lang="hi">नाम</span>,{" "}
              <em>three</em>/<span lang="fr">trois</span>/<span lang="hi">तीन</span>. These are cognates, each with a source.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Sanskrit and Latin — two classical donors.</dt>
            <dd>
              Sanskrit is to Hindi and Telugu roughly what Latin is to French and English: a prestige source of learned words.
              Indian grammar calls a word borrowed unchanged <em>tatsama</em> (‘same as that’) and one worn down by inheritance{" "}
              <em>tadbhava</em> (‘born of that’). French shows the same split in its doublets: learned <span lang="fr">-ité</span>{" "}
              (<span lang="fr">humanité</span>) beside inherited <span lang="fr">-té</span> (<span lang="fr">bonté</span>), both from
              Latin <em>-itātem</em>. Suffeffix records both kinds of layering in one register field.
            </dd>
          </div>
        </dl>
        <p>
          <strong className="text-ink font-semibold">Why “theft”.</strong> Linguists say <em>borrowing</em>, but nothing is
          ever given back. Within a family, words are inherited; across the family line they can only be taken. That is the
          framework’s one hard rule, and the validator enforces it: {inheritedAcross === 0 ? "none" : inheritedAcross} of the{" "}
          {census.edgeTotal} etymology edges claims inheritance or cognacy across the boundary
          {borrowed ? (
            <>
              , while {borrowed.crosses} borrowing edges cross it — Sanskrit <em>pustaka</em> into Tamil{" "}
              <span lang="ta">புத்தகம்</span> and Telugu <span lang="te">పుస్తకం</span> among them
            </>
          ) : null}
          .
        </p>
        <p className="!text-[14px] !text-muted">
          <EpiTag status="ENGINEERING" />{" "}
          The choice of five is a design decision, not a claim about the languages. The percentages describe the{" "}
          {meta.counts.entries} words in this dataset, whose meanings were chosen to showcase derivation, not the
          vocabularies as a whole.
        </p>
      </Row>

      <Row title="Two families">
        <p>
          Telugu and Tamil are Dravidian. English (Germanic), French (Romance) and Hindi (Indo-Aryan) are
          Indo-European. There are no cognates across that line — only borrowing links the families, mostly
          through Sanskrit, Perso-Arabic vocabulary, and English. The validator rejects any cognate or
          inheritance edge that crosses the boundary, so the rule is enforced by the build, not promised in prose.
        </p>
        <div className="grid gap-y-2 text-[13.5px]">
          {[...IE_LANES, ...DR_LANES].map((l) => (
            <span key={l.code} className="inline-flex items-center gap-2">
              <FamilyDot lang={l.code} /> <span className="font-medium text-ink">{l.name}</span>
              <span className="text-muted">{l.familyName}</span>
            </span>
          ))}
        </div>
        <p>
          The Indo-European three genuinely are related, so <em>name</em>/<span lang="fr">nom</span>/<span lang="hi">नाम</span> and{" "}
          <em>mother</em>/<span lang="fr">mère</span>/<span lang="hi">माता</span> are stored as cognates, as are the Dravidian pairs{" "}
          <span lang="te">నీరు</span>/<span lang="ta">நீர்</span> ‘water’ and <span lang="te">ఊరు</span>/<span lang="ta">ஊர்</span> ‘village’.
          Each carries a source.
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
              ["FUTURE", "out of scope for this release"],
            ] as [string, string][]
          ).map(([t, g]) => (
            <div key={t} className="grid grid-cols-[8.5rem_1fr] gap-3 items-baseline">
              <dt><EpiTag status={t} /></dt>
              <dd className="text-[14px]">{g}</dd>
            </div>
          ))}
        </dl>
        <p>
          Every etymology link also carries one of two statuses. Where the reference works agree, it is stored{" "}
          <AcceptedTag />. Where the literature disputes it, it is stored <ContestedTag /> and never silently resolved:
          the claim stays, with a low confidence and this badge, instead of a winner being picked for you.
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
          {meta.counts.entries} concept-aligned entries, authored for this project against the reference works in its
          bibliography: the OED; the <em>TLFi</em>; Turner’s <em>CDIAL</em>; Burrow and Emeneau’s <em>DEDR</em>; the
          Madras <em>Tamil Lexicon</em>; Monier-Williams; Platts; Brown; McGregor; Krishnamurti; Watkins. Nearly everything ships as{" "}
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
