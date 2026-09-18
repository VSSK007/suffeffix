const EPI_VARS: Record<string, string> = {
  ESTABLISHED: "var(--est)", ENGINEERING: "var(--eng)", HYPOTHESIS: "var(--hyp)", FUTURE: "var(--muted)",
};
const EPI_BG: Record<string, string> = {
  ESTABLISHED: "var(--est-bg)", ENGINEERING: "var(--eng-bg)", HYPOTHESIS: "var(--hyp-bg)", FUTURE: "var(--code)",
};

export function EpiBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono tracking-wider align-middle"
      style={{ color: EPI_VARS[status] ?? "var(--muted)", background: EPI_BG[status] ?? "var(--code)" }}
      title="Epistemic status"
    >
      {status}
    </span>
  );
}

export function ReviewBadge({ status }: { status: string }) {
  return (
    <span className="inline-block border hairline rounded px-1.5 py-0.5 text-[10px] font-mono text-muted align-middle"
      title="Review status">
      {status}
    </span>
  );
}

export function ContestedBadge() {
  return (
    <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono align-middle"
      style={{ color: "var(--con)", background: "var(--con-bg)" }}>
      contested
    </span>
  );
}

export function Confidence({ value }: { value: number }) {
  return (
    <span className="font-mono text-[11px] text-muted tnum" title="Confidence in [0,1]">
      {value.toFixed(2)}
    </span>
  );
}

const REG_NAME: Record<string, string> = {
  N: "native", S: "Sanskritic", P: "Perso-Arabic", E: "learned stratum", mixed: "mixed",
};

export function RegisterBadge({ register }: { register: string }) {
  return (
    <span className="inline-block border hairline rounded px-1.5 py-0.5 text-[10px] font-mono text-muted align-middle"
      title={`Register: ${REG_NAME[register] ?? register}`}>
      {REG_NAME[register] ?? register}
    </span>
  );
}

export const LANG_NAME: Record<string, string> = { en: "English", te: "Telugu", hi: "Hindi" };
