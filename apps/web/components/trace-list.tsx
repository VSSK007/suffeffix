import Link from "next/link";
import type { Explanation, TraceItem } from "@/lib/api";

function href(t: TraceItem): string | null {
  if (t.kind === "affix") return `/affixes/${t.ref.split(":").slice(1).join("/")}/`;
  if (t.kind === "atom") return `/atoms/${t.ref.replace(/^atom:/, "")}/`;
  return null;
}

/** A generated explanation with its trace, for use inside figures. */
export function TraceList({ explanation }: { explanation: Explanation }) {
  return (
    <ol className="divide-y divide-[var(--line)] border-y border-line">
      {explanation.sentences.map((s, i) => (
        <li key={i} className="py-4 grid grid-cols-[2rem_1fr] gap-x-3">
          <span className="mono text-[12px] text-faint pt-1 tnum">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <p className="text-[16.5px] leading-[1.6]">{s.text}</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {s.trace.map((t, j) => {
                const h = href(t);
                const label = (
                  <>
                    <span className="text-faint">{t.kind}</span> {t.ref}
                    {t.confidence < 1 && <span className="text-muted"> · {t.confidence.toFixed(2)}</span>}
                  </>
                );
                return (
                  <li key={j} className="mono text-[11.5px] rounded-md bg-surface px-2 py-1 text-ink-2">
                    {h ? <Link href={h} className="hover:text-ie-ink underline underline-offset-2">{label}</Link> : label}
                  </li>
                );
              })}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
