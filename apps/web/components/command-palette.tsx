"use client";

// Global search, opened with ⌘K / Ctrl+K / "/", or by any element that
// dispatches the "suffeffix:search" event. Searches entries (by script,
// transliteration, or gloss), meanings, affixes and atoms; fully keyboard
// driven. Indexes load lazily on first open.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_NAME, isDravidian, normalize } from "@/lib/lang";

interface EntryRow {
  id: string; lang: string; form: string; translit: string; gloss: string;
  nform: string; ntranslit: string; ngloss: string;
}
interface NavRow { type: "concept" | "affix" | "atom"; href: string; title: string; sub: string; keys: string[] }
interface Hit { group: string; href: string; title: string; sub: string; lang?: string; score: number }

const GROUP_ORDER = ["Words", "Meanings", "Affixes", "Atoms"];
const GROUP_OF: Record<NavRow["type"], string> = { concept: "Meanings", affix: "Affixes", atom: "Atoms" };

function scoreEntry(r: EntryRow, qn: string, raw: string): number {
  if (raw === r.form || qn === r.nform) return 100;
  if (qn === r.translit.toLowerCase() || qn === r.ntranslit) return 90;
  if (r.nform.startsWith(qn) || r.ntranslit.startsWith(qn)) return 60;
  if (r.ngloss.includes(qn)) return 40;
  return 0;
}

function scoreNav(r: NavRow, qn: string): number {
  let best = 0;
  for (const k of r.keys) {
    if (!k) continue;
    if (k === qn) best = Math.max(best, 95);
    else if (k.startsWith(qn)) best = Math.max(best, 65);
    else if (qn.length >= 3 && k.includes(qn)) best = Math.max(best, 35);
  }
  return best;
}

