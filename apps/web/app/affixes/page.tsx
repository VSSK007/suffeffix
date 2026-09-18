import Link from "next/link";
import { data, slug } from "@/lib/data";
import type { Affix } from "@/lib/api";
import { EpiBadge } from "@/components/badges";

export const metadata = { title: "Affix Atlas" };

function AffixChip({ a }: { a: Affix }) {
  return (
    <Link href={slug.affixHref(a.id)}
      className="inline-flex items-baseline gap-1.5 border hairline rounded-md px-2.5 py-1 bg-card hover:border-accent transition-colors">
      <span className="text-[14.5px]">{a.form}</span>
      {a.translit !== a.form && <span className="font-mono text-[11px] text-muted">{a.translit}</span>}
      <span className="font-mono text-[9.5px] text-muted">{a.register}</span>
    </Link>
  );
}

export default async function AffixesPage() {
  const [affixes, functions] = await Promise.all([data.affixes(), data.functions()]);

  const matrix = new Map<string, Record<"en" | "te" | "hi", Affix[]>>();
  for (const f of functions) matrix.set(f.id, { en: [], te: [], hi: [] });
  for (const a of affixes) for (const f of a.functions) matrix.get(f)?.[a.lang]?.push(a);

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow mb-2">function × language</p>
        <h1 className="text-3xl">Affix Atlas</h1>
        <p className="text-[14px] text-muted max-w-[64ch] mt-3 leading-relaxed">
          Every row is a cross-lingual <em className="text-ink">function</em>; its cells hold the affixes that do
          that work in each language. Equivalence classes group <em className="text-ink">functional</em> equivalents
          whose distribution, register, and productivity differ — an engineering alignment, not interchangeability.
          Register key: <span className="font-mono text-[12px]">N</span> native ·{" "}
          <span className="font-mono text-[12px]">S</span> Sanskritic ·{" "}
          <span className="font-mono text-[12px]">P</span> Perso-Arabic ·{" "}
          <span className="font-mono text-[12px]">E</span> learned stratum.
        </p>
      </header>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full border-collapse min-w-[680px] text-[14px]">
          <thead>
            <tr className="text-left border-b-2" style={{ borderColor: "var(--ink)" }}>
              <th className="py-2.5 pr-4 font-serif text-[15.5px]">Function</th>
              <th className="py-2.5 pr-4 font-serif text-[15.5px]">English</th>
              <th className="py-2.5 pr-4 font-serif text-[15.5px]">Telugu</th>
              <th className="py-2.5 font-serif text-[15.5px]">Hindi</th>
            </tr>
          </thead>
          <tbody>
            {functions.map((f) => {
              const row = matrix.get(f.id)!;
              if (!row.en.length && !row.te.length && !row.hi.length) return null;
              return (
                <tr key={f.id} className="border-b hairline align-top">
                  <td className="py-3.5 pr-4 w-44">
                    <div className="font-medium">{f.label}</div>
                    <div className="font-mono text-[10px] text-muted mt-0.5 mb-1.5">{f.id}</div>
                    <EpiBadge status={f.epistemic_status} />
                  </td>
                  {(["en", "te", "hi"] as const).map((l) => (
                    <td key={l} className="py-3.5 pr-4">
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
    </div>
  );
}
