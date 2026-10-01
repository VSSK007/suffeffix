import type { Metadata, Viewport } from "next";
import { Anek_Latin, Anek_Devanagari, Anek_Telugu, IBM_Plex_Mono } from "next/font/google";
import { CommandPalette } from "@/components/command-palette";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/seo";
import "./globals.css";

/* One family across all three scripts: Anek Latin, Devanagari and Telugu share
   proportions and stroke. All fonts are self-hosted, so the site makes no third-party requests. */
const latin = Anek_Latin({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--font-latin", display: "swap" });
/* Hindi and Telugu faces are not preloaded and carry only the weight axis. Google's per-script
   unicode-range means a page downloads them only when it actually shows Hindi or Telugu text.
   (Glyph subsetting was tried and rejected: see docs/DECISIONS.md, entry 12.) */
const deva = Anek_Devanagari({ subsets: ["devanagari"], variable: "--font-deva", display: "swap", preload: false });
const telu = Anek_Telugu({ subsets: ["telugu"], variable: "--font-telu", display: "swap", preload: false });
const mono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: "Suffeffix contributors", url: SITE.repo }],
  keywords: ["lexical knowledge graph", "morphology", "etymology", "Telugu", "Hindi", "English", "affixes", "computational linguistics", "Dravidian", "Indo-European"],
  openGraph: {
    type: "website", siteName: SITE.name, url: SITE.url + "/", title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Suffeffix — one meaning, three languages, two families" }],
  },
  twitter: { card: "summary_large_image", title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description, images: ["/og.png"] },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
  colorScheme: "light dark",
};

const themeInit = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: SITE.name, url: SITE.url, description: SITE.description, inLanguage: ["en", "hi", "te"] },
    { "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon-512.png`, sameAs: [SITE.repo] },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${latin.variable} ${deva.variable} ${telu.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
        <CommandPalette />
      </body>
    </html>
  );
}
