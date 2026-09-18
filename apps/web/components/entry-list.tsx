import Link from "next/link";
import type { EntrySummary } from "@/lib/api";
import { LANG_NAME } from "./badges";

function entryHref(id: string) {
  return `/lexicon/${id.split(":").slice(1).join("/")}/`;
}

export function EntryRow({ e }: { e: EntrySummary }) {
  return (
    <Link
      href={entryHref(e.id)}
      className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b hairline py-2.5 px-2 -mx-2 hover:bg-card transition-colors"
    >
      <span className="text-[17px] group-hover:text-accent transition-colors">{e.form}</span>
      {e.form !== e.translit && <span className="font-mono text-[12.5px] text-muted">{e.translit}</span>}
      <span className="text-[13.5px] text-muted">{e.gloss}</span>
      <span className="ml-auto font-mono text-[10.5px] text-muted tracking-wide">
        {LANG_NAME[e.lang]} · {e.pos}
      </span>
    </Link>
  );
}

export function EntryList({ entries }: { entries: EntrySummary[] }) {
  if (entries.length === 0) return <p className="text-sm text-muted py-4">No entries.</p>;
  return <div className="border-t hairline">{entries.map((e) => <EntryRow key={e.id} e={e} />)}</div>;
}
