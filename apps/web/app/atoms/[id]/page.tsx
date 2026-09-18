import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { EpiBadge } from "@/components/badges";
import { EntryList } from "@/components/entry-list";

export const dynamic = "force-dynamic";

export default async function AtomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let d;
  try {
    d = await api.atom(decodeURIComponent(id));
  } catch {
    notFound();
  }
  const a = d.atom;
  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-mono">{a.id.replace("atom:", "")}</h1>
          <span className="font-mono text-xs text-neutral-400">{a.category}</span>
          <EpiBadge status={a.epistemic_status} />
          {a.nsm_prime && <span className="text-xs font-mono text-neutral-500">NSM prime</span>}
        </div>
        <p className="text-neutral-700 mt-1">{a.definition}</p>
      </header>

      <section>
        <h2 className="text-lg mb-2">Exponents</h2>
        <table className="text-sm border-collapse">
          <tbody>
            {(["en", "te", "hi"] as const).map((l) => (
              <tr key={l} className="border-b border-neutral-200">
                <td className="pr-4 py-1 text-neutral-500 font-mono text-xs">{l}</td>
                <td className="py-1 text-lg">{a.exponents[l]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {d.related.length > 0 && (
        <section>
          <h2 className="text-lg mb-2">Related atoms</h2>
          <ul className="flex flex-wrap gap-2">
            {a.related.map((r, i) => (
              <li key={i}>
                <Link href={`/atoms/${encodeURIComponent(r.atom_id)}`}
                  className="font-mono text-xs border border-neutral-300 rounded px-1.5 py-0.5 hover:border-accent">
                  {r.relation}: {r.atom_id.replace("atom:", "")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg mb-2">Words whose decomposition uses this atom</h2>
        <EntryList entries={d.entries} />
      </section>

      <p className="text-xs text-neutral-500 border-t border-neutral-200 pt-3 italic">
        Semantic atoms are an engineering interlingua, not a theory of human cognition.
      </p>
    </div>
  );
}
