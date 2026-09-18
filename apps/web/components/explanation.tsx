import Link from "next/link";
import type { Explanation, TraceItem } from "@/lib/api";

function traceHref(t: TraceItem): string | null {
  if (t.kind === "affix") return `/affixes/${encodeURIComponent(t.ref)}`;
  if (t.kind === "atom") return `/atoms/${encodeURIComponent(t.ref)}`;
  return null;
}

export function ExplanationBlock({ explanation, notes }: { explanation: Explanation; notes?: string }) {
  return (
    <section>
      <h2 className="text-lg mb-1">Generated explanation</h2>
      <p className="text-xs text-neutral-500 mb-3">
        Assembled deterministically from the graph; expand each sentence for its trace. Not authoritative.
      </p>
      <ol className="space-y-2">
        {explanation.sentences.map((s, i) => (
          <li key={i}>
            <details className="group">
              <summary className="cursor-pointer leading-relaxed marker:text-accent">
                {s.text}
              </summary>
              <ul className="mt-1 ml-4 border-l border-neutral-300 pl-3 space-y-0.5">
                {s.trace.map((t, j) => {
                  const href = traceHref(t);
                  const label = `${t.kind}: ${t.ref}${t.confidence < 1 ? ` (conf ${t.confidence.toFixed(2)})` : ""}`;
                  return (
                    <li key={j} className="font-mono text-[11px] text-neutral-600">
                      {href ? (
                        <Link className="underline hover:text-accent" href={href}>
                          {label}
                        </Link>
                      ) : (
                        label
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        ))}
      </ol>
      {notes && (
        <div className="mt-4 border border-dashed border-neutral-400 rounded p-3 bg-neutral-50">
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wide mb-1">Annotator note (freehand)</p>
          <p className="text-sm">{notes}</p>
        </div>
      )}
    </section>
  );
}
