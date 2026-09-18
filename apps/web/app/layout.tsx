import type { Metadata } from "next";
import { Source_Serif_4, JetBrains_Mono, Noto_Sans_Telugu, Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", axes: ["opsz"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "600"], variable: "--font-telugu" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600"], variable: "--font-devanagari" });

export const metadata: Metadata = {
  metadataBase: new URL("https://suffeffix.com"),
  title: { default: "Suffeffix", template: "%s · Suffeffix" },
  description:
    "An explainable lexical knowledge graph: morphology, semantic decomposition, etymology, and affix alignment for English, Telugu, and Hindi.",
};

const NAV = [
  ["/lexicon/", "Lexicon"],
  ["/affixes/", "Affix Atlas"],
  ["/atoms/", "Atoms"],
  ["/docs/", "Docs"],
  ["/about/", "About"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} ${telugu.variable} ${devanagari.variable}`}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b hairline">
          <div className="mx-auto max-w-page px-5 py-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <Link href="/" className="font-serif text-[22px] tracking-tight hover:text-accent">
              Suffeffix
              <span className="font-mono text-[10px] text-muted ml-2 align-middle tracking-widest">v0.1</span>
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-1 text-[13.5px] ml-auto">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="text-muted hover:text-accent transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-page w-full px-5 py-10 flex-1">{children}</main>
        <footer className="border-t hairline mt-20">
          <div className="mx-auto max-w-page px-5 py-8 text-xs text-muted leading-relaxed space-y-2">
            <p className="font-serif text-sm text-ink">
              Suffeffix is an explainable lexical knowledge graph that jointly represents morphology,
              semantic decomposition, etymology, and affix alignment.
            </p>
            <p>
              English · Telugu · Hindi — every fact carries an epistemic status, a source, and a review state.
              Generated explanations are traced, never authoritative. Code Apache-2.0 · data CC BY-SA 4.0.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
