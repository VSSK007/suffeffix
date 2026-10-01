import { data } from "@/lib/data";
import { AtomTable } from "@/components/atom-table";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Semantic atoms", description: "The closed inventory of fifty semantic atoms — an engineering interlingua seeded from NSM primes — with exponents in English, Hindi and Telugu.", path: "/atoms/" });

export default async function AtomsPage() {
  const [atoms, concepts] = await Promise.all([data.atoms(), data.concepts()]);
  const usage: Record<string, number> = {};
  for (const c of concepts) for (const a of c.atoms) usage[a] = (usage[a] ?? 0) + 1;
  const primes = atoms.filter((a) => a.nsm_prime).length;

  return (
    <div className="space-y-12">
      <header className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-end">
        <div>
          <p className="kicker mb-3">Semantic atoms</p>
          <h1 className="display text-[40px] sm:text-[52px] font-semibold">
            {atoms.length} atoms,
            <br />
            and not one more
          </h1>
        </div>
        <div className="space-y-3 max-w-[56ch]">
          <p className="text-[18px] leading-[1.5] font-medium border-l-[3px] border-ie pl-4">
            Semantic atoms are an engineering interlingua, not a theory of human cognition.
          </p>
          <p className="text-[14px] leading-[1.7] text-ink-2">
            Solid cells are the {primes} Natural Semantic Metalanguage primes (Wierzbicka, Goddard) —
            established as members of that inventory, not as proven universals. Dashed cells are the{" "}
            {atoms.length - primes} additions this dataset needed. The validator caps the inventory at fifty,
            so it cannot quietly grow into an ontology.
          </p>
        </div>
      </header>

      <AtomTable atoms={atoms} usage={usage} />

      <p className="text-[12.5px] text-muted">
        The small number at the top right of each cell counts the meanings whose decomposition uses that
        atom. Hover an atom to light up its opposites and relations.
      </p>
    </div>
  );
}
