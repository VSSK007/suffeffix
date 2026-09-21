import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import {
  Confidence, ContestedBadge, EpiBadge, LANG_NAME, RegisterBadge, ReviewBadge,
} from "@/components/badges";
import { ExplanationBlock } from "@/components/explanation";
import { Segmentation } from "@/components/segmentation";

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
  return { title: d ? d.entry.lemma.form : "Entry" };
}

function SectionHead({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 flex-wrap mb-4">
      <h2
        className="font-serif text-[15px]"
        style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}
      >
        {children}
      </h2>
      {aside}
    </div>
  );
}

export default async function EntryPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.entry(slug.entryId(lang, s));
  if (!d) notFound();
  const e = d.entry;
  const etym = (await data.etymology())[e.id];

  const pieces = e.morphology.affixes.length
    ? [
        { text: e.morphology.stem_form, role: "stem" as const, label: "stem" },
        ...d.affixes.map((a, i) => ({
          text: a.form,
          translit: a.translit,
          role: "affix" as const,
          label: d.functions[i]?.label,
          href: slug.affixHref(a.id),
        })),
      ]
    : [{ text: e.lemma.form, role: "stem" as const, label: "simplex — no productive segmentation" }];

  return (
    <article className="space-y-20">
      {/* ── the word, cut ───────────────────────────────────────── */}
      <header>
        <p className="label mb-5">
          {LANG_NAME[e.lang]} · {e.pos} · <RegisterBadge register={e.register} /> · <ReviewBadge status={e.provenance.review_status} />
        </p>

        <h1 className="sr-only">{e.lemma.form}</h1>
        <Segmentation pieces={pieces} size="lg" />

        <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {e.lemma.form !== e.lemma.translit && (
            <span className="font-mono text-[15px] text-muted">{e.lemma.translit}</span>
          )}
          {d.concept && <p className="font-serif text-[19px] italic">{d.concept.gloss}</p>}
        </div>
        <p className="font-mono text-[10.5px] text-faint mt-3">
          {e.id} · schema {e.morphology.schema} · segmentation confidence{" "}
          {e.morphology.segmentation_confidence.toFixed(2)}
        </p>
      </header>

      {/* ── decomposition ───────────────────────────────────────── */}
      {d.concept && (
        <section>
          <SectionHead aside={<EpiBadge status={d.concept.structure_status} />}>Semantic decomposition</SectionHead>
          <p className="font-mono text-[17px] py-4 px-5" style={{ background: "var(--sunk)" }}>
            {d.structure_pretty}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
            {d.atoms.map((a) => (
              <Link
                key={a.id}
                href={slug.atomHref(a.id)}
                className="group flex items-baseline gap-2 text-[13px]"
              >
                <span className="font-mono group-hover:text-accent transition-colors">
                  {a.id.replace("atom:", "")}
                </span>
                <span className="text-faint text-[11.5px]">{a.definition}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── etymology ───────────────────────────────────────────── */}
      {d.edges.length > 0 && (
        <section>
          <SectionHead
            aside={
              etym && (
                <Link
                  href={slug.etymologyHref(e.id)}
                  className="font-mono text-[11.5px] underline underline-offset-4"
                  style={{ color: "var(--accent-ink)" }}
                >
                  full lineage graph →
                </Link>
              )
            }
          >
            Etymology
          </SectionHead>
          <ul>
            {d.edges.map((ed) => (
              <li
                key={ed.id}
                className="grid sm:grid-cols-[7rem_1fr_auto] gap-x-5 gap-y-1 py-3 items-baseline"
                style={{ borderTop: "1px solid var(--rule)" }}
              >
                <span
                  className="text-[11px] tracking-[0.07em] text-faint"
                  style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
                >
                  {ed.type}
                </span>
                <span className="text-[15px] leading-snug">
                  {ed.from.form} <span className="text-faint mx-1">→</span> {ed.to.form}
                  {ed.drift
                    .filter((x) => x !== "NONE")
                    .map((x) => (
                      <span key={x} className="ml-2.5 text-[12px]" style={{ color: "var(--hyp)" }}>
                        {x.toLowerCase()}
                      </span>
                    ))}
                  {ed.status === "contested" && <span className="ml-2.5"><ContestedBadge /></span>}
                </span>
                <span className="flex items-baseline gap-3 sm:justify-end">
                  <span className="font-mono text-[10.5px] text-faint">{ed.source_ref.join(", ")}</span>
                  <Confidence value={ed.confidence} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── alignment ───────────────────────────────────────────── */}
      {d.aligned.length > 0 && (
        <section>
          <SectionHead>Aligned across the three languages</SectionHead>
          <ul>
            {d.aligned.map((a) => (
              <li
                key={a.entry.id}
                className="grid grid-cols-[3.2rem_1fr_auto] gap-x-5 py-3 items-baseline"
                style={{ borderTop: "1px solid var(--rule)" }}
              >
                <span
                  className="text-[11px] tracking-[0.07em] text-faint"
                  style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
                >
                  {a.entry.lang}
                </span>
                <span className="flex items-baseline gap-3 flex-wrap">
                  <Link href={slug.entryHref(a.entry.id)} className="text-[19px] font-serif hover:text-accent transition-colors">
                    {a.entry.form}
                  </Link>
                  {a.entry.form !== a.entry.translit && (
                    <span className="font-mono text-[11.5px] text-faint">{a.entry.translit}</span>
                  )}
                </span>
                <span
                  className="text-[11px] tracking-[0.07em]"
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    fontVariantCaps: "all-small-caps",
                    color: a.relation === "TRANSLATION" ? "var(--muted)" : "var(--accent-ink)",
                  }}
                >
                  {a.relation.replace("_", " ").toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ExplanationBlock explanation={d.explanation} notes={e.notes || undefined} />
    </article>
  );
}
