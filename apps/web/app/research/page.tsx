import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Research",
  description: "Technical reports, the dataset, and the decision log behind Suffeffix.",
  path: "/research/",
});

const ITEMS: { kind: string; date: string; title: string; blurb: string; href: string; status?: string }[] = [
  {
    kind: "Technical report",
    date: "October 2026",
    title: "Suffeffix: an explainable lexical knowledge graph for morphology, semantic decomposition, etymology and affix alignment",
    blurb:
      "The T.H.E.F.T. framework — Telugu, Hindi, English, French and Tamil — the schema, the family-boundary constraint, how explanations are generated and traced, and what the v0.2 dataset does and does not show.",
    href: "/research/suffeffix-v0-2/",
  },
  {
    kind: "Dataset",
    date: "October 2026",
    title: "Suffeffix dataset v0.2",
    blurb: "564 words in five languages, 115 meanings, 151 affixes, 50 atoms and 127 sourced etymology edges as CSV and JSON, with JSON Schemas, checksums and a data card.",
    href: "/data/",
  },
  {
    kind: "Design notes",
    date: "Ongoing",
    title: "Decision log",
    blurb: "Every assumption in the original brief that turned out to be linguistically or technically wrong, what replaced it, and why.",
    href: "/docs/DECISIONS/",
  },
  {
    kind: "Roadmap",
    date: "Ongoing",
    title: "What comes next, and what is deliberately absent",
    blurb: "A larger lexicon, external review, entry numbers checked against printed volumes — and the features Suffeffix refuses to build.",
    href: "/docs/ROADMAP/",
  },
];

export default function ResearchIndex() {
  return (
    <div className="container pt-14 sm:pt-20 pb-24">
      <p className="kicker mb-6">Research</p>
      <h1 className="h-xl max-w-[12ch]">Published work</h1>
      <p className="lede mt-8 max-w-[56ch]">
        Everything here is versioned, cited and open. Each item states what it claims, how sure it is, and where it
        is limited.
      </p>
      <ul className="mt-16 border-t border-line">
        {ITEMS.map((it) => (
          <li key={it.href} className="border-b border-line">
            <Link href={it.href} className="group grid gap-x-12 gap-y-3 py-9 md:grid-cols-[12rem_1fr_auto] items-baseline">
              <div>
                <p className="kicker">{it.kind}</p>
                <p className="text-[13px] text-muted mt-1.5">{it.date}</p>
              </div>
              <div>
                <h2 className="h-md max-w-[34ch] group-hover:text-ie-ink transition-colors">{it.title}</h2>
                <p className="text-[15.5px] text-ink-2 leading-[1.7] mt-3 max-w-[64ch]">{it.blurb}</p>
              </div>
              <span className="link-arrow self-start hidden md:inline">Read</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
