"use client";

// Client-side browser over the full (small) entry list: language, register,
// and derived/simplex filters. No server round-trips.

import { useState } from "react";
import type { EntrySummary } from "@/lib/api";
import { EntryList } from "./entry-list";
import { LANG_NAME } from "./badges";

const REGISTERS = [
  ["N", "native"], ["S", "Sanskritic"], ["P", "Perso-Arabic"], ["E", "learned"], ["mixed", "mixed"],
] as const;

function Filter({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly (readonly [string, string])[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex items-baseline gap-x-4 gap-y-1 flex-wrap">
      <span className="label w-[4.5rem] shrink-0">{label}</span>
      <div className="flex gap-x-4 gap-y-1 flex-wrap">
        <button
          onClick={() => onChange(null)}
          className="text-[13px] transition-colors"
          style={{
            color: value === null ? "var(--ink)" : "var(--faint)",
            borderBottom: value === null ? "1px solid var(--accent)" : "1px solid transparent",
          }}
        >
          all
        </button>
        {options.map(([code, name]) => (
          <button
            key={code}
            onClick={() => onChange(value === code ? null : code)}
            className="text-[13px] transition-colors"
            style={{
              color: value === code ? "var(--ink)" : "var(--faint)",
              borderBottom: value === code ? "1px solid var(--accent)" : "1px solid transparent",
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LexiconBrowser({ entries }: { entries: EntrySummary[] }) {
  const [lang, setLang] = useState<string | null>(null);
  const [register, setRegister] = useState<string | null>(null);

  const filtered = entries
    .filter((e) => (!lang || e.lang === lang) && (!register || e.register === register))
    .sort((a, b) => a.translit.localeCompare(b.translit));

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Filter
          label="language"
          options={(["en", "te", "hi"] as const).map((l) => [l, LANG_NAME[l]] as const)}
          value={lang}
          onChange={setLang}
        />
        <Filter label="register" options={REGISTERS} value={register} onChange={setRegister} />
      </div>
      <p className="font-mono text-[11px] text-faint tnum">
        {filtered.length} of {entries.length} entries
      </p>
      <EntryList entries={filtered} />
    </div>
  );
}
