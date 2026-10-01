import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { Wordmark } from "./wordmark";

const COLS: { title: string; links: [string, string, boolean?][] }[] = [
  {
    title: "Explore",
    links: [["Concordance", "/lexicon/"], ["Affix Atlas", "/affixes/"], ["Semantic atoms", "/atoms/"], ["Etymology of sugar", "/etymology/en/sugar/"]],
  },
  {
    title: "Research",
    links: [["Technical report v0.2", "/research/suffeffix-v0-2/"], ["Dataset & downloads", "/data/"], ["Decision log", "/docs/DECISIONS/"], ["Roadmap", "/docs/ROADMAP/"]],
  },
  {
    title: "Project",
    links: [["About", "/about/"], ["Why the name", "/about/#name"], ["Documentation", "/docs/"], ["Source on GitHub", "https://github.com/VSSK007/suffeffix", true], ["Report an error", "https://github.com/VSSK007/suffeffix/issues/new", true]],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-auto">
      <div className="container py-14 grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <Wordmark size={21} />
            <span className="sr-only">Suffeffix</span>
          </div>
          <p className="text-[14px] text-muted max-w-[40ch] leading-relaxed">
            An explainable lexical knowledge graph for morphology, semantic decomposition, etymology and
            affix alignment across Telugu, Hindi, English, French and Tamil.
          </p>
          <p className="kicker">v0.2 · T.H.E.F.T. · October 2026 · all records draft</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title} className="text-[14px]">
            <p className="kicker mb-4">{c.title}</p>
            <ul className="space-y-2.5">
              {c.links.map(([label, href, ext]) => (
                <li key={href}>
                  {ext ? (
                    <a href={href} className="text-ink-2 hover:text-ink">{label} <span aria-hidden="true" className="text-faint">↗</span></a>
                  ) : (
                    <Link href={href} className="text-ink-2 hover:text-ink">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container py-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12.5px] text-muted">
          <span>Code Apache-2.0 · Dataset CC BY-SA 4.0 · No model inference: every claim traces to a node, a rule or a source.</span>
          <span className="mono">© 2026 Suffeffix contributors</span>
        </div>
      </div>
    </footer>
  );
}
