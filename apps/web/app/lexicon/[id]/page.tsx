import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Confidence, ContestedBadge, EpiBadge, LANG_NAME, RegisterBadge, ReviewBadge } from "@/components/badges";
import { ExplanationBlock } from "@/components/explanation";

export const dynamic = "force-dynamic";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let d;
  try {
    d = await api.entry(decodeURIComponent(id));
  } catch {
    notFound();
  }
  const e = d.entry;
  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl">{e.lemma.form}</h1>
          {e.lemma.form !== e.lemma.translit && (
            <span className="font-mono text-lg text-neutral-600">{e.lemma.translit}</span>
          )}
          <span className="text-sm text-neutral-500">{LANG_NAME[e.lang]} · {e.pos}</span>
          <RegisterBadge register={e.register} />
          <ReviewBadge status={e.provenance.review_status} />
        </div>
        {d.concept && <p className="text-neutral-700 mt-1">‘{d.concept.gloss}’</p>}
        <p className="font-mono text-xs text-neutral-400 mt-1">{e.id}</p>
      </header>

      <section>
        <h2 className="text-lg mb-2">Morphology</h2>
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <span className="border border-neutral-400 rounded px-2 py-1 bg-white">{e.morphology.stem_form}</span>
          {d.affixes.map((a, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-neutral-400">+</span>
              <Link href={`/affixes/${encodeURIComponent(a.id)}`}
                className="border border-accent/40 rounded px-2 py-1 bg-white hover:border-accent">
                {a.form} <span className="text-neutral-500">{a.translit !== a.form ? a.translit : ""}</span>
              </Link>
            </span>
          ))}
          <span className="text-xs text-neutral-500 ml-2">
            schema {e.morphology.schema} · seg-conf {e.morphology.segmentation_confidence.toFixed(2)}
          </span>
        </div>
        {d.functions.length > 0 && (
          <p className="text-sm text-neutral-600 mt-2">
            Functions: {d.functions.map((f) => `${f.label} (${f.id})`).join(", ")}
          </p>
        )}
      </section>

      {d.concept && (
        <section>
          <h2 className="text-lg mb-2">Semantic decomposition <EpiBadge status={d.concept.structure_status} /></h2>
          <p className="font-mono text-sm bg-neutral-100 rounded p-3 overflow-x-auto">{d.structure_pretty}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {d.atoms.map((a) => (
              <Link key={a.id} href={`/atoms/${encodeURIComponent(a.id)}`}
                className="font-mono text-xs border border-neutral-300 rounded px-1.5 py-0.5 hover:border-accent">
                {a.id.replace("atom:", "")}
              </Link>
            ))}
          </div>
        </section>
      )}

      {d.edges.length > 0 && (
        <section>
          <h2 className="text-lg mb-2">
            Etymology{" "}
            <Link href={`/etymology/${encodeURIComponent(e.id)}`} className="text-sm text-accent underline font-sans">
              full lineage graph →
            </Link>
          </h2>
          <ul className="space-y-1">
            {d.edges.map((ed) => (
              <li key={ed.id} className="text-sm flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-neutral-500">{ed.type}</span>
                <span>{ed.from.form} → {ed.to.form}</span>
                {ed.drift.filter((x) => x !== "NONE").map((x) => (
                  <span key={x} className="text-xs text-amber-800">{x.toLowerCase()}</span>
                ))}
                <Confidence value={ed.confidence} />
                <span className="font-mono text-[11px] text-neutral-500">[{ed.source_ref.join(", ")}]</span>
                {ed.status === "contested" && <ContestedBadge />}
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.aligned.length > 0 && (
        <section>
          <h2 className="text-lg mb-2">Aligned forms</h2>
          <ul className="space-y-1">
            {d.aligned.map((a) => (
              <li key={a.entry.id} className="text-sm flex flex-wrap gap-2 items-baseline">
                <Link href={`/lexicon/${encodeURIComponent(a.entry.id)}`} className="underline hover:text-accent">
                  {a.entry.form}
                </Link>
                {a.entry.form !== a.entry.translit && (
                  <span className="font-mono text-xs text-neutral-500">{a.entry.translit}</span>
                )}
                <span className="text-xs text-neutral-500">{LANG_NAME[a.entry.lang]}</span>
                <span className="font-mono text-[11px] text-neutral-600">{a.relation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ExplanationBlock explanation={d.explanation} notes={e.notes || undefined} />
    </div>
  );
}
