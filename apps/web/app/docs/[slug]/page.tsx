import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

const DOCS_DIR = path.join(process.cwd(), "..", "..", "docs");

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[A-Z_]+$/.test(slug)) notFound();
  let md: string;
  try {
    md = await fs.readFile(path.join(DOCS_DIR, `${slug}.md`), "utf-8");
  } catch {
    notFound();
  }
  return <article className="prose-doc max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />;
}
