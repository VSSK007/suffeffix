import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import { LANES, LANG_CODES } from "@/lib/lang";
import { Triptych } from "@/components/triptych";
import { EpiTag, FamilyDot } from "@/components/marks";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const rows = await data.concepts();
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: s } = await params;
  const r = await data.conceptBySlug(s);
  if (!r) return { title: "Meaning" };
  const words = LANG_CODES.flatMap((l) => r.lanes[l].map((e) => e.form)).join(", ");
  return pageMeta({ title: r.gloss, description: `${r.gloss}: ${words}. The same meaning in English, French, Hindi, Telugu and Tamil, with each word’s affixes and decomposition.`, path: `/concepts/${s}/` });
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: s } = await params;
  const row = await data.conceptBySlug(s);
  if (!row) notFound();
  const [atoms, etym] = await Promise.all([data.atoms(), data.etymology()]);
  const atomById = new Map(atoms.map((a) => [a.id, a]));
  const words = LANES.flatMap((l) => row.lanes[l.code]);
  const withEtym = words.filter((w) => etym[w.id]);

  return (
    <article className="space-y-14">
      <header>
        <nav className="text-[12.5px] text-muted mb-5" aria-label="Breadcrumb">
          <Link href="/lexicon/" className="hover:text-ink">Concordance</Link>
          <span className="mx-2 text-faint">/</span>
          <span>meaning</span>
        </nav>
        <h1 className="display text-[40px] sm:text-[56px] font-semibold max-w-[20ch]">{row.gloss}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="mono text-[14px] rounded-lg bg-sunk px-3 py-1.5">{row.structure}</span>
          <EpiTag status={row.structureStatus} />
          {row.partial && (
            <span className="text-[12.5px] text-muted">Not lexicalised in every language in this dataset.</span>
          )}
        </div>
      </header>

      <section className="panel p-5 sm:p-7">
        <Triptych row={row} size="lg" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="wide text-[19px] font-semibold mb-1">Built from these atoms</h2>
          <p className="text-[13px] text-muted mb-4">
            The decomposition {row.structureStatus === "HYPOTHESIS" ? "is a coarse approximation" : "is an engineering representation"} —
            semantic atoms are an engineering interlingua, not a theory of human cognition.
          </p>
          <ul className="divide-y divide-[var(--line)] border-y border-line">
            {row.atoms.map((id) => {
              const a = atomById.get(id);
              if (!a) return null;
              return (
                <li key={id}>
                  <Link href={slug.atomHref(id)} className="group flex items-baseline gap-4 py-2.5">
                    <span className="mono text-[13.5px] font-medium w-28 shrink-0 group-hover:text-ie-ink">{id.replace("atom:", "")}</span>
                    <span className="text-[13.5px] text-muted">{a.definition}</span>
                    <span className="ml-auto text-[13px] text-ink-2 hidden sm:inline">
                      {LANES.map((l) => a.exponents[l.code]).join(" · ")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2 className="wide text-[19px] font-semibold mb-1">Each word in full</h2>
          <p className="text-[13px] text-muted mb-4">Morphology, etymology and the generated explanation live on each word’s page.</p>
          <ul className="divide-y divide-[var(--line)] border-y border-line">
            {words.map((w) => (
              <li key={w.id} className="flex items-baseline gap-3 py-2.5">
                <FamilyDot lang={w.lang} />
                <Link href={slug.entryHref(w.id)} className="text-[16px] font-medium hover:text-ie-ink">{w.form}</Link>
                {w.form !== w.translit && <span className="mono text-[11.5px] text-faint">{w.translit}</span>}
                {etym[w.id] && (
                  <Link href={slug.etymologyHref(w.id)} className="ml-auto text-[12.5px] text-ie-ink hover:underline underline-offset-4">
                    lineage →
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {withEtym.length === 0 && <p className="text-[12.5px] text-faint mt-3">No etymology recorded for these words yet.</p>}
        </div>
      </section>
    </article>
  );
}
