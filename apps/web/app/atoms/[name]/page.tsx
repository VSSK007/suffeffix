import Link from "next/link";
import { notFound } from "next/navigation";
import { data, slug } from "@/lib/data";
import { EpiBadge } from "@/components/badges";
import { EntryList } from "@/components/entry-list";

export async function generateStaticParams() {
  const atoms = await data.atoms();
  return atoms.map((a) => ({ name: slug.atom(a.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return { title: `${name} · atom` };
}

export default async function AtomPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const d = await data.atom(slug.atomId(name));
  if (!d) notFound();
  const a = d.atom;
  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow mb-2">{a.category.toLowerCase()} atom{a.nsm_prime ? " · NSM prime" : ""}</p>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-mono text-[36px]">{name}</h1>
          <EpiBadge status={a.epistemic_status} />
        </div>
        <p className="text-muted mt-1 text-[15.5px]">{a.definition}</p>
      </header>

      <section>
        <h2 className="text-xl mb-3">Exponents</h2>
        <div className="grid grid-cols-3 max-w-md border hairline rounded-md bg-card divide-x"
          style={{ borderColor: "var(--line)" }}>
          {(["en", "te", "hi"] as const).map((l) => (
            <div key={l} className="p-3 hairline">
              <p className="eyebrow mb-1">{l}</p>
              <p className="text-[18px]">{a.exponents[l]}</p>
            </div>
          ))}
        </div>
      </section>

      {d.related.length > 0 && (
        <section>
          <h2 className="text-xl mb-3">Related atoms</h2>
          <div className="flex flex-wrap gap-2">
            {a.related.map((r, i) => (
              <Link key={i} href={slug.atomHref(r.atom_id)}
                className="font-mono text-[12px] border hairline rounded-md px-2.5 py-1 hover:border-accent hover:text-accent transition-colors">
                <span className="text-muted">{r.relation} · </span>{r.atom_id.replace("atom:", "")}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl mb-3">Words whose decomposition uses {name}</h2>
        <EntryList entries={d.entries} />
      </section>

      <p className="text-[12px] text-muted border-t hairline pt-4 italic">
        Semantic atoms are an engineering interlingua, not a theory of human cognition.
      </p>
    </div>
  );
}
