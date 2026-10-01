"use client";

import { useEffect, useId, useState } from "react";

/** A numbered figure with a caption and an accessible table twin. The chart is
 *  the default view; "View as table" swaps in the same data as a table, so no
 *  value is reachable only by hover or colour. */
export function Figure({
  n, title, caption, table, children, id, tableOnMobile = false,
}: {
  n: number;
  title: string;
  caption: React.ReactNode;
  table: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  /** Wide diagrams show their table twin first on phones. */
  tableOnMobile?: boolean;
}) {
  const [asTable, setAsTable] = useState(false);
  const uid = useId();
  useEffect(() => {
    if (tableOnMobile && window.matchMedia("(max-width: 640px)").matches) setAsTable(true);
  }, [tableOnMobile]);
  return (
    <figure className="figure" id={id}>
      <div className="figure-card">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 mb-6">
          <h3 className="wide text-[19px] sm:text-[21px] font-semibold leading-snug max-w-[40ch]">
            <span className="mono text-[12px] font-medium text-muted block mb-2 tracking-wide">FIGURE {n}</span>
            {title}
          </h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm no-print"
            aria-pressed={asTable}
            aria-controls={uid}
            onClick={() => setAsTable((v) => !v)}
          >
            {asTable ? "View as chart" : "View as table"}
          </button>
        </div>
        <div id={uid}>
          <div hidden={asTable}>{children}</div>
          <div hidden={!asTable} className="overflow-x-auto">{table}</div>
        </div>
      </div>
      <figcaption className="figure-cap">{caption}</figcaption>
    </figure>
  );
}
