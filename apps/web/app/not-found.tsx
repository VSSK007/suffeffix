import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 max-w-[48ch]">
      <p className="kicker mb-3">404</p>
      <h1 className="display text-[44px] font-semibold">Not in the graph</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-ink-2">
        No word, meaning, affix or atom lives at this address. Press <kbd className="mono text-[13px] border border-line rounded px-1.5">/</kbd> to
        search everything, or start from the concordance.
      </p>
      <Link href="/lexicon/" className="inline-block mt-6 text-[14px] font-medium text-ie-ink hover:underline underline-offset-4">
        Open the concordance →
      </Link>
    </div>
  );
}
