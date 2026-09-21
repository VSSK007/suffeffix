import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 max-w-[44ch]">
      <p className="label mb-4">404</p>
      <h1 className="font-serif text-[30px] leading-tight">Not in the graph</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        No node lives at this address. The lexicon holds 338 entries; the search will find any of them
        by script, transliteration, or gloss.
      </p>
      <Link
        href="/"
        className="inline-block mt-6 font-mono text-[12px] underline underline-offset-4"
        style={{ color: "var(--accent-ink)" }}
      >
        back to search →
      </Link>
    </div>
  );
}
