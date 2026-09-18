"use client";

import { useEffect, useState } from "react";
import { api, type SearchResult } from "@/lib/api";
import { EntryRow } from "./entry-list";

export function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api
        .search(q.trim())
        .then((r) => {
          setResults(r);
          setError(null);
        })
        .catch(() => setError("API unreachable — is the backend running?"));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <label htmlFor="search" className="block text-sm text-neutral-600 mb-1">
        Search a word in English, Telugu, Hindi, or Latin transliteration
      </label>
      <input
        id="search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="మంచితనం · bacpan · hopeless · manchitanam"
        className="w-full border border-neutral-400 rounded px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
      {results.length > 0 && (
        <div className="mt-3 border border-neutral-200 rounded bg-white">
          {results.slice(0, 10).map((r) => (
            <EntryRow key={r.entry.id} e={r.entry} />
          ))}
        </div>
      )}
    </div>
  );
}
