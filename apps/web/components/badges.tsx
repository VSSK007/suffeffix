const EPI_STYLE: Record<string, string> = {
  ESTABLISHED: "bg-emerald-50 text-emerald-800 border-emerald-300",
  ENGINEERING: "bg-sky-50 text-sky-800 border-sky-300",
  HYPOTHESIS: "bg-amber-50 text-amber-800 border-amber-300",
  FUTURE: "bg-neutral-100 text-neutral-600 border-neutral-300",
};

export function EpiBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block border rounded px-1.5 py-0.5 text-[10px] font-mono tracking-wide ${EPI_STYLE[status] ?? EPI_STYLE.FUTURE}`}
      title="Epistemic status"
    >
      {status}
    </span>
  );
}

export function ReviewBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-block border border-neutral-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-neutral-600"
      title="Review status"
    >
      {status}
    </span>
  );
}

export function ContestedBadge() {
  return (
    <span className="inline-block border border-red-300 bg-red-50 text-red-800 rounded px-1.5 py-0.5 text-[10px] font-mono">
      contested
    </span>
  );
}

export function Confidence({ value }: { value: number }) {
  return (
    <span className="font-mono text-[11px] text-neutral-600" title="Confidence in [0,1]">
      conf {value.toFixed(2)}
    </span>
  );
}

export function RegisterBadge({ register }: { register: string }) {
  const names: Record<string, string> = {
    N: "native", S: "Sanskritic", P: "Perso-Arabic", E: "learned/loan", mixed: "mixed",
  };
  return (
    <span className="inline-block border border-neutral-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-neutral-700"
      title="Register">
      {register} · {names[register] ?? register}
    </span>
  );
}

export const LANG_NAME: Record<string, string> = { en: "English", te: "Telugu", hi: "Hindi" };
