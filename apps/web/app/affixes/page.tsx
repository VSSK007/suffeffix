import Link from "next/link";
import { api, type Affix } from "@/lib/api";
import { EpiBadge, LANG_NAME, RegisterBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

function AffixChip({ a }: { a: Affix }) {
  return (
    <Link href={`/affixes/${encodeURIComponent(a.id)}`}
      className="inline-flex items-baseline gap-1.5 border border-neutral-300 rounded px-2 py-1 hover:border-accent bg-white">
      <span>{a.form}</span>
      {a.translit !== a.form && <span className="font-mono text-xs text-neutral-500">{a.translit}</span>}
      <span className="font-mono text-[10px] text-neutral-400">{a.register}</span>
    </Link>
  );
}

export default async function AffixesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [affixes, functions] = await Promise.all([
    api.affixes({ ...(sp.lang ? { lang: sp.lang } : {}), ...(sp.function ? { function: sp.function } : {}) }),
    api.functions(),
  ]);
  const all = sp.lang || sp.function ? await api.affixes() : affixes;

  // matrix: function x language
  const matrix = new Map<string, Record<string, Affix[]>>();
  for (const f of functions) matrix.set(f.id, { en: [], te: [], hi: [] });
  for (const a of all) {
    for (const f of a.functions) matrix.get(f)?.[a.lang]?.push(a);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl">Affix Atlas</h1>
        <p className="text-sm text-neutral-600 max-w-2xl mt-1">
          Affixes by language and by function. Equivalence classes group <em>functional</em> equivalents whose
          distribution, register, and productivity differ — an engineering alignment, not interchangeability.
        </p>
      </header>

      <div className="flex flex-wrap gap-3 text-sm items-baseline">
        <span className="text-neutral-500">Language:</span>
        {[undefined, "en", "te", "hi"].map((l) => (
          <Link key={l ?? "all"} href={`/affixes${l ? `?lang=${l}` : ""}`}
            className={`underline ${sp.lang === l || (!sp.lang && !l) ? "text-accent" : "text-neutral-600"}`}>
            {l ? LANG_NAME[l] : "all"}
          </Link>
        ))}
        <span className="text-neutral-400 ml-4 text-xs">Click a function row below to filter by function.</span>
      </div>

      {(sp.lang || sp.function) && (
        <section>
          <h2 className="text-lg mb-2">Filtered ({affixes.length})</h2>
          <div className="flex flex-wrap gap-2">{affixes.map((a) => <AffixChip key={a.id} a={a} />)}</div>
        </section>
      )}

      <section>
        <h2 className="text-lg mb-3">Function × language matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-neutral-400 text-left">
                <th className="py-2 pr-3">Function</th>
                <th className="py-2 pr-3">English</th>
                <th className="py-2 pr-3">Telugu</th>
                <th className="py-2">Hindi</th>
              </tr>
            </thead>
            <tbody>
              {functions.map((f) => {
                const row = matrix.get(f.id)!;
                if (!row.en.length && !row.te.length && !row.hi.length) return null;
                return (
                  <tr key={f.id} className="border-b border-neutral-200 align-top">
                    <td className="py-2 pr-3">
                      <div className="font-medium">{f.label}</div>
                      <div className="font-mono text-[10px] text-neutral-400">{f.id}</div>
                      <EpiBadge status={f.epistemic_status} />
                    </td>
                    {(["en", "te", "hi"] as const).map((l) => (
                      <td key={l} className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          {row[l].map((a) => <AffixChip key={a.id} a={a} />)}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
