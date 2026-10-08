import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { CopyButton } from "@/components/copy-button";
import { DATASET_BIBTEX } from "@/lib/cite";
import { pageMeta, SITE } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Dataset v0.2",
  description:
    "Download the Suffeffix dataset: CSV and JSON tables for words, affixes, etymology edges, atoms and concepts, with JSON Schemas, SHA-256 checksums and a data card. CC BY-SA 4.0.",
  path: "/data/",
});

interface ManifestFile { name: string; bytes: number; sha256: string; rows: number | null }
interface Manifest {
  version: string; generated: string; license: string;
  counts: Record<string, number>; files: ManifestFile[];
}

const DESC: Record<string, string> = {
  "entries.csv": "One row per word: lemma, transliteration, register, meaning, stem, affix uses and review status.",
  "affixes.csv": "One row per affix: form, kind, the functions it performs, register, productivity and allomorphs.",
  "etymology_edges.csv": "One row per sourced etymology edge, with endpoints, families, type, drift, confidence, status and sources.",
  "atoms.csv": "The fifty semantic atoms with their exponents in English, French, Hindi, Telugu and Tamil.",
  "concepts.csv": "One row per meaning, with its atom decomposition and the status of that decomposition.",
  "sources.csv": "The bibliography every source key resolves to.",
  "README.txt": "Plain-text description of the release and its conventions.",
  "LICENSE.txt": "Licence terms for the dataset (CC BY-SA 4.0).",
  "SHA256SUMS.txt": "A SHA-256 checksum for every file in the release.",
  "manifest.json": "Machine-readable list of files with sizes, row counts and checksums.",
};

const COLUMNS: Record<string, [string, string][]> = {
  "entries.csv": [
    ["id", "Stable identifier, e.g. lex:te:mancitanam (ASCII, so it is URL-safe)."],
    ["lang", "en, hi or te."],
    ["form · transliteration", "Lemma in native script, and its transliteration."],
    ["register", "N native, S Sanskritic, P Perso-Arabic, E learned (English: Latin and Greek), mixed."],
    ["concept_id · meaning", "The meaning the word expresses; shared across the five languages."],
    ["stem · affixes · pattern", "The stem, and affix uses as affix_id|function_id pairs separated by ';'."],
    ["segmentation_confidence", "Annotator confidence in the segmentation, in [0, 1]."],
    ["etymology_edges", "Identifiers of etymology edges that begin or end at this word."],
    ["review_status", "draft, reviewed or published. Every v0.2 record is draft."],
  ],
  "etymology_edges.csv": [
    ["type", "INHERITED, COGNATE, BORROWED, CALQUE, DERIVED, COMPOUNDED, RECONSTRUCTED or REBORROWED."],
    ["from_* · to_*", "Form, language and family of each endpoint."],
    ["crosses_family_boundary", "True where the endpoints sit in different top-level families. Always False for INHERITED and COGNATE."],
    ["drift", "Semantic drift labels, ';'-separated (e.g. METONYMY, AMELIORATION)."],
    ["confidence", "Annotator confidence in [0, 1]; capped at 0.6 for Wiktionary-only claims, 0.7 where a reference work is cited without an entry number."],
    ["status", "accepted, or contested — stored unresolved because scholarship disagrees."],
    ["sources", "Keys into sources.csv, ';'-separated."],
  ],
};

