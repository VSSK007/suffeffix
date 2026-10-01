import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Documentation", description: "Architecture, dataset design, API, decision log and roadmap for Suffeffix.", path: "/docs/" });

const DOCS_DIR = path.join(process.cwd(), "..", "..", "docs");

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "Start here",
    items: [
      ["ARCHITECTURE", "Layers, the JSON-first decision, and why dependencies point inward."],
      ["DECISIONS", "Every assumption in the original brief that turned out to be wrong, and what replaced it."],
      ["DATASET", "Files, limits, research-integrity rules, and the flagship etymology chains."],
      ["SEMANTICS", "The atom interlingua and the limits of what it claims."],
    ],
  },
  {
    title: "Building on it",
    items: [
      ["API", "The read-only /v0 endpoints, also served as OpenAPI."],
      ["BACKEND", "Core library, search normalisation, the explanation engine."],
      ["FRONTEND", "Design language, lanes, and routes."],
      ["DEPLOY", "Shipping the static site to suffeffix.com."],
    ],
  },
  {
    title: "Project",
    items: [
      ["ROADMAP", "Deferred work — French, Tamil, a larger lexicon — and known limitations."],
      ["IMPLEMENTATION_PLAN", "Milestones and their acceptance criteria."],
      ["LAUNCH_CHECKLIST", "What a release verifies before shipping."],
      ["REPO", "Repository layout and tooling."],
    ],
  },
];

export default async function DocsIndex() {
  const present = new Set((await fs.readdir(DOCS_DIR)).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")));
  return (
    <div>
      <header className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-end mb-12">
        <div>
          <p className="kicker mb-3">Documentation</p>
          <h1 className="display text-[40px] sm:text-[52px] font-semibold">How it is built, and why</h1>
        </div>
        <p className="text-[15px] leading-[1.7] text-ink-2 max-w-[54ch]">
          The same Markdown that ships in the repository. The decision log is the most interesting read:
          it records where the original brief was linguistically or technically wrong.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="kicker mb-3">{g.title}</h2>
            <ul className="border-t border-line">
              {g.items
                .filter(([slug]) => present.has(slug))
                .map(([slug, blurb]) => (
                  <li key={slug} className="border-b border-line">
                    <Link href={`/docs/${slug}/`} className="group block py-3.5">
                      <span className="text-[15.5px] font-semibold group-hover:text-ie-ink">
                        {slug.charAt(0) + slug.slice(1).toLowerCase().replace(/_/g, " ")}
                      </span>
                      <span className="block text-[13px] text-muted mt-0.5 leading-snug">{blurb}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
