import { data } from "@/lib/data";
import { SearchBox } from "@/components/search-box";
import { LexiconBrowser } from "@/components/lexicon-browser";

export const metadata = { title: "Lexicon" };

export default async function LexiconPage() {
  const entries = await data.entries();
  return (
    <div className="space-y-10">
      <header className="max-w-[56ch]">
        <p className="label mb-4">every entry in the graph</p>
        <h1 className="font-serif text-[34px] leading-tight">Lexicon</h1>
        <p className="mt-4 text-[14.5px] leading-[1.75] text-muted">
          Concept-aligned across the three languages: where a concept is lexicalised in all three, the
          entries point at one another, and the relation says whether that link is translation,
          cognacy, or a loan they happen to share.
        </p>
      </header>
      <SearchBox />
      <LexiconBrowser entries={entries} />
    </div>
  );
}
