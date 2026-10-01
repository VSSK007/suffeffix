import type { Metadata } from "next";

export const SITE = {
  name: "Suffeffix",
  url: "https://suffeffix.com",
  tagline: "An explainable lexical knowledge graph",
  description:
    "Suffeffix jointly represents morphology, semantic decomposition, etymology and affix alignment for Telugu, Hindi, English, French and Tamil (T.H.E.F.T.) — with a source for every etymology and a trace for every explanation.",
  repo: "https://github.com/VSSK007/suffeffix",
};

/** Per-page metadata: canonical URL, Open Graph, Twitter card. `path` has a trailing slash. */
export function pageMeta(opts: { title: string; description?: string; path: string; type?: "website" | "article" }): Metadata {
  const description = opts.description ?? SITE.description;
  const url = `${SITE.url}${opts.path}`;
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${opts.title} · ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      type: opts.type ?? "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Suffeffix — one meaning, five languages, two families" }],
    },
    twitter: { card: "summary_large_image", title: `${opts.title} · ${SITE.name}`, description, images: ["/og.png"] },
  };
}
