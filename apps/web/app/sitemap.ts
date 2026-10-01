import type { MetadataRoute } from "next";
import { promises as fs } from "fs";
import path from "path";
import { data, slug } from "@/lib/data";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const u = (p: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${SITE.url}${p}`, lastModified: now, changeFrequency, priority,
  });

  const [entries, affixes, atoms, concepts, etym] = await Promise.all([
    data.entries(), data.affixes(), data.atoms(), data.concepts(), data.etymology(),
  ]);
  const docs = (await fs.readdir(path.join(process.cwd(), "..", "..", "docs")))
    .filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));

  return [
    u("/", 1, "weekly"),
    u("/research/", 0.9),
    u("/research/suffeffix-v0-1/", 0.9),
    u("/data/", 0.9),
    u("/lexicon/", 0.8),
    u("/affixes/", 0.8),
    u("/atoms/", 0.7),
    u("/about/", 0.6),
    u("/docs/", 0.5),
    ...docs.map((d) => u(`/docs/${d}/`, 0.4)),
    ...concepts.map((c) => u(slug.conceptHref(c.id), 0.6)),
    ...entries.map((e) => u(slug.entryHref(e.id), 0.5)),
    ...affixes.map((a) => u(slug.affixHref(a.id), 0.4)),
    ...atoms.map((a) => u(slug.atomHref(a.id), 0.4)),
    ...Object.keys(etym).map((id) => u(slug.etymologyHref(id), 0.4)),
  ];
}
