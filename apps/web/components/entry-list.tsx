import Link from "next/link";
import type { EntrySummary } from "@/lib/api";

function entryHref(id: string) {
  return `/lexicon/${id.split(":").slice(1).join("/")}/`;
}

/* A ruled index, not a stack of cards. The language sits in a fixed left
   column so the eye can sort by it while scanning. */
export function EntryRow({ e }: { e: EntrySummary }) {
  return (
    <Link
      href={entryHref(e.id)}
      className="group grid grid-cols-[3.2rem_1fr] sm:grid-cols-[3.2rem_minmax(0,15rem)_1fr] gap-x-4 gap-y-0.5 py-3 items-baseline"
      style={{ borderTop: "1px solid var(--rule)" }}
    >
      <span
        className="text-[11px] tracking-[0.07em] text-faint"
        style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
      >
        {e.lang}
      </span>
      <span className="flex items-baseline gap-2.5 min-w-0">
        <span className="text-[18px] font-serif group-hover:text-accent transition-colors truncate">
          {e.form}
        </span>
        {e.form !== e.translit && (
          <span className="font-mono text-[11.5px] text-faint shrink-0">{e.translit}</span>
        )}
      </span>
      <span className="text-[13.5px] text-muted col-start-2 sm:col-start-3 leading-snug">{e.gloss}</span>
    </Link>
  );
}

export function EntryList({ entries }: { entries: EntrySummary[] }) {
  if (entries.length === 0) return <p className="text-sm text-muted py-4">No entries.</p>;
  return (
    <div style={{ borderBottom: "1px solid var(--rule)" }}>
      {entries.map((e) => (
        <EntryRow key={e.id} e={e} />
      ))}
    </div>
  );
}
