/* Status marks. These are set as small-caps typographic marks with a hairline
   underline in their own colour, not as filled pills — a pill on every fact
   turns the page into confetti and flattens the hierarchy. */

const EPI: Record<string, { color: string; gloss: string }> = {
  ESTABLISHED: { color: "var(--est)", gloss: "citable from reference works" },
  ENGINEERING: { color: "var(--eng)", gloss: "an implementation abstraction, not a linguistic claim" },
  HYPOTHESIS: { color: "var(--hyp)", gloss: "plausible and testable, not yet demonstrated" },
  FUTURE: { color: "var(--faint)", gloss: "out of scope for v0.1" },
};

export function EpiBadge({ status }: { status: string }) {
  const e = EPI[status] ?? EPI.FUTURE;
  return (
    <span
      className="inline-block text-[11px] tracking-[0.07em] align-middle"
      style={{
        color: e.color,
        fontFamily: "var(--font-serif), serif",
        fontVariantCaps: "all-small-caps",
        borderBottom: `1px solid ${e.color}`,
        paddingBottom: "1px",
      }}
      title={`Epistemic status — ${e.gloss}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

export function ReviewBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-block text-[11px] tracking-[0.07em] text-faint align-middle"
      style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
      title="Review status"
    >
      {status}
    </span>
  );
}

/** Contested is the one status that gets real emphasis: it is the project's
 *  central honesty claim, so it is allowed to shout where others whisper. */
export function ContestedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] tracking-[0.07em] align-middle px-1.5 py-0.5"
      style={{
        color: "var(--con)",
        background: "var(--con-bg)",
        fontFamily: "var(--font-serif), serif",
        fontVariantCaps: "all-small-caps",
      }}
      title="Scholarship disagrees; stored unresolved"
    >
      <span aria-hidden="true">†</span> contested
    </span>
  );
}

/** Confidence as a five-step bar — a quantity should read as a quantity. */
export function Confidence({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="inline-flex items-center gap-1.5 align-middle" title={`Confidence ${value.toFixed(2)} of 1.00`}>
      <span className="inline-flex gap-[1.5px]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="inline-block w-[3px] h-[9px]"
            style={{ background: i < filled ? "var(--muted)" : "var(--rule)" }}
          />
        ))}
      </span>
      <span className="font-mono text-[10.5px] text-faint tnum">{value.toFixed(2)}</span>
    </span>
  );
}

const REG: Record<string, string> = {
  N: "native", S: "Sanskritic", P: "Perso-Arabic", E: "learned", mixed: "mixed",
};

export function RegisterBadge({ register }: { register: string }) {
  return (
    <span
      className="inline-block text-[11px] tracking-[0.07em] text-muted align-middle"
      style={{ fontFamily: "var(--font-serif), serif", fontVariantCaps: "all-small-caps" }}
      title={`Register — ${REG[register] ?? register}`}
    >
      {REG[register] ?? register}
    </span>
  );
}

export const LANG_NAME: Record<string, string> = { en: "English", te: "Telugu", hi: "Hindi" };

/** Family hue, used consistently wherever a family is named. */
export function familyColor(family: string): string {
  if (family.startsWith("Dravidian") || family === "Reconstructed:Proto-Dravidian") return "var(--drav)";
  if (family === "Reconstructed:PIE") return "var(--recon)";
  if (family === "Semitic") return "var(--semi)";
  if (family.startsWith("IE")) return "var(--indo)";
  return "var(--faint)";
}
