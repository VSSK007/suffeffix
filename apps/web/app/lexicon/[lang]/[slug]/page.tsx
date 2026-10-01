import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import { LANG_NAME, LANES, REGISTER_NAME } from "@/lib/lang";
import { Confidence, ContestedTag, EpiTag, FamilyDot, ReviewTag, familyHue } from "@/components/marks";
import { Morphemes } from "@/components/morphemes";
import { Triptych } from "@/components/triptych";
import { ExplanationBlock } from "@/components/explanation";

export async function generateStaticParams() {
  const entries = await data.entries();
  return entries.map((e) => {
    const [lang, s] = slug.entry(e.id);
    return { lang, slug: s };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.entry(slug.entryId(lang, s));
  return { title: d ? `${d.entry.lemma.form} — ${d.concept?.gloss ?? LANG_NAME[d.entry.lang]}` : "Word" };
}

export default async function EntryPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const id = slug.entryId(lang, s);
  const d = await data.entry(id);
  if (!d) notFound();
  const e = d.entry;
  const [row, etym] = await Promise.all([data.concept(e.concept_id), data.etymology()]);
  const lane = row ? LANES.flatMap((l) => row.lanes[l.code]).find((x) => x.id === id) : undefined;
  const hasGraph = Boolean(etym[id]);
  const sourceRefs = [...new Set(d.edges.flatMap((ed) => ed.source_ref))];

  return (
    <article>
      <nav className="text-[12.5px] text-muted mb-6" aria-label="Breadcrumb">
        <Link href="/lexicon/" className="hover:text-ink">Concordance</Link>
        {row && (
          <>
            <span className="mx-2 text-faint">/</span>
            <Link href={slug.conceptHref(row.id)} className="hover:text-ink">{row.gloss}</Link>
          </>
        )}
        <span className="mx-2 text-faint">/</span>
        <span>{LANG_NAME[e.lang]}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_19rem] gap-10 lg:gap-14">
        <div className="min-w-0 space-y-14">
          {/* ── the word, as an equation ─────────────────────────── */}
          <header>
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-muted mb-4">
              <FamilyDot lang={e.lang} /> {LANG_NAME[e.lang]} · {e.pos}
            </span>
            <h1 className="display text-[52px] sm:text-[76px] font-semibold">{e.lemma.form}</h1>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              {e.lemma.form !== e.lemma.translit && <span className="mono text-[17px] text-muted">{e.lemma.translit}</span>}
              {d.concept && <span className="text-[19px] text-ink-2">‘{d.concept.gloss}’</span>}
            </div>
            {lane && (
              <div className="mt-8">
                <Morphemes e={lane} size="lg" />
                {lane.morphemes.length > 0 && (
                  <p className="text-[13px] text-muted mt-3">
                    {lane.morphemes.map((m) => `${m.form} — ${m.fnLabel}`).join(" · ")}
                  </p>
                )}
              </div>
            )}
          </header>

          {/* ── the same meaning, three lanes ────────────────────── */}
          {row && (
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <h2 className="wide text-[21px] font-semibold">The same meaning in all three languages</h2>
                <Link href={slug.conceptHref(row.id)} className="text-[13px] text-ie-ink hover:underline underline-offset-4">
                  Open the meaning →
                </Link>
              </div>
              <div className="panel p-4 sm:p-6">
                <Triptych row={row} focusId={id} />
              </div>
            </section>
          )}

          <ExplanationBlock explanation={d.explanation} notes={e.notes || undefined} />

          {/* ── etymology ───────────────────────────────────────── */}
          {d.edges.length > 0 && (
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <h2 className="wide text-[21px] font-semibold">Where it came from</h2>
                {hasGraph && (
                  <Link href={slug.etymologyHref(id)} className="text-[13px] text-ie-ink hover:underline underline-offset-4">
                    Full lineage graph →
                  </Link>
                )}
              </div>
              <ol className="border-y border-line divide-y divide-[var(--line)]">
                {d.edges.map((ed) => (
                  <li key={ed.id} className="py-3.5 grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 items-center">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
                      <span className="font-medium" style={{ boxShadow: `inset 0 -2px 0 ${familyHue(ed.from.family)}` }}>{ed.from.form}</span>
                      <span className="text-[12px] text-faint">{LANG_NAME[ed.from.lang_or_family] ?? ed.from.lang_or_family}</span>
                      <span className="text-muted text-[12.5px] px-1">— {ed.type.toLowerCase()} →</span>
                      <span className="font-medium" style={{ boxShadow: `inset 0 -2px 0 ${familyHue(ed.to.family)}` }}>{ed.to.form}</span>
                      {ed.drift.filter((x) => x !== "NONE").map((x) => (
                        <span key={x} className="text-[11.5px] rounded-full border border-line px-2" style={{ color: "var(--hyp)" }}>
                          {x.toLowerCase()}
                        </span>
                      ))}
                      {ed.status === "contested" && <ContestedTag />}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="mono text-[11.5px] text-muted">{ed.source_ref.join(", ")}</span>
                      <Confidence value={ed.confidence} />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* ── rail: the facts ─────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 self-start space-y-6">
          <div className="panel p-5">
            <dl className="space-y-3.5 text-[13.5px]">
              {(
                [
                  ["Register", REGISTER_NAME[e.register] ?? e.register],
                  ["Part of speech", e.pos],
                  ["Pattern", e.morphology.schema.replace("STEM+", "stem + ")],
                  ["Segmentation", `confidence ${e.morphology.segmentation_confidence.toFixed(2)}`],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 items-center">
                <dt className="text-muted">Review</dt>
                <dd><ReviewTag status={e.provenance.review_status} /></dd>
              </div>
            </dl>
          </div>

          {d.concept && (
            <div className="panel p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="kicker">Decomposition</p>
                <EpiTag status={d.concept.structure_status} />
              </div>
              <p className="mono text-[13.5px] leading-relaxed break-words">{d.structure_pretty}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {d.atoms.map((a) => (
                  <Link
                    key={a.id}
                    href={slug.atomHref(a.id)}
                    className="mono text-[11.5px] rounded-md border border-line px-2 py-0.5 hover:border-line-2 hover:text-ie-ink"
                    title={a.definition}
                  >
                    {a.id.replace("atom:", "")}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {sourceRefs.length > 0 && (
            <div className="panel p-5">
              <p className="kicker mb-3">Sources cited</p>
              <ul className="space-y-1 text-[13px]">
                {sourceRefs.map((r) => (
                  <li key={r} className="mono text-ink-2">{r}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11.5px] text-faint leading-relaxed px-1">
            {e.id} · annotated {e.provenance.date}. Drafts are authored against reference works and await
            item-by-item expert review.
          </p>
        </aside>
      </div>
    </article>
  );
}
