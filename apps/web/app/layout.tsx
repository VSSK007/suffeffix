import type { Metadata } from "next";
import { Spectral, IBM_Plex_Mono, Noto_Sans_Telugu, Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const serif = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
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
  ["/affixes/", "Affixes"],
  ["/atoms/", "Atoms"],
  ["/docs/", "Docs"],
  ["/about/", "About"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} ${telugu.variable} ${devanagari.variable}`}>
      <body className="min-h-screen flex flex-col">
        {/* masthead: a ruled band, the wordmark cut by the accent rule that
            runs through the whole site as the morpheme-boundary mark */}
        <header style={{ borderBottom: "1px solid var(--rule-hi)" }}>
          <div className="mx-auto max-w-page px-6 py-5 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <Link href="/" className="group flex items-baseline gap-0">
              <span className="font-serif text-[25px] tracking-[-0.01em] leading-none">Suff</span>
              <span
                className="inline-block w-px h-[22px] mx-[3px] translate-y-[3px]"
                style={{ background: "var(--accent)" }}
                aria-hidden="true"
              />
              <span className="font-serif text-[25px] tracking-[-0.01em] leading-none">effix</span>
            </Link>
            <nav className="flex flex-wrap gap-x-7 gap-y-1.5 text-[14px] ml-auto font-serif">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="text-muted hover:text-ink transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-page w-full px-6 py-12 flex-1">{children}</main>

        <footer style={{ borderTop: "1px solid var(--rule)" }} className="mt-24">
          <div className="mx-auto max-w-page px-6 py-9 grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <p className="font-serif text-[15px] leading-relaxed max-w-[56ch]">
              An explainable lexical knowledge graph that jointly represents morphology,
              semantic decomposition, etymology, and affix alignment.
            </p>
            <p className="font-mono text-[10.5px] text-faint leading-relaxed md:text-right">
              English · Telugu · Hindi<br />
              code Apache-2.0 · data CC BY-SA 4.0<br />
              no model inference — every claim traces to a node
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
