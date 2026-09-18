import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { EpiBadge, LANG_NAME, RegisterBadge, ReviewBadge } from "@/components/badges";
import { EntryList } from "@/components/entry-list";

export const dynamic = "force-dynamic";

export default async function AffixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let d;
  try {
    d = await api.affix(decodeURIComponent(id));
  } catch {
    notFound();
  }
  const a = d.affix;
  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl">{a.form}</h1>
          {a.translit !== a.form && <span className="font-mono text-lg text-neutral-600">{a.translit}</span>}
          <span className="text-sm text-neutral-500">{LANG_NAME[a.lang]} {a.kind.replace("_", " ")}</span>
          <RegisterBadge register={a.register} />
          <EpiBadge status={a.epistemic_status} />
          <ReviewBadge status={a.provenance.review_status} />
        </div>
        <p className="font-mono text-xs text-neutral-400 mt-1">{a.id}</p>
      </header>

      <section className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2 text-sm">
          <p><span className="text-neutral-500">Functions:</span>{" "}
            {d.functions.map((f) => `${f.label} (${f.id})`).join(", ")}</p>
          <p><span className="text-neutral-500">Productivity:</span> <span className="font-mono">{a.productivity}</span></p>
          {a.allomorphs.length > 0 && (
            <p><span className="text-neutral-500">Allomorphs:</span> <span className="font-mono">{a.allomorphs.join(", ")}</span></p>
          )}
          {a.attaches_to.length > 0 && (
            <p><span className="text-neutral-500">Attaches to:</span> <span className="font-mono">{a.attaches_to.join(", ")}</span></p>
          )}
          {a.provenance.source_refs.length > 0 && (
            <p><span className="text-neutral-500">Sources:</span> <span className="font-mono text-xs">{a.provenance.source_refs.join(", ")}</span></p>
          )}
        </div>
        {a.notes && (
          <div className="border border-dashed border-neutral-400 rounded p-3 bg-neutral-50 text-sm">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wide mb-1">Annotator note</p>
            {a.notes}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg mb-2">Examples</h2>
        <EntryList entries={d.examples} />
      </section>

      {d.equivalents.length > 0 && (
        <section>
          <h2 className="text-lg mb-2">Cross-lingual equivalents</h2>
          <p className="text-xs text-neutral-500 mb-2">
            Functional equivalents; distribution and register differ. Register-matched pairs listed with a note.
          </p>
          <ul className="space-y-1">
            {d.equivalents.map((q, i) => (
              <li key={i} className="text-sm flex flex-wrap gap-2 items-baseline">
                <Link href={`/affixes/${encodeURIComponent(q.affix.id)}`} className="underline hover:text-accent">
                  {q.affix.form}
                </Link>
                {q.affix.translit !== q.affix.form && (
                  <span className="font-mono text-xs text-neutral-500">{q.affix.translit}</span>
                )}
                <span className="text-xs text-neutral-500">{LANG_NAME[q.affix.lang]}</span>
                <span className="text-xs text-neutral-400">{q.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
