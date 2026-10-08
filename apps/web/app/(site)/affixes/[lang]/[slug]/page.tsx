import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import type { LangCode } from "@/lib/lang";
import { LANG_CODES, LANG_NAME, REGISTER_NAME, chipClass, langAttr } from "@/lib/lang";
import { LaneRow } from "@/components/lane-row";
import { EpiTag, FamilyDot, ReviewTag } from "@/components/marks";
import { pageMeta } from "@/lib/seo";

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
  if (!d) return { title: "Affix" };
  const fn = d.functions.map((f) => f.label).join(", ");
  return pageMeta({ title: `${d.affix.form} — ${LANG_NAME[d.affix.lang]} affix`, description: `${d.affix.form} (${d.affix.translit}) is a ${LANG_NAME[d.affix.lang]} ${d.affix.kind.replace("_", " ")} that forms ${fn}; productivity ${d.affix.productivity}. Examples and cross-lingual equivalents.`, path: `/affixes/${lang}/${s}/` });
}

const PRODUCTIVITY: Record<string, { n: number; text: string }> = {
  high: { n: 4, text: "freely attaches to new bases" },
  mid: { n: 3, text: "attaches to a sizeable but bounded set" },
  low: { n: 2, text: "a handful of lexicalised forms" },
  dead: { n: 1, text: "no longer forms new words; survives in fossils" },
};

export default async function AffixPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: s } = await params;
  const d = await data.affix(slug.affixId(lang, s));
  if (!d) notFound();
  const a = d.affix;
  const fam = chipClass(lang);
  const prod = PRODUCTIVITY[a.productivity] ?? PRODUCTIVITY.mid;
  const details = await data.entryDetails();

  const eqByLang = Object.fromEntries(LANG_CODES.map((l) => [l, [] as typeof d.equivalents])) as Record<LangCode, typeof d.equivalents>;
  for (const q of d.equivalents) eqByLang[q.affix.lang as LangCode].push(q);

  return (
    <article className="space-y-14">
      <header>
        <nav className="text-[12.5px] text-muted mb-6" aria-label="Breadcrumb">
          <Link href="/affixes/" className="hover:text-ink">Affix Atlas</Link>
          <span className="mx-2 text-faint">/</span>
          <span>{LANG_NAME[a.lang]}</span>
        </nav>
        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-muted mb-4">
          <FamilyDot lang={a.lang} /> {LANG_NAME[a.lang]} {a.kind.replace("_", " ")}
        </span>
        <div className="flex flex-wrap items-center gap-5">
          <h1 className={`${fam} display inline-block rounded-2xl px-6 py-3 text-[clamp(34px,10vw,68px)] font-semibold`} lang={langAttr(a.lang)}>{a.form}</h1>
          <div className="space-y-1.5">
            {a.translit !== a.form && <div className="mono text-[17px] text-muted">{a.translit}</div>}
            <div className="text-[19px] font-medium">{d.functions.map((f) => f.label).join(" · ")}</div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-line" style={{ background: "var(--line)" }}>
        <div className="bg-surface p-5">
          <p className="kicker mb-2">Register</p>
          <p className="text-[17px] font-medium">{REGISTER_NAME[a.register] ?? a.register}</p>
        </div>
        <div className="bg-surface p-5">
          <p className="kicker mb-2">Productivity</p>
          <div className="flex items-center gap-2">
            <span className="flex gap-[3px]" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className="w-[6px] h-[14px] rounded-[1px]" style={{ background: i <= prod.n ? "var(--ink-2)" : "var(--line-2)" }} />
              ))}
            </span>
            <span className="text-[17px] font-medium">{a.productivity}</span>
          </div>
          <p className="text-[12px] text-muted mt-1">{prod.text}</p>
        </div>
        <div className="bg-surface p-5">
          <p className="kicker mb-2">Attaches to</p>
          <p className="text-[17px] font-medium">{a.attaches_to.join(" · ") || "—"}</p>
          {a.allomorphs.length > 0 && <p className="text-[12px] text-muted mt-1">allomorphs {a.allomorphs.join(", ")}</p>}
        </div>
        <div className="bg-surface p-5">
          <p className="kicker mb-2">Status</p>
          <div className="flex flex-wrap gap-1.5">
            <EpiTag status={a.epistemic_status} />
            <ReviewTag status={a.provenance.review_status} />
          </div>
          {a.provenance.source_refs.length > 0 && (
            <p className="mono text-[11.5px] text-muted mt-2">{a.provenance.source_refs.join(", ")}</p>
          )}
        </div>
      </section>

      {a.notes && (
        <aside className="rounded-lg border border-dashed border-line-2 px-5 py-4 max-w-[72ch]">
          <p className="kicker mb-1.5">Annotator note</p>
          <p className="text-[14.5px] leading-relaxed text-ink-2">{a.notes}</p>
        </aside>
      )}

      <section>
        <h2 className="wide text-[21px] font-semibold mb-4">Words built with {a.form}</h2>
        {d.examples.length === 0 ? (
          <p className="text-[14px] text-muted">No entry in the dataset uses this affix yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.examples.map((ex) => {
              const det = details[ex.id];
              return (
                <Link key={ex.id} href={slug.entryHref(ex.id)} className="panel p-4 hover:border-line-2 transition-colors group">
                  <div lang={langAttr(ex.lang)} className="text-[21px] font-semibold group-hover:text-ie-ink">{ex.form}</div>
                  {ex.form !== ex.translit && <div className="mono text-[11.5px] text-faint">{ex.translit}</div>}
                  <div className="text-[13px] text-muted mt-2">{ex.gloss}</div>
                  {det && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px]">
                      <span className="chip-stem rounded px-1.5">{det.entry.morphology.stem_form}</span>
                      {det.affixes.map((x) => (
                        <span key={x.id} className="inline-flex items-center gap-1.5">
                          <span className="text-faint">+</span>
                          <span className={`${fam} rounded px-1.5`} style={x.id === a.id ? undefined : { opacity: 0.55 }}>
                            {x.form}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {d.equivalents.length > 0 && (
        <section>
          <h2 className="wide text-[21px] font-semibold mb-1">Does the same job elsewhere</h2>
          <p className="text-[13px] text-muted mb-5">Functional equivalents, placed in their lanes. Same register is noted; most differ.</p>
          <div className="lanes">
            <LaneRow render={(l) => <Lane code={l.code} items={eqByLang[l.code]} self={a.lang === l.code ? a.form : null} />} />
          </div>
        </section>
      )}
    </article>
  );
}

function Lane({ code, items, self }: { code: LangCode; items: { affix: { id: string; form: string; translit: string }; note: string }[]; self: string | null }) {
  return (
    <div className="py-2 lg:px-3">
      <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold mb-3">
        <FamilyDot lang={code} /> {LANG_NAME[code]}
      </p>
      {self && <p className="text-[13px] text-faint mb-2">this affix: {self}</p>}
      {items.length === 0 && !self && <p className="text-faint">—</p>}
      <ul className="space-y-2.5">
        {items.map((q) => (
          <li key={q.affix.id}>
            <Link href={slug.affixHref(q.affix.id)} lang={langAttr(code)} className={`${chipClass(code)} inline-block rounded-md px-2 py-0.5 text-[16px] hover:-translate-y-[1px] transition-transform`}>
              {q.affix.form}
            </Link>
            <div className="text-[12px] text-muted mt-1">{q.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
