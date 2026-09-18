import Link from "next/link";
import type { EntrySummary } from "@/lib/api";
import { LANG_NAME, RegisterBadge } from "./badges";

export function EntryRow({ e }: { e: EntrySummary }) {
  return (
    <Link
      href={`/lexicon/${encodeURIComponent(e.id)}`}
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-neutral-200 py-2 hover:bg-neutral-50 px-1"
    >
      <span className="text-lg">{e.form}</span>
      {e.form !== e.translit && <span className="font-mono text-sm text-neutral-600">{e.translit}</span>}
      <span className="text-sm text-neutral-700">{e.gloss}</span>
      <span className="ml-auto flex gap-2 items-baseline text-xs text-neutral-500">
        <span>{LANG_NAME[e.lang]}</span>
        <span>{e.pos}</span>
        <RegisterBadge register={e.register} />
      </span>
    </Link>
  );
}

export function EntryList({ entries }: { entries: EntrySummary[] }) {
  if (entries.length === 0) return <p className="text-sm text-neutral-500 py-4">No entries.</p>;
  return <div>{entries.map((e) => <EntryRow key={e.id} e={e} />)}</div>;
}
