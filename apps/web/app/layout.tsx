import type { Metadata, Viewport } from "next";
import { Anek_Latin, Anek_Devanagari, Anek_Telugu, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { CommandPalette, SearchTrigger } from "@/components/command-palette";
import { LaneMark } from "@/components/lane-mark";
import "./globals.css";

/* One family across all three scripts: Anek Latin, Anek Devanagari and Anek
   Telugu share proportions and stroke, and all three are variable on width. */
const latin = Anek_Latin({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--font-latin", display: "swap" });
const deva = Anek_Devanagari({ subsets: ["devanagari"], axes: ["wdth"], variable: "--font-deva", display: "swap" });
const telu = Anek_Telugu({ subsets: ["telugu"], axes: ["wdth"], variable: "--font-telu", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://suffeffix.com"),
  title: { default: "Suffeffix — one meaning, three languages, two families", template: "%s · Suffeffix" },
  description:
    "An explainable lexical knowledge graph: morphology, semantic decomposition, etymology, and affix alignment for English, Hindi, and Telugu.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f12" },
  ],
};

const NAV = [
  ["/lexicon/", "Concordance"],
  ["/affixes/", "Affix Atlas"],
  ["/atoms/", "Atoms"],
  ["/docs/", "Docs"],
  ["/about/", "About"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${latin.variable} ${deva.variable} ${telu.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <header
          className="sticky z-40 border-b border-line"
          style={{ top: "env(safe-area-inset-top, 0px)", background: "color-mix(in srgb, var(--bg) 88%, transparent)", backdropFilter: "blur(10px)" }}
        >
          <div className="mx-auto max-w-page px-5 sm:px-8 h-14 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Suffeffix home">
              <LaneMark />
              <span className="wide text-[19px] font-semibold tracking-[-0.01em]">suffeffix</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-[13.5px]">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-md px-2.5 py-1.5 text-muted hover:text-ink hover:bg-sunk transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto">
              <SearchTrigger />
            </div>
          </div>
          <nav className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2 text-[13px]" aria-label="Sections">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="shrink-0 rounded-md px-2.5 py-1 text-muted hover:text-ink">
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-page w-full px-5 sm:px-8 py-10 sm:py-14 flex-1">{children}</main>

        <footer className="border-t border-line mt-20">
          <div className="mx-auto max-w-page px-5 sm:px-8 py-10 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <LaneMark size={16} />
                <span className="wide text-[16px] font-semibold">suffeffix</span>
              </div>
              <p className="text-[13.5px] text-muted max-w-[46ch] leading-relaxed">
                An explainable lexical knowledge graph that jointly represents morphology, semantic
                decomposition, etymology, and affix alignment. No model inference: every claim traces to a
                node, a rule, or a source.
              </p>
            </div>
            <div className="text-[13px] space-y-1.5">
              <p className="kicker mb-2">Explore</p>
              {NAV.slice(0, 3).map(([href, label]) => (
                <Link key={href} href={href} className="block text-ink-2 hover:text-ie-ink">
                  {label}
                </Link>
              ))}
            </div>
            <div className="text-[13px] space-y-1.5">
              <p className="kicker mb-2">Project</p>
              <Link href="/docs/" className="block text-ink-2 hover:text-ie-ink">Documentation</Link>
              <Link href="/docs/DECISIONS/" className="block text-ink-2 hover:text-ie-ink">Decision log</Link>
              <a href="https://github.com/VSSK007/suffeffix" className="block text-ink-2 hover:text-ie-ink">Source on GitHub</a>
              <p className="text-faint pt-2">Code Apache-2.0 · Data CC BY-SA 4.0</p>
            </div>
          </div>
        </footer>

        <CommandPalette />
      </body>
    </html>
  );
}