function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export default async function DataPage() {
  const m: Manifest = JSON.parse(await fs.readFile(path.join(process.cwd(), "public", "data", "manifest.json"), "utf-8"));
  const zip = m.files.find((f) => f.name.endsWith(".zip"))!;
  const bundle = m.files.find((f) => f.name.endsWith(".json") && f.name.startsWith("suffeffix-"))!;
  const tables = m.files.filter((f) => f.name.endsWith(".csv"));
  const other = m.files.filter((f) => !f.name.endsWith(".csv") && f !== zip && f !== bundle && !f.name.startsWith("schema/"));
  const schemas = m.files.filter((f) => f.name.startsWith("schema/"));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Suffeffix dataset v${m.version}`,
    description:
      `A lexical knowledge graph of Telugu, Hindi, English, French and Tamil (the T.H.E.F.T. framework): ${m.counts.entries} words aligned across ${m.counts.concepts} meanings, with morphological analyses, affix functions, semantic decompositions and sourced etymology edges.`,
    url: `${SITE.url}/data/`,
    version: m.version,
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    creator: { "@type": "Organization", name: "Suffeffix contributors" },
    inLanguage: ["en", "fr", "hi", "te", "ta"],
    isAccessibleForFree: true,
    distribution: m.files
      .filter((f) => f.name.endsWith(".csv") || f.name.endsWith(".zip") || f === bundle)
      .map((f) => ({
        "@type": "DataDownload",
        contentUrl: `${SITE.url}/data/${f.name}`,
        encodingFormat: f.name.endsWith(".csv") ? "text/csv" : f.name.endsWith(".zip") ? "application/zip" : "application/json",
        contentSize: `${f.bytes} B`,
      })),
  };

  const row = (f: ManifestFile, label?: string) => (
    <li key={f.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 border-b border-line py-4 lg:grid-cols-[minmax(0,1fr)_5rem_5.5rem_11rem]">
      <div className="min-w-0">
        <a href={`/data/${f.name}`} download className="mono break-all text-[13.5px] font-medium underline underline-offset-4 decoration-line-2 hover:text-ie-ink">{label ?? f.name}</a>
        {DESC[f.name] && <p className="mt-1 max-w-[56ch] text-[13.5px] leading-snug text-muted">{DESC[f.name]}</p>}
      </div>
      <div className="hidden text-right text-[13.5px] text-ink-2 tnum lg:block">{f.rows ?? "—"}</div>
      <div className="text-right text-[13.5px] text-ink-2 tnum whitespace-nowrap">{bytes(f.bytes)}</div>
      <div className="hidden lg:block"><span className="mono text-[11.5px] text-muted" title={f.sha256}>{f.sha256.slice(0, 16)}…</span></div>
    </li>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container pt-14 sm:pt-20 pb-24">
        <p className="kicker mb-6">Dataset · v{m.version} · {m.generated}</p>
        <h1 className="h-xl max-w-[14ch]">Take the data with you</h1>
        <p className="lede mt-8 max-w-[58ch]">
          Words, affixes, meanings, atoms and sourced etymologies as plain CSV and JSON, released under {m.license}.
          Every record is a draft; every file carries a checksum.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={`/data/${zip.name}`} download className="btn btn-primary">Download everything · {bytes(zip.bytes)}</a>
          <a href={SITE.repo} className="btn btn-ghost">View the source data</a>
          <Link href="/research/suffeffix-v0-2/" className="btn btn-ghost">Read the report</Link>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-y-8 border-t border-line pt-8 sm:grid-cols-4 lg:grid-cols-7">
          {(
            [["entries", "words"], ["concepts", "meanings"], ["affixes", "affixes"], ["affix_functions", "functions"], ["atoms", "atoms"], ["etymology_edges", "etymology edges"], ["sources", "sources"]] as const
          ).map(([k, l]) => (
            <div key={k}>
              <dd className="h-md tnum leading-none">{m.counts[k]}</dd>
              <dt className="text-[13px] text-muted mt-2">{l}</dt>
            </div>
          ))}
        </dl>

        {/* files */}
        <section className="mt-20" aria-labelledby="files-h">
          <h2 id="files-h" className="h-md mb-2">Files</h2>
          <p className="text-[15px] text-muted mb-8 max-w-[64ch]">
            CSV files are UTF-8 with a byte-order mark so spreadsheets open Devanagari, Telugu and Tamil script correctly. List-valued
            columns use <code className="mono text-[13px]">;</code> between items.
          </p>
          <div className="hidden border-b-2 border-ink pb-2.5 text-[13px] font-semibold lg:grid lg:grid-cols-[minmax(0,1fr)_5rem_5.5rem_11rem] lg:gap-x-6">
            <span>File</span><span className="text-right">Rows</span><span className="text-right">Size</span><span>SHA-256</span>
          </div>
          <ul className="border-t-2 border-ink lg:border-t-0">
            {row(bundle, bundle.name)}
            {tables.map((f) => row(f))}
            {other.map((f) => row(f))}
            {row(zip)}
          </ul>
        </section>

        {/* columns */}
        <section className="mt-20" aria-labelledby="cols-h">
          <h2 id="cols-h" className="h-md mb-8">Column guide</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {Object.entries(COLUMNS).map(([file, cols]) => (
              <div key={file} className="panel p-6 sm:p-7">
                <h3 className="mono text-[14px] font-semibold mb-4">{file}</h3>
                <dl className="space-y-3">
                  {cols.map(([k, d]) => (
                    <div key={k} className="grid grid-cols-1 sm:grid-cols-[11.5rem_1fr] gap-x-4 gap-y-0.5">
                      <dt className="mono text-[12.5px] text-ink-2 pt-0.5 break-words">{k}</dt>
                      <dd className="text-[14px] text-muted leading-snug">{d}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <p className="text-[14px] text-muted mt-6 max-w-[68ch]">
            {schemas.length} JSON Schemas describing every record type are published under{" "}
            <a href="/data/schema/lexical_entry.json" className="underline underline-offset-4">/data/schema/</a>, and
            are included in the zip.
          </p>
        </section>

        {/* verify */}
        <section className="mt-20" aria-labelledby="verify-h">
          <h2 id="verify-h" className="h-md mb-6">Verify what you downloaded</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              ["macOS / Linux", "shasum -a 256 -c SHA256SUMS.txt"],
              ["Windows PowerShell", "Get-FileHash entries.csv -Algorithm SHA256"],
            ].map(([os, cmd]) => (
              <div key={os} className="panel p-6">
                <div className="flex items-center justify-between mb-3"><span className="kicker">{os}</span><CopyButton text={cmd} /></div>
                <pre className="mono text-[13px] overflow-x-auto">{cmd}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* status */}
        <section className="mt-20 grid gap-12 lg:grid-cols-2" aria-labelledby="status-h">
          <div>
            <h2 id="status-h" className="h-md mb-5">Read this before you use it</h2>
            <ul className="space-y-4 text-[15.5px] leading-[1.7] text-ink-2 max-w-[60ch] list-disc pl-5 marker:text-faint">
              <li><strong className="text-ink">Every record is a draft.</strong> Authored against reference works, not yet reviewed item by item by domain experts.</li>
              <li><strong className="text-ink">The meanings are a selection,</strong> chosen to show derivation and etymology. Statistics over this dataset describe the selection, not the languages.</li>
              <li><strong className="text-ink">Reference entry numbers are absent.</strong> CDIAL and DEDR are cited without numbers, which caps confidence at 0.7.</li>
              <li><strong className="text-ink">Contested means unresolved.</strong> Filter on <code className="mono text-[13px]">status = contested</code> to find edges where scholarship disagrees.</li>
            </ul>
          </div>
          <div>
            <h2 className="h-md mb-5">Release notes</h2>
            <div className="border-t-2 border-ink pt-4">
              <p className="mono text-[13px] font-semibold">v{m.version} · {m.generated}</p>
              <p className="text-[15px] text-ink-2 leading-[1.7] mt-2 max-w-[56ch]">
                The T.H.E.F.T. release adds French and Tamil: {m.counts.entries} words in Telugu, Hindi, English, French and Tamil aligned across {m.counts.concepts} meanings;{" "}
                {m.counts.affixes} affixes in {m.counts.affix_functions} functions; {m.counts.atoms} semantic atoms;{" "}
                {m.counts.etymology_edges} sourced etymology edges. A new register, L, separates the learned Latin and Greek layer from English loans. The release is produced only if the dataset passes the full validator.
              </p>
            </div>
          </div>
        </section>

        {/* cite */}
        <section className="mt-20 panel p-7 sm:p-10" aria-labelledby="cite-h">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 id="cite-h" className="h-md">Cite the dataset</h2>
            <CopyButton text={DATASET_BIBTEX} label="Copy BibTeX" />
          </div>
          <pre className="mono text-[12.5px] leading-[1.7] overflow-x-auto">{DATASET_BIBTEX}</pre>
        </section>
      </div>
    </>
  );
}
