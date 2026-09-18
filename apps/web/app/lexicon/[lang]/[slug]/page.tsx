import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import { Confidence, ContestedBadge, EpiBadge, LANG_NAME, RegisterBadge, ReviewBadge } from "@/components/badges";
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
  return { title: d ? d.entry.lemma.form : "Entry" };
}

export default async function EntryPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.entry(slug.entryId(lang, s));
  if (!d) notFound();
  const e = d.entry;
  const etym = (await data.etymology())[e.id];

  return (
    <div className="space-y-12">
      <header>
        <p className="eyebrow mb-2">{LANG_NAME[e.lang]} · {e.pos}</p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-[42px] leading-tight">{e.lemma.form}</h1>
          {e.lemma.form !== e.lemma.translit && (
            <span className="font-mono text-xl text-muted">{e.lemma.translit}</span>
          )}
          <span className="flex gap-1.5 items-baseline">
            <RegisterBadge register={e.register} />
            <ReviewBadge status={e.provenance.review_status} />
          </span>
        </div>
        {d.concept && <p className="text-muted mt-1 text-[16px]">‘{d.concept.gloss}’</p>}
        <p className="font-mono text-[10.5px] text-muted opacity-60 mt-1">{e.id}</p>
      </header>

      <section>
        <h2 className="text-xl mb-3">Morphology</h2>
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-[15px]">
          <span className="border hairline rounded-md px-3 py-1.5 bg-card">{e.morphology.stem_form}</span>
          {d.affixes.map((a, i) => (
            <span key={i} className="flex items-center gap-2.5">
              <span className="text-muted">+</span>
              <Link href={slug.affixHref(a.id)}
                className="border rounded-md px-3 py-1.5 bg-card hover:bg-accent-soft transition-colors"
                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                {a.form}
                {a.translit !== a.form && <span className="text-[12px] opacity-70 ml-1.5">{a.translit}</span>}
              </Link>
            </span>
          ))}
        </div>
        <p className="font-mono text-[11px] text-muted mt-3">
          schema {e.morphology.schema} · segmentation confidence {e.morphology.segmentation_confidence.toFixed(2)}
          {d.functions.length > 0 && <> · {d.functions.map((f) => `${f.label} (${f.id})`).join(", ")}</>}
        </p>
      </section>

      {d.concept && (
        <section>
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-xl">Semantic decomposition</h2>
            <EpiBadge status={d.concept.structure_status} />
          </div>
          <p className="font-mono text-[14.5px] bg-code rounded-md px-4 py-3 overflow-x-auto">{d.structure_pretty}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {d.atoms.map((a) => (
              <Link key={a.id} href={slug.atomHref(a.id)}
                className="font-mono text-[11px] border hairline rounded px-2 py-0.5 hover:border-accent hover:text-accent transition-colors">
                {a.id.replace("atom:", "")}
              </Link>
            ))}
          </div>
        </section>
      )}

      {d.edges.length > 0 && (
        <section>
          <div className="flex items-baseline gap-4 flex-wrap mb-3">
            <h2 className="text-xl">Etymology</h2>
            {etym && (
              <Link href={slug.etymologyHref(e.id)} className="text-[13px] underline underline-offset-2 hover:text-accent"
                style={{ color: "var(--accent)" }}>
                full lineage graph →
              </Link>
            )}
          </div>
          <ul className="space-y-1.5">
            {d.edges.map((ed) => (
              <li key={ed.id} className="text-[14px] flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span className="font-mono text-[10.5px] text-muted w-20">{ed.type}</span>
                <span>{ed.from.form} → {ed.to.form}</span>
                {ed.drift.filter((x) => x !== "NONE").map((x) => (
                  <span key={x} className="text-[11px]" style={{ color: "var(--hyp)" }}>{x.toLowerCase()}</span>
                ))}
                <Confidence value={ed.confidence} />
                <span className="font-mono text-[10.5px] text-muted">[{ed.source_ref.join(", ")}]</span>
                {ed.status === "contested" && <ContestedBadge />}
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.aligned.length > 0 && (
        <section>
          <h2 className="text-xl mb-3">Aligned forms</h2>
          <ul className="space-y-1.5">
            {d.aligned.map((a) => (
              <li key={a.entry.id} className="text-[14.5px] flex flex-wrap gap-x-2.5 items-baseline">
                <span className="font-mono text-[10.5px] text-muted w-14">{LANG_NAME[a.entry.lang]}</span>
                <Link href={slug.entryHref(a.entry.id)} className="text-[16px] hover:text-accent transition-colors">
                  {a.entry.form}
                </Link>
                {a.entry.form !== a.entry.translit && (
                  <span className="font-mono text-[12px] text-muted">{a.entry.translit}</span>
                )}
                <span className="font-mono text-[10.5px]" style={{ color: "var(--accent)" }}>{a.relation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ExplanationBlock explanation={d.explanation} notes={e.notes || undefined} />
    </div>
  );
}
