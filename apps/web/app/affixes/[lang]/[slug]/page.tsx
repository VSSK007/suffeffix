import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import { EpiBadge, LANG_NAME, RegisterBadge, ReviewBadge } from "@/components/badges";
import { EntryList } from "@/components/entry-list";

export async function generateStaticParams() {
  const affixes = await data.affixes();
  return affixes.map((a) => {
    const [lang, s] = slug.affix(a.id);
    return { lang, slug: s };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.affix(slug.affixId(lang, s));
  return { title: d ? `${d.affix.form} (${LANG_NAME[d.affix.lang]})` : "Affix" };
}

export default async function AffixPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.affix(slug.affixId(lang, s));
  if (!d) notFound();
  const a = d.affix;

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow mb-2">{LANG_NAME[a.lang]} {a.kind.replace("_", " ")}</p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-[40px] leading-tight">{a.form}</h1>
          {a.translit !== a.form && <span className="font-mono text-xl text-muted">{a.translit}</span>}
          <span className="flex gap-1.5 items-baseline">
            <RegisterBadge register={a.register} />
            <EpiBadge status={a.epistemic_status} />
            <ReviewBadge status={a.provenance.review_status} />
          </span>
        </div>
        <p className="text-muted mt-1">
          {d.functions.map((f) => f.label).join(" · ")}
        </p>
        <p className="font-mono text-[10.5px] text-muted opacity-60 mt-1">{a.id}</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <dl className="text-[14px] space-y-2.5">
          {[
            ["Functions", d.functions.map((f) => `${f.label} (${f.id})`).join(", ")],
            ["Productivity", a.productivity],
            a.allomorphs.length ? ["Allomorphs", a.allomorphs.join(", ")] : null,
            a.attaches_to.length ? ["Attaches to", a.attaches_to.join(", ")] : null,
            a.provenance.source_refs.length ? ["Sources", a.provenance.source_refs.join(", ")] : null,
          ]
            .filter((x): x is [string, string] => x !== null)
            .map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="eyebrow w-28 shrink-0 pt-0.5">{k}</dt>
                <dd className="font-mono text-[13px]">{v}</dd>
              </div>
            ))}
        </dl>
        {a.notes && (
          <div className="border border-dashed hairline rounded-md p-4 bg-card text-[13.5px] leading-relaxed">
            <p className="eyebrow mb-1.5">Annotator note</p>
            {a.notes}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl mb-3">Examples</h2>
        <EntryList entries={d.examples} />
      </section>

      {d.equivalents.length > 0 && (
        <section>
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <h2 className="text-xl">Cross-lingual equivalents</h2>
            <span className="text-[11px] text-muted">functional, not interchangeable</span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {d.equivalents.map((q, i) => (
              <li key={i} className="text-[14.5px] flex flex-wrap gap-x-2.5 items-baseline">
                <span className="font-mono text-[10.5px] text-muted w-14">{LANG_NAME[q.affix.lang]}</span>
                <Link href={slug.affixHref(q.affix.id)} className="text-[16px] hover:text-accent transition-colors">
                  {q.affix.form}
                </Link>
                {q.affix.translit !== q.affix.form && (
                  <span className="font-mono text-[12px] text-muted">{q.affix.translit}</span>
                )}
                <span className="text-[11.5px] text-muted">{q.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
