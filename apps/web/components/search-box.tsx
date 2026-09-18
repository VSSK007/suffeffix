"use client";

// Client-side search over the prebuilt index (public/search-index.json).
// Normalization mirrors suffeffix_core.search.normalize: NFC + lowercase +
// diacritic stripping so `manchitanam` finds mañcitanaṁ.

import { useEffect, useRef, useState } from "react";
import { EntryRow } from "./entry-list";

interface IndexRow {
  id: string; lang: "en" | "te" | "hi"; form: string; translit: string; gloss: string;
  pos: string; register: string; nform: string; ntranslit: string; ngloss: string;
  schema: string;
}

const MAP: Record<string, string> = {
  "ā": "a", "ī": "i", "ū": "u", "ē": "e", "ō": "o", "ṁ": "m", "ṃ": "m",
  "ñ": "n", "ṅ": "n", "ṇ": "n", "ṭ": "t", "ḍ": "d", "ś": "s", "ṣ": "s",
  "ṛ": "r", "ḷ": "l", "ḻ": "l",
};

function normalize(text: string): string {
  let t = text.normalize("NFC").trim().toLowerCase();
  t = [...t].map((c) => MAP[c] ?? c).join("");
  // strip combining marks that follow ASCII letters (Latin diacritics only)
  const d = t.normalize("NFD");
  let out = "";
  for (const ch of d) {
    if (/\p{M}/u.test(ch) && out.length > 0 && out.charCodeAt(out.length - 1) < 128) continue;
    out += ch;
  }
  return out.normalize("NFC");
}

function score(row: IndexRow, qn: string, raw: string): number {
  if (raw === row.form || qn === row.nform) return 100;
  if (qn === row.translit.toLowerCase()) return 90;
  if (qn === row.ntranslit) return 80;
  if (row.nform.startsWith(qn) || row.ntranslit.startsWith(qn)) return 60;
  if (row.ngloss.includes(qn)) return 40;
  return 0;
}

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<IndexRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const loaded = useRef(false);

  const ensureIndex = () => {
    if (loaded.current) return;
    loaded.current = true;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setFailed(true));
  };

  useEffect(() => {
    if (autoFocus) ensureIndex();
  }, [autoFocus]);

  const qn = normalize(q);
  const results =
    rows && qn.length >= 2
      ? rows
          .map((r) => ({ r, s: score(r, qn, q.trim()) }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s || a.r.id.localeCompare(b.r.id))
          .slice(0, 10)
      : [];

  return (
    <div>
      <label htmlFor="search" className="eyebrow block mb-2">
        Search — any of the three scripts, or Latin transliteration
      </label>
      <input
        id="search"
        type="search"
        autoFocus={autoFocus}
        value={q}
        onFocus={ensureIndex}
        onChange={(e) => {
          ensureIndex();
          setQ(e.target.value);
        }}
        placeholder="మంచితనం · बचपन · hopeless · manchitanam"
        className="w-full border hairline rounded-md px-4 py-3 font-mono text-sm bg-card focus:outline-none focus:border-accent transition-colors"
      />
      {failed && <p className="text-sm mt-2" style={{ color: "var(--con)" }}>Search index failed to load.</p>}
      {results.length > 0 && (
        <div className="mt-3 border hairline rounded-md bg-card px-2">
          {results.map(({ r }) => (
            <EntryRow key={r.id} e={r} />
          ))}
        </div>
      )}
      {rows && qn.length >= 2 && results.length === 0 && (
        <p className="text-sm text-muted mt-3">No matches for “{q}”.</p>
      )}
    </div>
  );
}
