import Link from "next/link";
import { api } from "@/lib/api";
import { EpiBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function AtomsPage() {
  const atoms = await api.atoms();
  const categories = [...new Set(atoms.map((a) => a.category))].sort();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl">Semantic Atom Explorer</h1>
        <p className="text-sm mt-2 max-w-2xl border-l-4 border-accent pl-3 italic">
          Semantic atoms are an engineering interlingua, not a theory of human cognition.
        </p>
        <p className="text-xs text-neutral-500 mt-2 max-w-2xl">
          Atoms marked ESTABLISHED are Natural Semantic Metalanguage primes (Wierzbicka/Goddard) — established
          as members of that inventory, not as proven cognitive universals. The rest are ENGINEERING additions.
        </p>
      </header>
      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="text-lg mb-2 font-mono text-sm text-neutral-500">{cat}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {atoms.filter((a) => a.category === cat).map((a) => (
              <Link key={a.id} href={`/atoms/${encodeURIComponent(a.id)}`}
                className="border border-neutral-300 rounded p-2 hover:border-accent bg-white">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm">{a.id.replace("atom:", "")}</span>
                  <EpiBadge status={a.epistemic_status} />
                  {a.nsm_prime && <span className="text-[10px] font-mono text-neutral-400">NSM</span>}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {a.exponents.en} · {a.exponents.te} · {a.exponents.hi}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
