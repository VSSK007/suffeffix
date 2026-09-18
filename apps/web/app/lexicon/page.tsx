import Link from "next/link";
import { api } from "@/lib/api";
import { EntryList } from "@/components/entry-list";
import { SearchBox } from "@/components/search-box";

export const dynamic = "force-dynamic";

export default async function LexiconPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const params: Record<string, string> = {};
  for (const k of ["lang", "function", "affix", "atom", "register", "page"]) {
    if (sp[k]) params[k] = sp[k]!;
  }
  const page = await api.entries(params);
  const cur = Number(sp.page ?? "1");
  const pages = Math.ceil(page.total / page.page_size);

  const langLink = (l?: string) => {
    const q = new URLSearchParams({ ...params });
    q.delete("page");
    if (l) q.set("lang", l);
    else q.delete("lang");
    return `/lexicon?${q.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Lexicon</h1>
      <SearchBox />
      <div className="flex gap-3 text-sm">
        {[undefined, "en", "te", "hi"].map((l) => (
          <Link
            key={l ?? "all"}
            href={langLink(l)}
            className={`underline ${sp.lang === l || (!sp.lang && !l) ? "text-accent" : "text-neutral-600"}`}
          >
            {l ?? "all"}
          </Link>
        ))}
        <span className="ml-auto text-neutral-500">{page.total} entries</span>
      </div>
      <EntryList entries={page.items} />
      {pages > 1 && (
        <nav className="flex gap-2 text-sm font-mono">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/lexicon?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
              className={p === cur ? "text-accent underline" : "text-neutral-600 underline"}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
