import Link from "next/link";
import { data, slug } from "@/lib/data";
import { HeroStage } from "@/components/hero-stage";
import { CopyButton } from "@/components/copy-button";
import { REPORT_BIBTEX } from "@/lib/cite";
import { loadCensus } from "@/lib/census";
import { pageMeta } from "@/lib/seo";
import { DR_LANES, IE_LANES, LANES, chipClass, langAttr } from "@/lib/lang";

export const metadata = {
  ...pageMeta({ title: "Suffeffix", path: "/" }),
  title: { absolute: "Suffeffix — an explainable lexical knowledge graph" },
};

const STAGE = ["concept:GOODNESS", "concept:CHILDHOOD", "concept:HOPELESS", "concept:SOCIALISM", "concept:READABLE", "concept:LONELINESS"];
const MINI = ["concept:GOODNESS", "concept:TEACHER", "concept:HOPELESS"];

const SUGAR_ROUTES: { label: string; steps: { form: string; fam: string }[] }[] = [
  { label: "Inherited, east", steps: [{ form: "śarkarā", fam: "ie" }, { form: "sakkarā", fam: "ie" }, { form: "शक्कर", fam: "ie" }] },
  { label: "Borrowed, west", steps: [{ form: "śarkarā", fam: "ie" }, { form: "šakar", fam: "ie" }, { form: "sukkar", fam: "semi" }, { form: "succarum", fam: "ie" }, { form: "sucre", fam: "ie" }, { form: "sugar", fam: "ie" }] },
  { label: "Borrowed, south", steps: [{ form: "śarkarā", fam: "ie" }, { form: "చక్కెర", fam: "dr" }, { form: "சர்க்கரை", fam: "dr" }] },
];
const FAM_HUE: Record<string, string> = { ie: "var(--ie)", dr: "var(--dr)", semi: "var(--semi)" };

