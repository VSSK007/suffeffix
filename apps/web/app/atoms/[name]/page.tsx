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
    <div className="space-y-18">
      <header>
        <p className="label mb-5">
          {a.category.toLowerCase()} atom{a.nsm_prime ? " · NSM prime" : " · engineering addition"}
        </p>
        <div className="flex flex-wrap items-baseline gap-4">
          <h1 className="font-mono text-[40px] leading-none">
            {a.nsm_prime && (
              <span style={{ color: "var(--est)" }} aria-label="NSM prime">
                *
              </span>
            )}
            {name}
          </h1>
          <EpiBadge status={a.epistemic_status} />
        </div>
        <p className="font-serif text-[18px] italic mt-4 max-w-[48ch]">{a.definition}</p>
      </header>

      {/* exponents as a three-column specimen — the whole point of an atom is
          that it lands differently in each language */}
      <section className="mt-12">
        <h2 className="font-serif text-[15px] mb-4" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Exponents
        </h2>
        <div className="grid grid-cols-3 max-w-xl" style={{ borderTop: "1px solid var(--rule)" }}>
          {(
            [
              ["en", "English", "var(--indo)"],
              ["te", "Telugu", "var(--drav)"],
              ["hi", "Hindi", "var(--indo)"],
            ] as const
          ).map(([l, label, hue]) => (
            <div key={l} className="py-4 pr-5">
              <p className="label flex items-baseline gap-1.5">
                <span className="inline-block w-2 h-2" style={{ background: hue }} aria-hidden="true" />
                {label}
              </p>
              <p className="text-[22px] font-serif mt-2">{a.exponents[l]}</p>
            </div>
          ))}
        </div>
      </section>

      {d.related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-[15px] mb-4" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
            Related atoms
          </h2>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {a.related.map((r, i) => (
              <li key={i}>
                <Link href={slug.atomHref(r.atom_id)} className="group flex items-baseline gap-2">
                  <span
                    className="text-[11px] tracking-[0.07em] text-faint"
                    style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
                  >
                    {r.relation}
                  </span>
                  <span className="font-mono text-[13.5px] group-hover:text-accent transition-colors">
                    {r.atom_id.replace("atom:", "")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-[15px] mb-4" style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}>
          Decompositions that use {name}
        </h2>
        <EntryList entries={d.entries} />
      </section>

      <p className="mt-12 pt-5 text-[12.5px] text-faint italic" style={{ borderTop: "1px solid var(--rule)" }}>
        Semantic atoms are an engineering interlingua, not a theory of human cognition.
      </p>
    </div>
  );
}
