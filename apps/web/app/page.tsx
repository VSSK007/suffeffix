import Link from "next/link";
import { data, slug } from "@/lib/data";
import { SearchBox } from "@/components/search-box";
import { Segmentation } from "@/components/segmentation";

/* The hero is the thesis: one word, cut. Everything else on the page is
   apparatus around that demonstration. */
const HERO = "lex:te:mancitanam";

const SEEDS = [
  { id: "lex:hi:bacpan", why: "बच्चा + -पन — the same state-suffix job, done natively in Hindi" },
  { id: "lex:en:hopeless", why: "hope + -less — privative, aligned with Telugu -లేని and Hindi -हीन" },
  { id: "lex:en:sugar", why: "one Sanskrit word, three routes out: east, west, and south" },
  { id: "lex:te:kukka", why: "Telugu కుక్క and Hindi कुत्ता look alike; the graph refuses to say why" },
];

export default async function Home() {
  const meta = await data.meta();
  const hero = await data.entry(HERO);
  const seeds = await Promise.all(SEEDS.map(async (s) => ({ ...s, d: await data.entry(s.id) })));
  const c = meta.counts;

  const heroPieces = [
    { text: hero.entry.morphology.stem_form, role: "stem" as const, label: "stem · good" },
    ...hero.affixes.map((a, i) => ({
      text: a.form,
      translit: a.translit,
      role: "affix" as const,
      label: hero.functions[i]?.label,
      href: slug.affixHref(a.id),
    })),
  ];

  return (
    <div className="space-y-24">
      {/* ── hero: the demonstration ─────────────────────────────── */}
      <section>
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-end">
          <div>
            <p className="label mb-5">Telugu · noun · native register</p>
            <Segmentation pieces={heroPieces} size="lg" />
            <p className="mt-8 font-serif text-[19px] leading-relaxed max-w-[46ch]">
              <span className="italic">mañcitanaṁ</span> — the state of being good.
              One stem, one suffix, and a claim you can check all the way down.
            </p>
            <Link
              href={slug.entryHref(HERO)}
              className="inline-block mt-5 font-mono text-[12px] underline underline-offset-4"
              style={{ color: "var(--accent-ink)" }}
            >
              read the full entry →
            </Link>
          </div>

          {/* the apparatus: what the graph knows about that one word */}
          <dl className="specimen p-6 text-[13.5px] space-y-3.5 min-w-[17rem] lg:max-w-xs">
            <div>
              <dt className="label">decomposition</dt>
              <dd className="font-mono text-[14px] mt-1">{hero.structure_pretty}</dd>
            </div>
            <div>
              <dt className="label">aligned</dt>
              <dd className="mt-1 space-y-0.5">
                {hero.aligned.map((a) => (
                  <Link
                    key={a.entry.id}
                    href={slug.entryHref(a.entry.id)}
                    className="block hover:text-accent transition-colors"
                  >
                    {a.entry.form}
                    <span className="text-faint font-mono text-[11px] ml-2">{a.entry.lang}</span>
                  </Link>
                ))}
              </dd>
            </div>
            <div>
              <dt className="label">review status</dt>
              <dd className="font-mono text-[12px] mt-1 text-muted">
                {hero.entry.provenance.review_status} · annotated {hero.entry.provenance.date}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <SearchBox autoFocus />
      </section>

      {/* ── four ways in, each with a reason ────────────────────── */}
      <section>
        <h2
          className="font-serif text-[15px] mb-6"
          style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}
        >
          Four words worth opening
        </h2>
        <ul>
          {seeds.map(({ id, why, d }) => (
            <li key={id} style={{ borderTop: "1px solid var(--rule)" }}>
              <Link
                href={slug.entryHref(id)}
                className="group grid sm:grid-cols-[13rem_1fr] gap-x-8 gap-y-1 py-5 items-baseline"
              >
                <span className="flex items-baseline gap-3">
                  <span className="text-[23px] font-serif group-hover:text-accent transition-colors">
                    {d.entry.lemma.form}
                  </span>
                  {d.entry.lemma.form !== d.entry.lemma.translit && (
                    <span className="font-mono text-[11.5px] text-faint">{d.entry.lemma.translit}</span>
                  )}
                </span>
                <span className="text-[14.5px] text-muted leading-relaxed">{why}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── the constraint that makes this not a dictionary ─────── */}
      <section className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div>
          <h2 className="font-serif text-[26px] leading-snug">Two families, and no pretending otherwise</h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-muted max-w-[46ch]">
            Telugu is Dravidian. Hindi and English are Indo-European. No cognate has ever crossed
            that line, so the validator refuses to store one — Telugu&rsquo;s resemblances to Hindi are
            borrowings, and the graph says which. Where scholarship disagrees, the edge stays marked{" "}
            <span style={{ color: "var(--accent-ink)" }}>contested</span> rather than quietly resolved.
          </p>
        </div>
        <figure className="font-mono text-[12.5px] leading-[1.9]">
          <div className="flex items-baseline gap-3">
            <span
              className="w-3 h-3 inline-block shrink-0 translate-y-[1px]"
              style={{ background: "var(--indo)" }}
            />
            <span>Indo-European — English · Hindi · Sanskrit · Latin · PIE</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span
              className="w-3 h-3 inline-block shrink-0 translate-y-[1px]"
              style={{ background: "var(--drav)" }}
            />
            <span>Dravidian — Telugu · Proto-Dravidian</span>
          </div>
          <figcaption className="mt-5 text-[11.5px] text-faint leading-relaxed max-w-[36ch]">
            {c.contested_edges as number} of {c.etymology_edges as number} etymology edges are stored
            as contested. Every edge carries a source and a confidence in [0,1].
          </figcaption>
        </figure>
      </section>

      {/* ── the ledger: counts as a ruled table, not stat cards ──── */}
      <section>
        <h2
          className="font-serif text-[15px] mb-5"
          style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.09em" }}
        >
          The dataset, honestly counted
        </h2>
        <table className="w-full text-[14px]" style={{ borderCollapse: "collapse" }}>
          <tbody>
            {([
              [c.entries, "lexical entries", `English ${c.entries_by_lang.en} · Telugu ${c.entries_by_lang.te} · Hindi ${c.entries_by_lang.hi}`],
              [c.affixes as number, "affixes", `across ${c.affix_functions as number} cross-lingual functions and ${c.equivalence_classes as number} equivalence classes`],
              [c.atoms as number, "semantic atoms", "an engineering interlingua, not a theory of cognition — 40 seeded from NSM primes"],
              [c.etymology_edges as number, "etymology edges", `each with a cited source; ${c.contested_edges as number} contested, ${c.roots as number} reconstructed roots`],
              [meta.review_status.draft ?? 0, "items still draft", "authored against reference works, awaiting item-by-item review"],
            ] as [number, string, string][]).map(([n, label, note]) => (
              <tr key={label} style={{ borderTop: "1px solid var(--rule)" }}>
                <td className="py-3.5 pr-5 font-mono text-[21px] tnum align-baseline w-[4.5rem] text-right">{n}</td>
                <td className="py-3.5 pr-6 align-baseline font-serif text-[16px] whitespace-nowrap">{label}</td>
                <td className="py-3.5 align-baseline text-[13px] text-muted leading-relaxed">{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
