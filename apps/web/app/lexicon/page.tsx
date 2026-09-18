import { data } from "@/lib/data";
import { SearchBox } from "@/components/search-box";
import { LexiconBrowser } from "@/components/lexicon-browser";

export const metadata = { title: "Lexicon" };

export default async function LexiconPage() {
  const entries = await data.entries();
  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2">Lexical Explorer</p>
        <h1 className="text-3xl">Lexicon</h1>
      </header>
      <SearchBox />
      <LexiconBrowser entries={entries} />
    </div>
  );
}