export function openSearch(query = "") {
  window.dispatchEvent(new CustomEvent("suffeffix:search", { detail: query }));
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [entries, setEntries] = useState<EntryRow[] | null>(null);
  const [nav, setNav] = useState<NavRow[] | null>(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const loaded = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (loaded.current) return;
    loaded.current = true;
    Promise.all([
      fetch("/search-index.json").then((r) => r.json()),
      fetch("/nav-index.json").then((r) => r.json()),
    ])
      .then(([e, n]) => {
        setEntries(e);
        setNav(n);
      })
      .catch(() => setFailed(true));
  }, []);

  const show = useCallback(
    (query = "") => {
      load();
      setQ(query);
      setActive(0);
      setOpen(true);
    },
    [load],
  );

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setOpen((o) => {
          if (!o) show();
          return !o;
        });
      } else if (ev.key === "/" && !typing) {
        ev.preventDefault();
        show();
      }
    };
    const onOpen = (ev: Event) => show((ev as CustomEvent<string>).detail ?? "");
    window.addEventListener("keydown", onKey);
    window.addEventListener("suffeffix:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("suffeffix:search", onOpen);
    };
  }, [show]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => input.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const qn = normalize(q);
    if (qn.length < 1 || !entries || !nav) return [];
    const out: Hit[] = [];
    for (const r of entries) {
      const s = scoreEntry(r, qn, q.trim());
      if (s) out.push({ group: "Words", href: `/lexicon/${r.id.split(":").slice(1).join("/")}/`, title: r.form, sub: r.form !== r.translit ? `${r.translit} · ${r.gloss}` : r.gloss, lang: r.lang, score: s });
    }
    for (const r of nav) {
      const s = scoreNav(r, qn);
      if (s) out.push({ group: GROUP_OF[r.type], href: r.href, title: r.title, sub: r.sub, score: s });
    }
    const grouped: Hit[] = [];
    for (const g of GROUP_ORDER) {
      grouped.push(...out.filter((h) => h.group === g).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, g === "Words" ? 8 : 5));
    }
    return grouped;
  }, [q, entries, nav]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (h: Hit) => {
    setOpen(false);
    router.push(h.href);
  };

  const onInputKey = (ev: React.KeyboardEvent) => {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(hits.length - 1, 0)));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (ev.key === "Enter" && hits[active]) {
      ev.preventDefault();
      go(hits[active]);
    } else if (ev.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  let lastGroup = "";
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]"
      style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)", backdropFilter: "blur(6px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search Suffeffix"
    >
      <div className="panel shadow-lift w-full max-w-[640px] overflow-hidden rise">
        <div className="flex items-center gap-3 px-4 border-b border-line">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="palette-input"
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="A word in any script, a meaning, an affix, an atom…"
            className="flex-1 bg-transparent py-4 text-[17px] outline-none placeholder:text-faint"
            autoComplete="off"
            spellCheck={false}
            aria-controls="palette-results"
            aria-activedescendant={hits[active] ? `hit-${active}` : undefined}
          />
          <kbd className="mono text-[10.5px] text-faint border border-line rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <div ref={list} id="palette-results" role="listbox" className="max-h-[56vh] overflow-y-auto py-2">
          {failed && <p className="px-4 py-3 text-[14px] text-con">The search index did not load. Reload the page and try again.</p>}
          {!failed && !entries && <p className="px-4 py-3 text-[14px] text-muted">Loading the index…</p>}
          {entries && q.trim() === "" && (
            <div className="px-4 py-3 text-[13.5px] text-muted space-y-3">
              <p>Type in English, French, Hindi, Telugu, Tamil, or Latin transliteration — <span className="mono text-ink-2">manchitanam</span> finds మంచితనం.</p>
              <div className="flex flex-wrap gap-1.5">
                {["అమ్మ", "bacpan", "hopeless", "sugar", "state", "-less", "GOOD"].map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line px-2.5 py-1 text-[12.5px] hover:border-line-2 hover:text-ink">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {entries && q.trim() !== "" && hits.length === 0 && (
            <p className="px-4 py-3 text-[14px] text-muted">Nothing matches “{q}”. Try a transliteration without diacritics, or an English gloss.</p>
          )}
          {hits.map((h, i) => {
            const header = h.group !== lastGroup ? h.group : null;
            lastGroup = h.group;
            return (
              <div key={h.group + h.href + i}>
                {header && <div className="kicker px-4 pt-3 pb-1.5">{header}</div>}
                <button
                  id={`hit-${i}`}
                  data-idx={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(h)}
                  className="w-full text-left px-4 py-2 flex items-baseline gap-3"
                  style={i === active ? { background: "var(--sunk)" } : undefined}
                >
                  <span className="text-[16px] font-medium shrink-0">{h.title}</span>
                  <span className="text-[12.5px] text-muted truncate">{h.sub}</span>
                  {h.lang && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-faint shrink-0">
                      <span className="w-[7px] h-[7px] rounded-full" style={{ background: isDravidian(h.lang ?? "") ? "var(--dr)" : "var(--ie)" }} />
                      {LANG_NAME[h.lang]}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-line text-[11px] text-faint">
          <span><kbd className="mono">↑↓</kbd> move</span>
          <span><kbd className="mono">↵</kbd> open</span>
          <span className="ml-auto">{entries ? `${entries.length} words · ${nav?.length ?? 0} meanings, affixes & atoms` : ""}</span>
        </div>
      </div>
    </div>
  );
}

/** A field-shaped button that opens the palette. */
export function SearchTrigger({ variant = "header" }: { variant?: "header" | "hero" }) {
  if (variant === "hero") {
    return (
      <button
        onClick={() => openSearch()}
        className="panel w-full flex items-center gap-3 px-5 py-4 text-left hover:border-line-2 transition-colors group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="text-[16px] text-muted flex-1">
          Search 338 words — <span className="text-ink-2">మంచితనం</span>, <span className="text-ink-2">बचपन</span>,{" "}
          <span className="text-ink-2">hopeless</span>, or <span className="mono text-[14px] text-ink-2">manchitanam</span>
        </span>
        <kbd className="mono text-[11px] text-faint border border-line rounded px-1.5 py-0.5 hidden sm:inline">⌘K</kbd>
      </button>
    );
  }
  return (
    <button
      onClick={() => openSearch()}
      className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] text-muted hover:border-line-2 hover:text-ink transition-colors"
      aria-label="Search (Ctrl+K)"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="mono text-[10.5px] text-faint border border-line rounded px-1 hidden sm:inline">⌘K</kbd>
    </button>
  );
}
