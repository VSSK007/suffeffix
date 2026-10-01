"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchTrigger } from "./command-palette";
import { BrandMark } from "./brand-mark";
import { Wordmark } from "./wordmark";
import { ThemeToggle } from "./theme-toggle";

export const NAV: readonly (readonly [string, string])[] = [
  ["/research/", "Research"],
  ["/lexicon/", "Concordance"],
  ["/affixes/", "Affix Atlas"],
  ["/atoms/", "Atoms"],
  ["/data/", "Data"],
  ["/about/", "About"],
];

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const active = (href: string) => path === href || path.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 border-b border-line"
      style={{ background: "color-mix(in srgb, var(--bg) 86%, transparent)", backdropFilter: "saturate(1.4) blur(14px)", WebkitBackdropFilter: "saturate(1.4) blur(14px)" }}
    >
      <div className="container flex items-center gap-6" style={{ height: "var(--header-h)" }}>
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Suffeffix — home">
          <BrandMark size={30} />
          <Wordmark size={25} />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 text-[14.5px]" aria-label="Primary">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className="rounded-full px-3.5 py-2 transition-colors"
              style={active(href) ? { color: "var(--ink)", background: "var(--surface)", fontWeight: 600 } : { color: "var(--muted)" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <SearchTrigger />
          <ThemeToggle />
          <button
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-line"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="lg:hidden fixed inset-x-0 bottom-0 overflow-y-auto"
          style={{ top: "var(--header-h)", background: "var(--bg)" }}
        >
          <ul className="container py-6">
            {NAV.map(([href, label]) => (
              <li key={href} className="border-b border-line">
                <Link
                  href={href}
                  aria-current={active(href) ? "page" : undefined}
                  className="flex items-center justify-between py-5 wide text-[26px] font-semibold"
                >
                  {label}
                  <span aria-hidden="true" className="text-faint text-[20px]">→</span>
                </Link>
              </li>
            ))}
            <li className="pt-6 text-[14px] text-muted">
              <Link href="/docs/" className="underline underline-offset-4">Documentation</Link>
              <span className="mx-3 text-faint">·</span>
              <a href="https://github.com/VSSK007/suffeffix" className="underline underline-offset-4">GitHub</a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
