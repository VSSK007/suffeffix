import Link from "next/link";
import { data, slug } from "@/lib/data";
import type { Affix } from "@/lib/api";
import { EpiBadge } from "@/components/badges";

export const metadata = { title: "Affix Atlas" };

/* The matrix is the flagship. It is set as a ruled table with the Telugu
   column tinted by its family hue — the point of the whole page is that the
   middle column belongs to a different family from the two beside it. */

function AffixCell({ a }: { a: Affix }) {
  return (
    <Link href={slug.affixHref(a.id)} className="group inline-flex items-baseline gap-1.5 mr-3.5">
      <span className="text-[16px] font-serif group-hover:text-accent transition-colors">{a.form}</span>
      <span className="font-mono text-[9.5px] text-faint">{a.register}</span>
    </Link>
  );
}

export default async function AffixesPage() {
  const [affixes, functions] = await Promise.all([data.affixes(), data.functions()]);

  const matrix = new Map<string, Record<"en" | "te" | "hi", Affix[]>>();
  for (const f of functions) matrix.set(f.id, { en: [], te: [], hi: [] });
  for (const a of affixes) for (const f of a.functions) matrix.get(f)?.[a.lang]?.push(a);

  const rows = functions.filter((f) => {
    const r = matrix.get(f.id)!;
    return r.en.length || r.te.length || r.hi.length;
  });

  return (
    <div className="space-y-12">
      <header className="max-w-[58ch]">
        <p className="label mb-4">function × language</p>
        <h1 className="font-serif text-[34px] leading-tight">The Affix Atlas</h1>
        <p className="mt-5 text-[15px] leading-[1.75] text-muted">
          Each row is one job a language can give an affix; each cell holds the affixes that do that
          job. Members of a row are <em className="text-ink not-italic">functional</em> equivalents —
          they differ in distribution, register, and productivity, and swapping one for another will
          usually produce nonsense. The alignment is an engineering claim, not a licence to translate
          morpheme by morpheme.
        </p>
        <p className="mt-4 font-mono text-[11.5px] text-faint leading-relaxed">
          register — N native · S Sanskritic · P Perso-Arabic · E learned stratum
        </p>
      </header>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[720px]" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th className="text-left py-2.5 pr-6 w-48" style={{ borderBottom: "2px solid var(--ink)" }}>
                <span className="label">function</span>
              </th>
              {(
                [
                  ["en", "English", "var(--indo)"],
                  ["te", "Telugu", "var(--drav)"],
                  ["hi", "Hindi", "var(--indo)"],
                ] as const
              ).map(([code, name, hue]) => (
                <th key={code} className="text-left py-2.5 pr-6" style={{ borderBottom: "2px solid var(--ink)" }}>
                  <span className="flex items-baseline gap-2">
                    <span
                      className="inline-block w-2 h-2 shrink-0 translate-y-[-1px]"
                      style={{ background: hue }}
                      aria-hidden="true"
                    />
                    <span className="font-serif text-[15px]">{name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => {
              const row = matrix.get(f.id)!;
              return (
                <tr key={f.id} className="align-top" style={{ borderTop: "1px solid var(--rule)" }}>
                  <td className="py-4 pr-6">
                    <div className="font-serif text-[16px] leading-tight">{f.label}</div>
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-[10px] text-faint">{f.id}</span>
                      <EpiBadge status={f.epistemic_status} />
                    </div>
                  </td>
                  {(["en", "te", "hi"] as const).map((l) => (
                    <td
                      key={l}
                      className="py-4 pr-6"
                      style={l === "te" ? { background: "color-mix(in srgb, var(--drav) 5%, transparent)" } : undefined}
                    >
                      <div className="flex flex-wrap gap-y-2">
                        {row[l].length ? (
                          row[l].map((a) => <AffixCell key={a.id} a={a} />)
                        ) : (
                          <span className="text-faint font-mono text-[12px]">—</span>
                        )}
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
