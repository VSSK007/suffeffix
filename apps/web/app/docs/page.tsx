import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata = { title: "Documentation" };

const DOCS_DIR = path.join(process.cwd(), "..", "..", "docs");

const BLURB: Record<string, string> = {
  "ARCHITECTURE.md": "Layers, the JSON-first decision, and dependency direction.",
  "DECISIONS.md": "Challenged assumptions, corrections to the seed data, dependency justifications.",
  "DATASET.md": "Files, limits, research-integrity rules, flagship etymology chains.",
  "SEMANTICS.md": "The atom interlingua and its epistemic boundaries.",
  "FRONTEND.md": "Design language and routes.",
  "BACKEND.md": "Core library, search normalization, explanation engine.",
  "API.md": "The /v0 endpoints (also served as OpenAPI).",
  "IMPLEMENTATION_PLAN.md": "Milestones and acceptance criteria.",
  "REPO.md": "Repository layout and tooling.",
  "ROADMAP.md": "Deferred features and known limitations.",
  "LAUNCH_CHECKLIST.md": "What v0.1 verifies before shipping.",
};

export default async function DocsIndex() {
  const files = (await fs.readdir(DOCS_DIR)).filter((f) => f.endsWith(".md")).sort();
  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2">from the repository</p>
        <h1 className="text-3xl">Documentation</h1>
      </header>
      <ul className="space-y-1 border-t hairline">
        {files.map((f) => (
          <li key={f} className="border-b hairline">
            <Link href={`/docs/${f.replace(/\.md$/, "")}/`}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-3 px-2 -mx-2 hover:bg-card transition-colors group">
              <span className="font-mono text-[13.5px] group-hover:text-accent transition-colors">{f}</span>
              <span className="text-[13px] text-muted">{BLURB[f] ?? ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
