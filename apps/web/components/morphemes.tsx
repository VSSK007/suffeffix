import Link from "next/link";
import type { LaneEntry, Morpheme } from "@/lib/model";
import { slug } from "@/lib/model";
import { LANG_FAMILY, langAttr } from "@/lib/lang";

/** One affix as a chip tinted by its language family. */
export function AffixChip({
  m, lang, size = "md", showFn = true,
}: { m: Morpheme; lang: string; size?: "sm" | "md" | "lg"; showFn?: boolean }) {
  const fam = LANG_FAMILY[lang] === "dr" ? "chip-dr" : "chip-ie";
  const text = size === "lg" ? "text-[26px] px-3.5 py-1.5" : size === "sm" ? "text-[13px] px-2 py-[1px]" : "text-[16px] px-2.5 py-1";
  return (
    <Link
      href={slug.affixHref(m.affixId)}
      className={`${fam} group inline-flex items-baseline gap-2 rounded-lg ${text} leading-tight transition-transform hover:-translate-y-[1px]`}
      title={`${m.fnLabel} (${m.fnId})`}
    >
      <span lang={langAttr(lang)} className="font-medium">{m.form}</span>
      {showFn && size !== "sm" && (
        <span className="mono text-[10.5px] opacity-75 tracking-wide">{m.fnId.replace("fn:", "")}</span>
      )}
    </Link>
  );
}

export function StemChip({ text, size = "md", lang }: { text: string; size?: "sm" | "md" | "lg"; lang?: string }) {
  const cls = size === "lg" ? "text-[26px] px-3.5 py-1.5" : size === "sm" ? "text-[13px] px-2 py-[1px]" : "text-[16px] px-2.5 py-1";
  return <span lang={lang} className={`chip-stem inline-flex items-baseline rounded-lg ${cls} leading-tight`}>{text}</span>;
}

/** The word as an equation: prefixes + stem + suffixes. Simplex words say so. */
export function Morphemes({ e, size = "md" }: { e: LaneEntry; size?: "sm" | "md" | "lg" }) {
  if (!e.morphemes.length) {
    return <span className="text-[12px] text-faint italic">simplex — no productive affix</span>;
  }
  const pre = e.morphemes.filter((m) => m.kind === "prefix");
  const post = e.morphemes.filter((m) => m.kind !== "prefix");
  const plus = <span className={`text-faint ${size === "lg" ? "text-[20px]" : "text-[13px]"}`}>+</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {pre.map((m) => (
        <span key={m.affixId + m.fnId} className="inline-flex items-center gap-2">
          <AffixChip m={m} lang={e.lang} size={size} />
          {plus}
        </span>
      ))}
      <StemChip text={e.stem} size={size} lang={langAttr(e.lang)} />
      {post.map((m) => (
        <span key={m.affixId + m.fnId} className="inline-flex items-center gap-2">
          {plus}
          <AffixChip m={m} lang={e.lang} size={size} />
        </span>
      ))}
    </span>
  );
}
