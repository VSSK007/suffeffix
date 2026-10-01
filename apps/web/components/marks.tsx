import { LANG_FAMILY, LANG_NAME, REGISTER_NAME } from "@/lib/lang";

/* Status marks. Each is a compact tag with a coloured dot; colour carries the
   status, the word carries it for anyone who can't see the colour. */

const EPI: Record<string, { color: string; gloss: string }> = {
  ESTABLISHED: { color: "var(--est)", gloss: "citable from reference works" },
  ENGINEERING: { color: "var(--eng)", gloss: "an implementation abstraction, not a linguistic claim" },
  HYPOTHESIS: { color: "var(--hyp)", gloss: "plausible and testable, not yet demonstrated" },
  FUTURE: { color: "var(--fut)", gloss: "out of scope for this release" },
};

function Tag({ color, children, title }: { color: string; children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-[2px] text-[11px] leading-[1.35] text-ink-2 whitespace-nowrap align-middle"
    >
      <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: color }} aria-hidden="true" />
      {children}
    </span>
  );
}

export function EpiTag({ status }: { status: string }) {
  const e = EPI[status] ?? EPI.FUTURE;
  return (
    <Tag color={e.color} title={`Epistemic status — ${e.gloss}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Tag>
  );
}

export function ReviewTag({ status }: { status: string }) {
  const color = status === "published" ? "var(--est)" : status === "reviewed" ? "var(--eng)" : "var(--faint)";
  return (
    <Tag color={color} title="Review status">
      {status}
    </Tag>
  );
}

export function RegisterTag({ register }: { register: string }) {
  return (
    <Tag color="var(--line-2)" title="Register">
      {REGISTER_NAME[register] ?? register}
    </Tag>
  );
}

/** Contested is the project's central honesty claim, so it is the one mark
 *  allowed a filled ground. */
export function ContestedTag() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] font-medium leading-[1.35] whitespace-nowrap align-middle"
      style={{ background: "var(--con-wash)", color: "var(--con)" }}
      title="Scholarship disagrees; stored unresolved"
    >
      <span aria-hidden="true">†</span> contested
    </span>
  );
}

/** Confidence as a five-step meter, value beside it. */
export function Confidence({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="inline-flex items-center gap-1.5 align-middle" title={`Confidence ${value.toFixed(2)} of 1.00`}>
      <span className="inline-flex gap-[2px]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="inline-block h-[10px] w-[4px] rounded-[1px]"
            style={{ background: i < filled ? "var(--ink-2)" : "var(--line-2)" }}
          />
        ))}
      </span>
      <span className="mono text-[11px] text-muted tnum">{value.toFixed(2)}</span>
    </span>
  );
}

export function FamilyDot({ lang, size = 8 }: { lang: string; size?: number }) {
  const fam = LANG_FAMILY[lang] ?? "ie";
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: fam === "dr" ? "var(--dr)" : "var(--ie)" }}
      aria-hidden="true"
    />
  );
}

export function LangLabel({ lang }: { lang: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted">
      <FamilyDot lang={lang} />
      {LANG_NAME[lang] ?? lang}
    </span>
  );
}

/** Hue for an etymology family string (IE:*, Dravidian:*, Semitic, Reconstructed:*). */
export function familyHue(family: string): string {
  if (family.startsWith("Dravidian")) return "var(--dr)";
  if (family === "Reconstructed:Proto-Dravidian") return "var(--dr)";
  if (family === "Reconstructed:PIE") return "var(--pie)";
  if (family === "Semitic") return "var(--semi)";
  if (family.startsWith("IE")) return "var(--ie)";
  return "var(--other)";
}
