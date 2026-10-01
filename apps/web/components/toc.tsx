"use client";

import { useEffect, useState } from "react";

export function Toc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="text-[13.5px]">
      <p className="kicker mb-4">On this page</p>
      <ol className="space-y-0.5 border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className="block -ml-px border-l-2 py-1.5 pl-4 transition-colors"
              style={active === i.id ? { borderColor: "var(--ink)", color: "var(--ink)", fontWeight: 600 } : { borderColor: "transparent", color: "var(--muted)" }}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
