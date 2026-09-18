import Link from "next/link";
import type { Explanation, TraceItem } from "@/lib/api";

function traceHref(t: TraceItem): string | null {
  if (t.kind === "affix") return `/affixes/${t.ref.split(":").slice(1).join("/")}/`;
  if (t.kind === "atom") return `/atoms/${t.ref.replace(/^atom:/, "")}/`;
  return null;
}

export function ExplanationBlock({ explanation, notes }: { explanation: Explanation; notes?: string }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="text-xl">Generated explanation</h2>
        <span className="text-[11px] text-muted">deterministic · traced · not authoritative</span>
      </div>
      <ol className="mt-3 space-y-2.5">
        {explanation.sentences.map((s, i) => (
          <li key={i}>
            <details className="group border-l-2 hairline pl-4 open:border-l-accent transition-colors">
              <summary className="cursor-pointer leading-relaxed list-none">
                <span className="text-[15px]">{s.text}</span>
                <span className="font-mono text-[10px] text-muted ml-2 group-open:hidden">
                  trace ({s.trace.length})
                </span>
              </summary>
              <ul className="mt-1.5 mb-1 space-y-0.5">
                {s.trace.map((t, j) => {
                  const href = traceHref(t);
                  const label = `${t.kind} · ${t.ref}${t.confidence < 1 ? ` · conf ${t.confidence.toFixed(2)}` : ""}`;
                  return (
                    <li key={j} className="font-mono text-[11px] text-muted">
                      {href ? (
                        <Link className="underline underline-offset-2 hover:text-accent" href={href}>
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
        <div className="mt-5 border border-dashed hairline rounded-md p-4 bg-card">
          <p className="eyebrow mb-1">Annotator note — freehand</p>
          <p className="text-sm leading-relaxed">{notes}</p>
        </div>
      )}
    </section>
  );
}
