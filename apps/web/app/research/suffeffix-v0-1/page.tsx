import Link from "next/link";
import { pageMeta } from "@/lib/seo";

// v0.1 of the report is superseded. The URL is kept so citations of it still resolve.
export const metadata = {
  ...pageMeta({
    title: "Technical report v0.1 (superseded)",
    description: "Version 0.1 of the Suffeffix technical report has been superseded by v0.2, the T.H.E.F.T. release.",
    path: "/research/suffeffix-v0-2/",
  }),
  robots: { index: false, follow: true },
};

export default function SupersededReport() {
  return (
    <section className="container pt-20 pb-28 max-w-[44rem]">
      <p className="kicker mb-5">Technical report · v0.1 · September 2026</p>
      <h1 className="h-lg">This version has been superseded</h1>
      <p className="lede mt-6">
        Version 0.1 covered English, Hindi and Telugu. Version 0.2 adds French and Tamil, introducing the T.H.E.F.T.
        framework, and replaces it. The schema, the family constraint and the explanation engine are unchanged.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/research/suffeffix-v0-2/" className="btn btn-primary">Read v0.2</Link>
        <a href="https://github.com/VSSK007/suffeffix/tree/031f3af" className="btn btn-ghost">v0.1 source on GitHub</a>
      </div>
    </section>
  );
}
