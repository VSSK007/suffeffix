import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import { LANES, langAttr } from "@/lib/lang";
import { LaneRow } from "@/components/lane-row";
import { EpiTag, FamilyDot } from "@/components/marks";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const atoms = await data.atoms();
  return atoms.map((a) => ({ name: slug.atom(a.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const d = await data.atom(slug.atomId(name));
  return pageMeta({ title: `${name} — semantic atom`, description: d ? `${name}: ${d.atom.definition}. Exponents — ${LANES.map((l) => `${l.name} ${d.atom.exponents[l.code]}`).join(", ")}.` : undefined, path: `/atoms/${name}/` });
}

export default async function AtomPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const id = slug.atomId(name);
  const d = await data.atom(id);
  if (!d) notFound();
  const a = d.atom;
  const concepts = (await data.concepts()).filter((c) => c.atoms.includes(id));

  return (
    <article className="space-y-14">
      <header>
        <nav className="text-[12.5px] text-muted mb-6" aria-label="Breadcrumb">
          <Link href="/atoms/" className="hover:text-ink">Semantic atoms</Link>
          <span className="mx-2 text-faint">/</span>
          <span>{a.category.toLowerCase()}</span>
        </nav>
        <div className="flex flex-wrap items-end gap-6">
          <div
            className="rounded-2xl px-7 py-5"
            style={{ background: a.nsm_prime ? "var(--surface)" : "transparent", border: `2px ${a.nsm_prime ? "solid" : "dashed"} var(--line-2)` }}
          >
            <h1 className="mono text-[44px] sm:text-[56px] font-medium leading-none">{name}</h1>
          </div>
          <div className="space-y-2 pb-1">
            <div className="flex flex-wrap gap-1.5">
              <EpiTag status={a.epistemic_status} />
              <span className="text-[12.5px] text-muted">{a.nsm_prime ? "NSM prime" : "engineering addition"} · {a.category.toLowerCase()}</span>
            </div>
            <p className="text-[19px] text-ink-2">{a.definition}</p>
          </div>
        </div>
      </header>

      <section>
        <h2 className="wide text-[21px] font-semibold mb-4">How each language says it</h2>
        <div className="lanes panel py-5">
          <LaneRow
            render={(l) => (
              <div className="px-5 py-2">
                <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold mb-2"><FamilyDot lang={l.code} /> {l.name}</p>
                <p lang={langAttr(l.code)} className="display text-[28px] font-semibold">{a.exponents[l.code]}</p>
              </div>
            )}
          />
        </div>
      </section>

      {d.related.length > 0 && (
        <section>
          <h2 className="wide text-[21px] font-semibold mb-4">Related atoms</h2>
          <div className="flex flex-wrap gap-2">
            {a.related.map((r) => (
              <Link key={r.atom_id} href={slug.atomHref(r.atom_id)} className="panel px-4 py-2.5 hover:border-line-2 transition-colors">
                <span className="text-[11.5px] text-muted block">{r.relation}</span>
                <span className="mono text-[15px] font-medium">{r.atom_id.replace("atom:", "")}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="wide text-[21px] font-semibold mb-1">Meanings built with {name}</h2>
        <p className="text-[13px] text-muted mb-4">{concepts.length} {concepts.length === 1 ? "meaning uses" : "meanings use"} this atom in their decomposition.</p>
        <div className="border-y border-line divide-y divide-[var(--line)]">
          {concepts.map((c) => (
            <Link key={c.id} href={slug.conceptHref(c.id)} className="lanes-labelled py-3 hover:bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] transition-colors">
              <div className="pr-4">
                <div className="text-[13.5px] text-ink-2">{c.gloss}</div>
                <div className="mono text-[10.5px] text-faint mt-0.5 truncate">{c.structure}</div>
              </div>
              <LaneRow
                render={(l) => (
                  <div lang={langAttr(l.code)} className="lg:px-3 text-[15px] font-medium">{c.lanes[l.code].map((e) => e.form).join(", ") || <span className="text-faint">—</span>}</div>
                )}
              />
            </Link>
          ))}
        </div>
      </section>

      <p className="text-[12.5px] text-muted">Semantic atoms are an engineering interlingua, not a theory of human cognition.</p>
    </article>
  );
}
