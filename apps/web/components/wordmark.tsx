/** The wordmark: "suffeffix" with each "ff" joined by a continuous crossbar, echoing the symbol.
 *  Live text (crisp at any size, follows the theme). Decorative: pair it with an accessible name. */
export function Wordmark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`wordmark ${className}`} style={{ fontSize: size }} aria-hidden="true">
      suf<span className="ff">ff</span>e<span className="ff">ff</span>ix
    </span>
  );
}
