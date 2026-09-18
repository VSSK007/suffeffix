import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DOCS_DIR = path.join(process.cwd(), "..", "..", "docs");

export default async function DocsIndex() {
  const files = (await fs.readdir(DOCS_DIR)).filter((f) => f.endsWith(".md")).sort();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Documentation</h1>
      <ul className="space-y-1">
        {files.map((f) => (
          <li key={f}>
            <Link href={`/docs/${f.replace(/\.md$/, "")}`} className="font-mono text-sm underline hover:text-accent">
              {f}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
