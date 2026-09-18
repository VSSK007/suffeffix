"use client";

// Client-side browser over the full (small) entry list: language + register
// filters and alphabetical grouping, no server round-trips.

import { useState } from "react";
import type { EntrySummary } from "@/lib/api";
import { EntryList } from "./entry-list";
import { LANG_NAME } from "./badges";

const REGISTERS = [
  ["N", "native"], ["S", "Sanskritic"], ["P", "Perso-Arabic"], ["E", "learned"], ["mixed", "mixed"],
] as const;

export function LexiconBrowser({ entries }: { entries: EntrySummary[] }) {
  const [lang, setLang] = useState<string | null>(null);
  const [register, setRegister] = useState<string | null>(null);

  const filtered = entries
    .filter((e) => (!lang || e.lang === lang) && (!register || e.register === register))
    .sort((a, b) => a.translit.localeCompare(b.translit));

  const pill = (active: boolean) =>
    `px-2.5 py-1 rounded-full text-[12px] border transition-colors ${
      active ? "border-accent text-accent" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="eyebrow mr-1">Language</span>
          <button className={pill(lang === null)} style={{ borderColor: lang === null ? undefined : "var(--line)" }}
            onClick={() => setLang(null)}>all</button>
          {(["en", "te", "hi"] as const).map((l) => (
            <button key={l} className={pill(lang === l)} style={{ borderColor: lang === l ? undefined : "var(--line)" }}
              onClick={() => setLang(lang === l ? null : l)}>
              {LANG_NAME[l]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="eyebrow mr-1">Register</span>
          {REGISTERS.map(([code, label]) => (
            <button key={code} className={pill(register === code)}
              style={{ borderColor: register === code ? undefined : "var(--line)" }}
              onClick={() => setRegister(register === code ? null : code)}>
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[11px] text-muted tnum">{filtered.length} entries</span>
      </div>
      <EntryList entries={filtered} />
    </div>
  );
}
