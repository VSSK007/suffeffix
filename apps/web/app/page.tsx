import Link from "next/link";
import { data, slug } from "@/lib/data";
import { LANES } from "@/lib/lang";
import { SearchTrigger } from "@/components/command-palette";
import { Showcase } from "@/components/showcase";
import { FamilyDot } from "@/components/marks";

const SHOWCASE = [
  "concept:GOODNESS", "concept:CHILDHOOD", "concept:HOPELESS", "concept:TEACHER",
  "concept:LONELINESS", "concept:SOCIALISM", "concept:READABLE", "concept:CAREFULLY",
];

/* Sugar's three routes out of Sanskrit, as recorded in the etymology edges. */
const SUGAR_ROUTES: { label: string; steps: { form: string; fam: string }[] }[] = [
  {
    label: "inherited, east",
    steps: [
      { form: "śarkarā", fam: "ie" }, { form: "sakkarā", fam: "ie" }, { form: "शक्कर", fam: "ie" },
    ],
  },
  {
    label: "borrowed, west",
    steps: [
      { form: "śarkarā", fam: "ie" }, { form: "šakar", fam: "ie" }, { form: "sukkar", fam: "semi" },
      { form: "succarum", fam: "ie" }, { form: "sucre", fam: "ie" }, { form: "sugar", fam: "ie" },
    ],
  },
  {
    label: "borrowed, south",
    steps: [{ form: "śarkarā", fam: "ie" }, { form: "చక్కెర", fam: "dr" }],
  },
];
const FAM_HUE: Record<string, string> = { ie: "var(--ie)", dr: "var(--dr)", semi: "var(--semi)" };

