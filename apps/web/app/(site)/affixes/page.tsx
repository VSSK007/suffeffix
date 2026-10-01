import { data } from "@/lib/data";
import type { LangCode } from "@/lib/lang";
import { Atlas, type AtlasRow, type ExampleRow } from "@/components/atlas";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Affix Atlas", description: "Every affix in English, Hindi and Telugu filed by the job it does — states, agents, privatives, causatives — with register, productivity and real example words.", path: "/affixes/" });

export default async function AffixesPage() {
  const [affixes, functions, concepts, eqs] = await Promise.all([
    data.affixes(), data.functions(), data.concepts(), data.eqClasses(),
  ]);
  const eqByFn = new Map(eqs.map((e) => [e.eq.function_id, e.eq.notes]));

  const rows: AtlasRow[] = functions
    .map((f) => {
      const cells: AtlasRow["cells"] = { en: [], hi: [], te: [] };
      for (const a of affixes) {
        if (a.functions.includes(f.id)) {
          cells[a.lang as LangCode].push({ id: a.id, form: a.form, translit: a.translit, register: a.register, productivity: a.productivity });
        }
      }
      const examples: ExampleRow[] = concepts
        .map((c) => {
          const lanes = {} as ExampleRow["lanes"];
          let n = 0;
          for (const l of ["en", "hi", "te"] as LangCode[]) {
            const hit = c.lanes[l].flatMap((e) => e.morphemes.filter((m) => m.fnId === f.id).map((m) => ({ e, m })))[0];
            lanes[l] = hit ? { id: hit.e.id, form: hit.e.form, translit: hit.e.translit, affix: hit.m.form } : null;
            if (hit) n++;
          }
          return { ex: { conceptId: c.id, gloss: c.gloss, lanes }, n };
        })
        .filter((x) => x.n >= 2)
        .sort((a, b) => b.n - a.n || a.ex.gloss.localeCompare(b.ex.gloss))
        .slice(0, 6)
        .map((x) => x.ex);
      return {
        id: f.id,
        label: f.label,
        definition: f.definition,
        status: f.epistemic_status,
        cells,
        examples,
        note: eqByFn.get(f.id) ?? null,
      };
    })
    .filter((r) => r.cells.en.length + r.cells.hi.length + r.cells.te.length > 0);

  return (
    <div>
      <header className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-end mb-12">
        <div>
          <p className="kicker mb-3">Affix Atlas</p>
          <h1 className="display text-[40px] sm:text-[52px] font-semibold">
            {rows.length} jobs an affix
            <br />
            can do
          </h1>
        </div>
        <div className="space-y-3 max-w-[56ch]">
          <p className="text-[15px] leading-[1.7] text-ink-2">
            Each row is a function; each lane holds the affixes that perform it. Open a row to see real
            words from all three languages doing the same job. Affixes in a row are{" "}
            <em>functional</em> equivalents — their register and reach differ, and swapping one for
            another usually produces nonsense.
          </p>
          <p className="text-[12.5px] text-muted">
            Letters on a chip give its register: N native · S Sanskritic · P Perso-Arabic · E learned. A
            dashed chip is no longer productive.
          </p>
        </div>
      </header>
      <Atlas rows={rows} initial="fn:ST" />
    </div>
  );
}
