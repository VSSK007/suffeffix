import Link from "next/link";
import { data, slug } from "@/lib/data";

export const metadata = { title: "Semantic atoms" };

const CATEGORY_ORDER = ["FOUNDATIONAL", "RELATIONAL", "STATE", "ACTION", "EMOTIONAL", "SOCIAL"];

/* The atom inventory is small and closed, so it is set as a specimen sheet:
   every atom on one page, in three scripts, with primes marked by an asterisk
   the way a reconstructed form is. */
export default async function AtomsPage() {
  const atoms = await data.atoms();
  const primes = atoms.filter((a) => a.nsm_prime).length;

  return (
    <div className="space-y-14">
      <header className="max-w-[58ch]">
        <p className="label mb-4">the closed inventory · {atoms.length} of a possible 50</p>
        <h1 className="font-serif text-[34px] leading-tight">Semantic atoms</h1>
        <p className="mt-6 font-serif text-[21px] leading-[1.6] pl-5" style={{ borderLeft: "2px solid var(--accent)" }}>
          Semantic atoms are an engineering interlingua, not a theory of human cognition.
        </p>
        <p className="mt-5 text-[14.5px] leading-[1.75] text-muted">
          {primes} of them are marked <span style={{ color: "var(--est)" }}>*</span> because they are
          Natural Semantic Metalanguage primes (Wierzbicka, Goddard) — established as members of that
          inventory, which is not the same as being proven cognitive universals. The remaining{" "}
          {atoms.length - primes} were admitted only because the concept list required them, and the
          ceiling of fifty is enforced by the validator so the interlingua cannot quietly become an
          ontology.
        </p>
      </header>

      {CATEGORY_ORDER.map((cat) => {
        const group = atoms.filter((a) => a.category === cat);
        if (!group.length) return null;
        return (
          <section key={cat}>
            <h2
              className="font-serif text-[15px] mb-3"
              style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}
            >
              {cat.toLowerCase()} <span className="text-faint">· {group.length}</span>
            </h2>
            <div style={{ borderBottom: "1px solid var(--rule)" }}>
              {group.map((a) => (
                <Link
                  key={a.id}
                  href={slug.atomHref(a.id)}
                  className="group grid grid-cols-[minmax(0,9rem)_1fr] sm:grid-cols-[minmax(0,9rem)_minmax(0,16rem)_1fr] gap-x-5 gap-y-0.5 py-2.5 items-baseline"
                  style={{ borderTop: "1px solid var(--rule)" }}
                >
                  <span className="font-mono text-[13.5px] group-hover:text-accent transition-colors">
                    {a.nsm_prime && (
                      <span style={{ color: "var(--est)" }} title="NSM prime" aria-label="NSM prime">
                        *
                      </span>
                    )}
                    {a.id.replace("atom:", "")}
                  </span>
                  <span className="text-[14.5px] flex gap-3 flex-wrap">
                    <span>{a.exponents.en}</span>
                    <span className="text-faint">·</span>
                    <span>{a.exponents.te}</span>
                    <span className="text-faint">·</span>
                    <span>{a.exponents.hi}</span>
                  </span>
                  <span className="text-[12.5px] text-muted col-start-2 sm:col-start-3 leading-snug">
                    {a.definition}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
