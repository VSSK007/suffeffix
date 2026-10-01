import Link from "next/link";
import type { ConceptRow, LaneEntry } from "@/lib/model";
import { slug } from "@/lib/model";
import { LANES, LANG_NAME, REGISTER_NAME, langAttr } from "@/lib/lang";
import { AffixChip, StemChip } from "./morphemes";
import { FamilyDot } from "./marks";

/* The signature object. One meaning, three lanes — English | Hindi ‖ Telugu.
   Every affix sits on the row of its *function*, so functionally equivalent
   affixes line up horizontally across the three languages: the alignment is
   shown by position, not asserted in prose. The dashed gutter before Telugu
   is the family boundary. */

const REL_TEXT: Record<string, string> = {
  COGNATE: "cognates — inherited from one Indo-European ancestor",
  SHARED_LOAN: "shared loan — both borrowed from the same Sanskrit source",
  CALQUE: "calque",
};

function Word({ e, focus, size }: { e: LaneEntry; focus: boolean; size: "md" | "lg" }) {
  const big = size === "lg" ? "text-[34px] sm:text-[40px]" : "text-[26px]";
  return (
    <Link href={slug.entryHref(e.id)} className="group block">
      <span
        lang={langAttr(e.lang)}
        className={`display ${big} font-semibold block transition-colors ${focus ? "" : "group-hover:text-ie-ink"}`}
        style={focus ? { textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "6px" } : undefined}
      >
        {e.form}
      </span>
      {e.form !== e.translit && <span className="mono text-[12px] text-muted block mt-1.5">{e.translit}</span>}
    </Link>
  );
}

function Empty({ text = "—" }: { text?: string }) {
  return <span className="text-faint text-[13px]">{text}</span>;
}

