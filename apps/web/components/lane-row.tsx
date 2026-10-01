import { Fragment } from "react";
import { DR_LANES, IE_LANES, type LaneDef } from "@/lib/lang";

/* The lane order every grid shares: the Indo-European lanes, the dashed family
   gutter, then the Dravidian lanes. Children of a .lanes / .lanes-labelled grid. */
export function LaneRow({ render, gutterClass = "" }: { render: (l: LaneDef) => React.ReactNode; gutterClass?: string }) {
  return (
    <>
      {IE_LANES.map((l) => <Fragment key={l.code}>{render(l)}</Fragment>)}
      <div className={`gutter ${gutterClass}`} aria-hidden="true" />
      {DR_LANES.map((l) => <Fragment key={l.code}>{render(l)}</Fragment>)}
    </>
  );
}
