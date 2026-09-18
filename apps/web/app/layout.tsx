import type { Metadata } from "next";
import { Source_Serif_4, JetBrains_Mono, Noto_Sans_Telugu, Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "600"], variable: "--font-telugu" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600"], variable: "--font-devanagari" });

export const metadata: Metadata = {
  title: "Suffeffix — explainable lexical knowledge graph",
  description:
    "Suffeffix is an explainable lexical knowledge graph that jointly represents morphology, semantic decomposition, etymology, and affix alignment.",
};

const NAV = [
  ["/lexicon", "Lexicon"],
  ["/affixes", "Affix Atlas"],
  ["/atoms", "Atoms"],
  ["/docs", "Docs"],
  ["/about", "About"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} ${telugu.variable} ${devanagari.variable}`}>
      <body className="min-h-screen">
        <header className="border-b border-neutral-300">
          <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <Link href="/" className="font-serif text-xl tracking-tight">
              Suffeffix <span className="text-neutral-500 text-sm font-mono">v0.1</span>
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-accent">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-neutral-300 mt-16">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-neutral-600 space-y-1">
            <p>
              Suffeffix is an explainable lexical knowledge graph that jointly represents morphology,
              semantic decomposition, etymology, and affix alignment.
            </p>
            <p>Code Apache-2.0 · Data CC BY-SA 4.0 · Generated explanations are traced, never authoritative.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