export default async function Home() {
  const [meta, concepts, affixes, atoms] = await Promise.all([data.meta(), data.concepts(), data.affixes(), data.atoms()]);
  const rows = SHOWCASE.map((id) => concepts.find((c) => c.id === id)).filter((r): r is NonNullable<typeof r> => !!r);
  const c = meta.counts;
  const jobs = new Set(affixes.flatMap((a) => a.functions)).size;
  const priv = (lang: string) => affixes.filter((a) => a.lang === lang && a.functions.includes("fn:PRIV"));

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* ── thesis ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-10 items-end">
        <div>
          <div className="flex items-center gap-3 mb-6">
            {LANES.map((l) => (
              <span key={l.code} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                <FamilyDot lang={l.code} /> {l.name}
              </span>
            ))}
          </div>
          <h1 className="display text-[36px] sm:text-[60px] lg:text-[72px] font-semibold">
            One meaning.
            <br />
            Three languages.
            <br />
            <span className="text-faint">Two families.</span>
          </h1>
        </div>
        <div className="space-y-6">
          <p className="text-[17px] leading-[1.65] text-ink-2 max-w-[48ch]">
            Suffeffix is a knowledge graph that takes words apart — stem, affix, function — and lines them
            up across English, Hindi and Telugu. Every etymology carries a source and a confidence; every
            explanation shows the rules that built it.
          </p>
          <SearchTrigger variant="hero" />
        </div>
      </section>

      {/* ── the instrument ─────────────────────────────────────── */}
      <section>
        <Showcase rows={rows} />
      </section>

      {/* ── three instruments, each previewed with real data ───── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Link href="/affixes/" className="panel p-6 group hover:border-line-2 transition-colors flex flex-col">
          <p className="kicker mb-3">Affix Atlas</p>
          <h2 className="wide text-[22px] font-semibold leading-snug mb-2">{jobs} jobs an affix can do, in three languages</h2>
          <p className="text-[13.5px] text-muted leading-relaxed mb-6">
            Every affix filed by function. Here is the privative row — the affixes that mean “without”.
          </p>
          <div className="mt-auto lanes gap-y-1 text-[17px]">
            {(["en", "hi"] as const).map((l) => (
              <div key={l} className="flex flex-wrap gap-1.5">
                {priv(l).map((a) => (
                  <span key={a.id} className="chip-ie rounded-md px-2 py-0.5">{a.form}</span>
                ))}
              </div>
            ))}
            <div className="gutter" aria-hidden="true" />
            <div className="flex flex-wrap gap-1.5">
              {priv("te").map((a) => (
                <span key={a.id} className="chip-dr rounded-md px-2 py-0.5">{a.form}</span>
              ))}
            </div>
          </div>
          <span className="mt-6 text-[13px] font-medium text-ie-ink group-hover:underline underline-offset-4">Open the Atlas →</span>
        </Link>

        <Link href={slug.etymologyHref("lex:en:sugar")} className="panel p-6 group hover:border-line-2 transition-colors flex flex-col">
          <p className="kicker mb-3">Etymology</p>
          <h2 className="wide text-[22px] font-semibold leading-snug mb-2">One Sanskrit word, three routes out</h2>
          <p className="text-[13.5px] text-muted leading-relaxed mb-6">
            Sugar left Sanskrit three ways. Colour is family; every change of colour is a borrowing.
          </p>
          <div className="mt-auto space-y-2.5">
            {SUGAR_ROUTES.map((r) => (
              <div key={r.label}>
                <div className="text-[11px] text-faint mb-1">{r.label}</div>
                <div className="flex flex-wrap items-center gap-1 text-[13.5px]">
                  {r.steps.map((s, k) => (
                    <span key={k} className="inline-flex items-center gap-1">
                      {k > 0 && <span className="text-faint text-[11px]">→</span>}
                      <span className="rounded px-1.5 py-[1px]" style={{ boxShadow: `inset 0 -2px 0 ${FAM_HUE[s.fam]}` }}>
                        {s.form}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <span className="mt-6 text-[13px] font-medium text-ie-ink group-hover:underline underline-offset-4">See the lineage graph →</span>
        </Link>

        <Link href="/atoms/" className="panel p-6 group hover:border-line-2 transition-colors flex flex-col">
          <p className="kicker mb-3">Semantic atoms</p>
          <h2 className="wide text-[22px] font-semibold leading-snug mb-2">Fifty atoms, and not one more</h2>
          <p className="text-[13.5px] text-muted leading-relaxed mb-6">
            Meanings are decomposed into a closed inventory — an engineering interlingua, not a theory of
            cognition. Filled cells are NSM primes.
          </p>
          <div className="mt-auto grid grid-cols-10 gap-[3px]">
            {atoms.map((a) => (
              <span
                key={a.id}
                title={a.id.replace("atom:", "")}
                className="aspect-square rounded-[3px]"
                style={a.nsm_prime ? { background: "var(--ink-2)" } : { border: "1.5px solid var(--line-2)" }}
              />
            ))}
          </div>
          <span className="mt-6 text-[13px] font-medium text-ie-ink group-hover:underline underline-offset-4">Browse the atoms →</span>
        </Link>
      </section>

      {/* ── the constraint + honest counts ──────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-start">
        <div>
          <p className="kicker mb-3">The one hard rule</p>
          <h2 className="wide text-[28px] sm:text-[32px] font-semibold leading-tight mb-4">
            No cognate crosses the gutter.
          </h2>
          <p className="text-[15px] leading-[1.75] text-ink-2 max-w-[52ch]">
            Telugu is Dravidian; Hindi and English are Indo-European. Telugu’s many resemblances to Hindi
            are borrowings — mostly from Sanskrit — and the validator rejects any cognate or inheritance
            edge that claims otherwise. Where the literature disagrees, as with Telugu కుక్క and Hindi
            कुत्ता, the edge is stored <span className="text-con font-medium">contested</span> and left
            unresolved.
          </p>
        </div>
        <div>
          <p className="kicker mb-4">The dataset, counted honestly</p>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6">
            {(
              [
                [c.entries, "words", `en ${c.entries_by_lang.en} · hi ${c.entries_by_lang.hi} · te ${c.entries_by_lang.te}`],
                [c.concepts as number, "aligned meanings", "the rows of the concordance"],
                [c.affixes as number, "affixes", `in ${c.affix_functions as number} functions`],
                [c.atoms as number, "semantic atoms", "40 are NSM primes"],
                [c.etymology_edges as number, "etymology edges", `${c.contested_edges as number} contested`],
                [meta.review_status.draft ?? 0, "items in draft", "awaiting expert review"],
              ] as [number, string, string][]
            ).map(([n, label, note]) => (
              <div key={label} className="border-t border-line pt-3">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="wide text-[34px] font-semibold tnum leading-none block">{n}</span>
                  <span className="text-[13.5px] font-medium block mt-1.5">{label}</span>
                  <span className="text-[12px] text-muted block">{note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