export function Triptych({
  row, focusId, size = "md", showHeader = true,
}: { row: ConceptRow; focusId?: string; size?: "md" | "lg"; showHeader?: boolean }) {
  const fnLabel = new Map<string, string>();
  for (const l of LANES) for (const e of row.lanes[l.code]) for (const m of e.morphemes) fnLabel.set(m.fnId, m.fnLabel);

  const cell = (lang: (typeof LANES)[number]["code"], render: (e: LaneEntry) => React.ReactNode, emptyText?: string) => {
    const list = row.lanes[lang];
    if (!list.length) return <Empty text={emptyText ?? "not lexicalised"} />;
    return <div className="space-y-2">{list.map((e) => <div key={e.id}>{render(e)}</div>)}</div>;
  };

  const focusLang = focusId ? (focusId.split(":")[1] as string) : null;
  const laneBg = (code: string) =>
    focusLang === code ? { background: "color-mix(in srgb, var(--ink) 3.5%, transparent)" } : undefined;

  const rowLabel = (title: string, sub?: string) => (
    <div className="pr-4 py-3.5">
      <div className="text-[12.5px] font-medium text-ink-2 leading-tight">{title}</div>
      {sub && <div className="mono text-[10.5px] text-faint mt-0.5">{sub}</div>}
    </div>
  );

  const laneCells = (render: (code: (typeof LANES)[number]["code"]) => React.ReactNode) => (
    <>
      {LANES.slice(0, 2).map((l) => (
        <div key={l.code} className="py-3.5 px-4" style={laneBg(l.code)}>
          {render(l.code)}
        </div>
      ))}
      <div className="gutter" aria-hidden="true" />
      <div className="py-3.5 px-4" style={laneBg("te")}>
        {render("te")}
      </div>
    </>
  );

  const functionRows = row.functions;

  return (
    <div>
      {/* ── desktop: row-major, aligned by function ─────────────── */}
      <div className="hidden md:block">
        {showHeader && (
          <div className="lanes-labelled items-end pb-2">
            <div />
            {LANES.slice(0, 2).map((l) => (
              <div key={l.code} className="px-4">
                <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold">
                  <FamilyDot lang={l.code} /> {l.name}
                </span>
                <div className="text-[11px] text-faint mt-0.5">{l.familyName}</div>
              </div>
            ))}
            <div />
            <div className="px-4">
              <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold">
                <FamilyDot lang="te" /> Telugu
              </span>
              <div className="text-[11px] text-faint mt-0.5">{LANES[2].familyName}</div>
            </div>
          </div>
        )}

        <div className="lanes-labelled border-t border-line">
          {rowLabel("Word")}
          {laneCells((code) => cell(code, (e) => <Word e={e} focus={e.id === focusId} size={size} />))}
        </div>

        <div className="lanes-labelled border-t border-line">
          {rowLabel("Stem")}
          {laneCells((code) => cell(code, (e) => <StemChip text={e.stem} />, ""))}
        </div>

        {functionRows.map((fn) => (
          <div key={fn} className="lanes-labelled border-t border-line">
            {rowLabel(fnLabel.get(fn) ?? fn, `+ ${fn}`)}
            {laneCells((code) => {
              const hits = row.lanes[code].flatMap((e) => e.morphemes.filter((m) => m.fnId === fn).map((m) => ({ e, m })));
              if (!hits.length) {
                const simplex = row.lanes[code].length > 0 && row.lanes[code].every((e) => !e.morphemes.length);
                return <Empty text={row.lanes[code].length === 0 ? "" : simplex ? "simplex" : "—"} />;
              }
              return (
                <div className="flex flex-wrap gap-1.5">
                  {hits.map(({ e, m }) => (
                    <AffixChip key={e.id + m.affixId} m={m} lang={code} showFn={false} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}

        <div className="lanes-labelled border-t border-b border-line">
          {rowLabel("Register")}
          {laneCells((code) =>
            cell(code, (e) => <span className="text-[13px] text-muted">{REGISTER_NAME[e.register] ?? e.register}</span>, ""),
          )}
        </div>
      </div>

      {/* ── mobile: lane-major ──────────────────────────────────── */}
      <div className="md:hidden space-y-0">
        {LANES.map((l, i) => (
          <div key={l.code}>
            {i === 2 && <div className="gutter my-2" aria-hidden="true" />}
            <div className="border-t border-line py-4" style={laneBg(l.code)}>
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold mb-2">
                <FamilyDot lang={l.code} /> {l.name}
              </span>
              {row.lanes[l.code].length === 0 ? (
                <Empty text="not lexicalised in the dataset" />
              ) : (
                row.lanes[l.code].map((e) => (
                  <div key={e.id} className="space-y-2.5 mb-3 last:mb-0">
                    <Word e={e} focus={e.id === focusId} size="md" />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StemChip text={e.stem} size="sm" />
                      {e.morphemes.map((m) => (
                        <span key={m.affixId + m.fnId} className="inline-flex items-center gap-1.5">
                          <span className="text-faint text-[12px]">+</span>
                          <AffixChip m={m} lang={e.lang} size="sm" />
                          <span className="text-[11px] text-muted">{m.fnLabel}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {row.relations.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {row.relations.map((r) => {
            const a = LANES.flatMap((l) => row.lanes[l.code]).find((e) => e.id === r.a);
            const b = LANES.flatMap((l) => row.lanes[l.code]).find((e) => e.id === r.b);
            if (!a || !b) return null;
            return (
              <li key={r.a + r.b} className="text-[13px] text-ink-2 flex flex-wrap items-baseline gap-x-2">
                <span lang={langAttr(a.lang)} className="font-medium">{a.form}</span>
                <span className="text-faint">{LANG_NAME[a.lang]}</span>
                <span className="text-faint">⟷</span>
                <span className="font-medium">{b.form}</span>
                <span className="text-faint">{LANG_NAME[b.lang]}</span>
                <span className="text-muted">· {REL_TEXT[r.relation] ?? r.relation.toLowerCase()}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
