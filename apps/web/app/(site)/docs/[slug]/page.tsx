import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { renderMarkdown } from "@/lib/markdown";
import { pageMeta } from "@/lib/seo";

const DOCS_DIR = path.join(process.cwd(), "..", "..", "docs");

export async function generateStaticParams() {
  const files = (await fs.readdir(DOCS_DIR)).filter((f) => f.endsWith(".md"));
  return files.map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return pageMeta({ title: slug.charAt(0) + slug.slice(1).toLowerCase().replace(/_/g, " "), description: `Suffeffix documentation: ${slug.toLowerCase().replace(/_/g, " ")}.`, path: `/docs/${slug}/` });
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[A-Z_]+$/.test(slug)) notFound();
  let md: string;
  try {
    md = await fs.readFile(path.join(DOCS_DIR, `${slug}.md`), "utf-8");
  } catch {
    notFound();
  }
  return <article className="prose-doc" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />;
}
