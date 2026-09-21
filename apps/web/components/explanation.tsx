import Link from "next/link";
import type { Explanation, TraceItem } from "@/lib/api";

function traceHref(t: TraceItem): string | null {
  if (t.kind === "affix") return `/affixes/${t.ref.split(":").slice(1).join("/")}/`;
  if (t.kind === "atom") return `/atoms/${t.ref.replace(/^atom:/, "")}/`;
  return null;
}

/* Each sentence is numbered in the margin and carries its trace beneath —
   the layout of a critical edition, where the claim sits above the apparatus
   that supports it. */
export function ExplanationBlock({ explanation, notes }: { explanation: Explanation; notes?: string }) {
  return (
    <section>
      <div className="flex items-baseline gap-4 flex-wrap mb-4">
        <h2
          className="font-serif text-[15px]"
          style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}
        >
          Generated explanation
        </h2>
        <span className="text-[11.5px] text-faint">
          assembled from the graph by named rules · every sentence opens to its sources
        </span>
      </div>

      <ol>
        {explanation.sentences.map((s, i) => (
          <li
            key={i}
            className="grid grid-cols-[1.75rem_1fr] gap-x-3 py-3.5"
            style={{ borderTop: "1px solid var(--rule)" }}
          >
            <span className="font-mono text-[11px] text-faint tnum pt-[5px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <details className="group">
              <summary className="cursor-pointer list-none">
                <span className="font-serif text-[16.5px] leading-[1.65]">{s.text}</span>
                <span className="font-mono text-[10px] text-faint ml-2 whitespace-nowrap group-open:hidden">
                  [{s.trace.length}]
                </span>
              </summary>
              <ul className="mt-2.5 space-y-1 pl-4" style={{ borderLeft: "1px solid var(--accent)" }}>
                {s.trace.map((t, j) => {
                  const href = traceHref(t);
                  return (
                    <li key={j} className="font-mono text-[11px] text-muted flex gap-2.5">
                      <span className="text-faint w-11 shrink-0">{t.kind}</span>
                      {href ? (
                        <Link className="underline underline-offset-2 hover:text-accent" href={href}>
                          {t.ref}
                        </Link>
                      ) : (
                        <span>{t.ref}</span>
                      )}
                      {t.confidence < 1 && <span className="text-faint tnum">{t.confidence.toFixed(2)}</span>}
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        ))}
      </ol>

      {notes && (
        <div className="mt-8 pl-5 py-1" style={{ borderLeft: "2px solid var(--rule-hi)" }}>
          <p className="label mb-1.5">Annotator note — written by hand, not generated</p>
          <p className="font-serif text-[15.5px] leading-relaxed italic max-w-[62ch]">{notes}</p>
        </div>
      )}
    </section>
  );
}