export default async function Home() {
  const [meta, concepts, affixes, atoms, census] = await Promise.all([data.meta(), data.concepts(), data.affixes(), data.atoms(), loadCensus()]);
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const stage = STAGE.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => !!r);
  const mini = MINI.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => !!r);
  const c = meta.counts;
  const priv = (lang: string) => affixes.filter((a) => a.lang === lang && a.functions.includes("fn:PRIV"));

  const stats: [string, string][] = [
    [String(c.entries), "words"],
    [String(c.concepts as number), "aligned meanings"],
    [String(c.affixes as number), "affixes"],
    [String(c.atoms as number), "semantic atoms"],
    [String(c.etymology_edges as number), "sourced etymology edges"],
    ["0", "model calls"],
  ];

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────── */}
      <section className="container pt-14 sm:pt-20 pb-12">
        <p className="kicker mb-7">Suffeffix Research · v0.2 · the T.H.E.F.T. framework</p>
        <h1 className="h-xl max-w-[14ch]">
          One meaning. Five languages. <span className="text-faint">Two families.</span>
        </h1>
        <div className="mt-9 grid gap-8 lg:grid-cols-[1.2fr_1fr] items-end">
          <p className="lede max-w-[56ch]">
            Suffeffix is an explainable lexical knowledge graph. It takes words apart — stem, affix, function —
            lines them up across Telugu, Hindi, English, French and Tamil, and traces where they came from, with a
            source for every etymology and a trace for every explanation.
          </p>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/research/suffeffix-v0-2/" className="btn btn-primary">Read the technical report</Link>
            <Link href="/lexicon/" className="btn btn-ghost">Explore the graph</Link>
          </div>
        </div>
        <div className="mt-14">
          <HeroStage rows={stage} />
        </div>
      </section>

      {/* ── by the numbers ───────────────────────────────────── */}
      <section className="container pb-8" aria-label="The dataset in numbers">
        <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-line">
          {stats.map(([n, l]) => (
            <div key={l} className="py-7 pr-4 border-b border-line lg:border-b-0">
              <dd className="h-lg tnum leading-none">{n}</dd>
              <dt className="text-[13.5px] text-muted mt-2.5">{l}</dt>
            </div>
          ))}
        </dl>
        <p className="text-[13px] text-muted mt-4 max-w-[80ch]">
          Every record in v0.2 is a draft, authored against reference works and awaiting expert review. The
          meanings were chosen to showcase derivation and etymology, so these counts describe the dataset, not the languages.
        </p>
      </section>

      {/* ── THEFT ────────────────────────────────────────────── */}
      <section className="container band" aria-labelledby="theft-h">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] items-center">
          <div>
            <p className="kicker mb-5">The framework</p>
            <h2 id="theft-h" className="h-lg max-w-[16ch]">T.H.E.F.T.: inherited inside a family, stolen across it</h2>
            <p className="text-[16px] leading-[1.7] text-ink-2 mt-5 max-w-[50ch]">
              Telugu and Tamil show one family giving two answers to Sanskrit. English and French show one long loan.
              English, French and Hindi are distant cousins. Between the two families the validator allows only one kind of
              edge: borrowing.
            </p>
            <Link href="/about/#theft" className="link-arrow mt-7 inline-block">Read about the framework</Link>
          </div>
          <div className="grid grid-cols-5 gap-2" aria-hidden="true">
            {(["te", "hi", "en", "fr", "ta"] as const).map((code) => {
              const l = LANES.find((x) => x.code === code)!;
              return (
                <div key={code} className={`${chipClass(code)} rounded-2xl px-1 py-5 text-center`}>
                  <div className="display text-[clamp(34px,5vw,64px)] font-semibold leading-none">{l.name[0]}</div>
                  <div className="text-[12.5px] font-medium mt-3">{l.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── featured research ────────────────────────────────── */}
      <section className="container band">
        <div className="flex items-end justify-between gap-6 mb-8">
          <h2 className="h-lg">Research</h2>
          <Link href="/research/" className="link-arrow hidden sm:inline">All research</Link>
        </div>
        <Link
          href="/research/suffeffix-v0-2/"
          className="group grid lg:grid-cols-[1.1fr_1fr] gap-0 overflow-hidden rounded-[28px] border border-line card-hover bg-bg"
        >
          <div className="p-8 sm:p-12 flex flex-col">
            <p className="kicker mb-6">Technical report · v0.2 · October 2026</p>
            <h3 className="h-md max-w-[24ch]">
              Suffeffix: an explainable lexical knowledge graph for morphology, semantic decomposition, etymology and affix alignment
            </h3>
            <p className="text-[15.5px] text-ink-2 leading-relaxed mt-5 max-w-[56ch]">
              How we model five languages across a family boundary the data refuses to blur: the validator rejects
              cognates between Dravidian and Indo-European, every etymology carries a source and a confidence, and
              explanations are generated by named rules rather than by a language model.
            </p>
            <span className="link-arrow mt-auto pt-10 self-start group-hover:border-ink">Read the report</span>
          </div>
          <div className="band-surface p-8 sm:p-12 grid content-center gap-4" aria-hidden="true">
            {LANES.map((l) => (
              <div key={l.code} className={l === DR_LANES[0] ? "pt-4 border-t border-dashed border-line-2" : ""}>
                <div className="flex justify-between text-[12px] text-muted mb-1.5">
                  <span>{l.name}</span>
                  <span className="mono">{census.reg[l.code].n} words</span>
                </div>
                <div className="flex gap-[2px] h-5">
                  {([["N", "s1"], ["S", "s2"], ["P", "s3"], ["L", "s4"], ["mixed", "neutral"], ["E", "neutral"]] as const).map(([r, v]) =>
                    census.reg[l.code].counts[r] ? (
                      <div key={r} className="last:rounded-r-[4px]" style={{ flex: census.reg[l.code].counts[r], background: `var(--${v})` }} />
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        </Link>
      </section>

      {/* ── explore ──────────────────────────────────────────── */}
      <section className="band band-surface">
        <div className="container">
          <p className="kicker mb-5">Explore</p>
          <h2 className="h-lg max-w-[18ch] mb-12">Four ways into the graph</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {/* concordance */}
            <Link href="/lexicon/" className="group rounded-[26px] bg-bg border border-line p-7 sm:p-9 card-hover flex flex-col">
              <h3 className="h-md">Concordance</h3>
              <p className="text-[15px] text-muted mt-3 max-w-[44ch]">
                Every meaning with its word in each language side by side, filterable by the affix function it uses.
              </p>
              <div className="mt-8 space-y-0 border-t border-line">
                {mini.map((r) => (
                  <div key={r.id} className="grid grid-cols-[repeat(3,minmax(0,1fr))_1rem_repeat(2,minmax(0,1fr))] border-b border-line">
                    {IE_LANES.map((l) => (
                      <div key={l.code} lang={langAttr(l.code)} className="py-3 pr-2 text-[14.5px] font-medium [overflow-wrap:anywhere]">{r.lanes[l.code][0]?.form}</div>
                    ))}
                    <div className="mini-gutter" />
                    {DR_LANES.map((l) => (
                      <div key={l.code} lang={langAttr(l.code)} className="py-3 pr-2 text-[14.5px] font-medium [overflow-wrap:anywhere]">{r.lanes[l.code][0]?.form}</div>
                    ))}
                  </div>
                ))}
              </div>
              <span className="link-arrow mt-8 self-start">Open the concordance</span>
            </Link>

            {/* atlas */}
            <Link href="/affixes/" className="group rounded-[26px] bg-bg border border-line p-7 sm:p-9 card-hover flex flex-col">
              <h3 className="h-md">Affix Atlas</h3>
              <p className="text-[15px] text-muted mt-3 max-w-[44ch]">
                Every affix filed by the job it does. Here is the privative row — the affixes that mean “without”.
              </p>
              <div className="mt-8 space-y-2.5 text-[16px]">
                {LANES.map((l) => (
                  <div key={l.code} className={`grid grid-cols-[4.5rem_1fr] items-baseline gap-3 ${l === DR_LANES[0] ? "pt-2.5 border-t border-dashed border-line-2" : ""}`}>
                    <span className="text-[12px] text-muted">{l.name}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {priv(l.code).map((a) => (<span key={a.id} lang={langAttr(l.code)} className={`${chipClass(l.code)} rounded-md px-2 py-0.5`}>{a.form}</span>))}
                    </div>
                  </div>
                ))}
              </div>
              <span className="link-arrow mt-auto pt-8 self-start">Open the Atlas</span>
            </Link>

            {/* etymology */}
            <Link href={slug.etymologyHref("lex:en:sugar")} className="group rounded-[26px] bg-bg border border-line p-7 sm:p-9 card-hover flex flex-col">
              <h3 className="h-md">Etymology</h3>
              <p className="text-[15px] text-muted mt-3 max-w-[44ch]">
                Sugar left Sanskrit three ways. Colour is family; every change of colour is a theft.
              </p>
              <div className="mt-8 space-y-3">
                {SUGAR_ROUTES.map((r) => (
                  <div key={r.label}>
                    <div className="text-[11.5px] text-faint mb-1">{r.label}</div>
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[14.5px]">
                      {r.steps.map((s, k) => (
                        <span key={k} className="inline-flex items-center gap-1">
                          {k > 0 && <span className="text-faint text-[11px]">→</span>}
                          <span lang={s.form === "சர்க்கரை" ? "ta" : s.fam === "dr" ? "te" : undefined} className="px-1" style={{ boxShadow: `inset 0 -2.5px 0 ${FAM_HUE[s.fam]}` }}>{s.form}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <span className="link-arrow mt-auto pt-8 self-start">See the lineage graph</span>
            </Link>

            {/* atoms */}
            <Link href="/atoms/" className="group rounded-[26px] bg-bg border border-line p-7 sm:p-9 card-hover flex flex-col">
              <h3 className="h-md">Semantic atoms</h3>
              <p className="text-[15px] text-muted mt-3 max-w-[44ch]">
                Fifty atoms, and not one more. An engineering interlingua, not a theory of cognition. Filled cells are NSM primes.
              </p>
              <div className="mt-8 grid grid-cols-10 gap-1" aria-hidden="true">
                {atoms.map((a) => (
                  <span key={a.id} className="aspect-square rounded-[4px]" style={a.nsm_prime ? { background: "var(--ink-2)" } : { border: "1.5px dashed var(--line-2)" }} />
                ))}
              </div>
              <span className="link-arrow mt-auto pt-8 self-start">Browse the atoms</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── principles ───────────────────────────────────────── */}
      <section className="container band">
        <p className="kicker mb-5">Principles</p>
        <h2 className="h-lg max-w-[20ch] mb-14">A knowledge graph that shows its working</h2>
        <div className="grid gap-12 md:grid-cols-3">
          {[
            ["Explainable by construction", "Every explanation is assembled from graph facts by a named template rule, and every sentence opens to the nodes, rules and sources behind it. There is no language model in the loop."],
            ["Honest about uncertainty", "Each fact carries an epistemic status — established, engineering, hypothesis — and each etymology a source and a confidence. Where scholarship disagrees, the edge is stored contested and left unresolved."],
            ["Respectful of two families", "Telugu and Tamil are Dravidian; English, French and Hindi are Indo-European. The validator rejects any cognate or inheritance edge across that boundary, so the resemblances that remain are modelled as the borrowings they are."],
          ].map(([t, d]) => (
            <div key={t} className="border-t-2 border-ink pt-5">
              <h3 className="wide text-[21px] font-semibold leading-snug">{t}</h3>
              <p className="text-[15.5px] text-ink-2 leading-[1.75] mt-3">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── cite ─────────────────────────────────────────────── */}
      <section className="band band-ink" id="cite">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
          <div>
            <p className="kicker mb-5">Build on it</p>
            <h2 className="h-lg max-w-[14ch]">Cite it. Download it. Correct it.</h2>
            <p className="text-[16px] leading-[1.7] mt-5 max-w-[46ch] muted-on-ink">
              The dataset is CC BY-SA 4.0 and the code is Apache-2.0. Every record is a draft — if you can
              review one against a reference work, or spot an error, we want to hear it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/data/" className="btn btn-primary">Download the dataset</Link>
              <a href="https://github.com/VSSK007/suffeffix/issues/new" className="btn btn-ghost">Report an error</a>
            </div>
          </div>
          <div className="rounded-[22px] p-6 sm:p-7" style={{ background: "color-mix(in srgb, var(--bg) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--bg) 18%, transparent)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="kicker">BibTeX</span>
              <CopyButton text={REPORT_BIBTEX} />
            </div>
            <pre className="mono text-[12.5px] leading-[1.7] overflow-x-auto whitespace-pre" style={{ color: "color-mix(in srgb, var(--bg) 88%, transparent)" }}>{REPORT_BIBTEX}</pre>
          </div>
        </div>
      </section>
    </>
  );
}
