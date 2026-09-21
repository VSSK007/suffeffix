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
    <div className="space-y-10">
      <header className="max-w-[56ch]">
        <p className="label mb-4">rendered from the repository</p>
        <h1 className="font-serif text-[34px] leading-tight">Documentation</h1>
        <p className="mt-4 text-[14.5px] leading-[1.75] text-muted">
          The same Markdown that ships in the repo, including the decision log — every assumption
          in the original brief that turned out to be wrong, and what was done instead.
        </p>
      </header>
      <ul style={{ borderBottom: "1px solid var(--rule)" }}>
        {files.map((f) => (
          <li key={f} style={{ borderTop: "1px solid var(--rule)" }}>
            <Link href={`/docs/${f.replace(/\.md$/, "")}/`}
              className="group grid sm:grid-cols-[minmax(0,15rem)_1fr] gap-x-6 gap-y-0.5 py-3.5 items-baseline">
              <span className="font-mono text-[13px] group-hover:text-accent transition-colors">
                {f.replace(/\.md$/, "")}
              </span>
              <span className="text-[13.5px] text-muted leading-snug">{BLURB[f] ?? ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
