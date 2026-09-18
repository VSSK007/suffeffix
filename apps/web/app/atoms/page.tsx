import Link from "next/link";
import { data, slug } from "@/lib/data";
import { EpiBadge } from "@/components/badges";

export const metadata = { title: "Semantic atoms" };

const CATEGORY_ORDER = ["FOUNDATIONAL", "RELATIONAL", "STATE", "ACTION", "EMOTIONAL", "SOCIAL"];

export default async function AtomsPage() {
  const atoms = await data.atoms();
  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow mb-2">the bounded interlingua</p>
        <h1 className="text-3xl">Semantic atoms</h1>
        <p className="mt-4 max-w-[62ch] font-serif text-[17px] italic border-l-[3px] pl-4"
          style={{ borderColor: "var(--accent)" }}>
          Semantic atoms are an engineering interlingua, not a theory of human cognition.
        </p>
        <p className="text-[12.5px] text-muted mt-3 max-w-[64ch] leading-relaxed">
          Atoms marked ESTABLISHED are Natural Semantic Metalanguage primes (Wierzbicka / Goddard) — established
          as members of that inventory, not as proven cognitive universals. The rest are ENGINEERING additions,
          admitted only because the concept inventory required them; the total is capped at 50.
        </p>
      </header>

      {CATEGORY_ORDER.map((cat) => {
        const group = atoms.filter((a) => a.category === cat);
        if (!group.length) return null;
        return (
          <section key={cat}>
            <p className="eyebrow mb-3">{cat.toLowerCase()} · {group.length}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {group.map((a) => (
                <Link key={a.id} href={slug.atomHref(a.id)}
                  className="border hairline rounded-md p-3 bg-card hover:border-accent transition-colors">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[13.5px] font-medium">{a.id.replace("atom:", "")}</span>
                    <EpiBadge status={a.epistemic_status} />
                    {a.nsm_prime && <span className="font-mono text-[9px] text-muted tracking-widest">NSM</span>}
                  </div>
                  <div className="text-[13px] text-muted mt-1.5">
                    {a.exponents.en} · {a.exponents.te} · {a.exponents.hi}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
