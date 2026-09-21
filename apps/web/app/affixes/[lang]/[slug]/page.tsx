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

const PRODUCTIVITY_NOTE: Record<string, string> = {
  high: "freely attaches to new bases",
  mid: "attaches to a sizeable but bounded set",
  low: "a handful of lexicalised forms",
  dead: "no longer forms new words — survives only in fossils",
};

export default async function AffixPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.affix(slug.affixId(lang, s));
  if (!d) notFound();
  const a = d.affix;

  const rows: [string, React.ReactNode][] = [
    ["function", d.functions.map((f) => `${f.label} (${f.id})`).join(" · ")],
    [
      "productivity",
      <span key="p">
        {a.productivity}
        <span className="text-faint"> — {PRODUCTIVITY_NOTE[a.productivity]}</span>
      </span>,
    ],
    ["register", <RegisterBadge key="r" register={a.register} />],
    ...(a.allomorphs.length ? ([["allomorphs", a.allomorphs.join(" · ")]] as [string, React.ReactNode][]) : []),
    ...(a.attaches_to.length ? ([["attaches to", a.attaches_to.join(" · ")]] as [string, React.ReactNode][]) : []),
    ...(a.provenance.source_refs.length
      ? ([["sources", a.provenance.source_refs.join(" · ")]] as [string, React.ReactNode][])
      : []),
  ];

  return (
    <div className="space-y-20">
      <header>
        <p className="label mb-5">
          {LANG_NAME[a.lang]} {a.kind.replace("_", " ")} · <ReviewBadge status={a.provenance.review_status} />
        </p>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {/* the affix itself, carrying the cut that marks where it attaches */}
          <span className="flex items-stretch">
            <span
              className="w-px self-stretch mr-3"
              style={{ background: "var(--accent)", opacity: 0.6 }}
              aria-hidden="true"
            />
            <h1 className="font-serif text-[44px] leading-none">{a.form}</h1>
          </span>
          {a.translit !== a.form && <span className="font-mono text-[17px] text-muted">{a.translit}</span>}
          <EpiBadge status={a.epistemic_status} />
        </div>
        <p className="font-mono text-[10.5px] text-faint mt-4">{a.id}</p>
      </header>

      <section className="grid md:grid-cols-[minmax(0,26rem)_1fr] gap-10 md:gap-14 items-start">
        <dl>
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-x-4 py-2.5" style={{ borderTop: "1px solid var(--rule)" }}>
              <dt className="label pt-[3px]">{k}</dt>
              <dd className="text-[14px] leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
        {a.notes && (
          <div className="pl-5 py-1" style={{ borderLeft: "2px solid var(--rule-hi)" }}>
            <p className="label mb-1.5">Annotator note</p>
            <p className="font-serif text-[15.5px] leading-relaxed italic max-w-[52ch]">{a.notes}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-[15px] mb-4" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Words built with it
        </h2>
        <EntryList entries={d.examples} />
      </section>

      {d.equivalents.length > 0 && (
        <section>
          <div className="flex items-baseline gap-4 flex-wrap mb-4">
            <h2 className="font-serif text-[15px]" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
              Does the same job elsewhere
            </h2>
            <span className="text-[11.5px] text-faint">functionally equivalent, not interchangeable</span>
          </div>
          <ul>
            {d.equivalents.map((q, i) => (
              <li
                key={i}
                className="grid grid-cols-[3.2rem_minmax(0,9rem)_1fr] gap-x-5 py-3 items-baseline"
                style={{ borderTop: "1px solid var(--rule)" }}
              >
                <span
                  className="text-[11px] tracking-[0.07em] text-faint"
                  style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
                >
                  {q.affix.lang}
                </span>
                <span className="flex items-baseline gap-2.5">
                  <Link href={slug.affixHref(q.affix.id)} className="text-[18px] font-serif hover:text-accent transition-colors">
                    {q.affix.form}
                  </Link>
                  {q.affix.translit !== q.affix.form && (
                    <span className="font-mono text-[11px] text-faint">{q.affix.translit}</span>
                  )}
                </span>
                <span className="text-[12.5px] text-muted leading-snug">{q.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
