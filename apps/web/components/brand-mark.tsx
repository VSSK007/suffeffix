/** The symbol: an "ff" — the pair that appears twice in su·ff·e·ff·ix — sharing one crossbar that changes colour
 *  across a small seam, from the Indo-European blue to the Dravidian amber. A single line that
 *  crosses the family boundary. Stems follow the surrounding text colour; the bar uses the two
 *  family hues, which have light and dark variants. Source files live in /brand. */
export function BrandMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="8">
        <path d="M15 54V28C15 19 19.5 14.5 28 14.5" />
        <path d="M37 54V28C37 19 41.5 14.5 50 14.5" />
      </g>
      <path d="M8 31H29" stroke="var(--ie)" strokeWidth="5.5" />
      <path d="M35 31H56" stroke="var(--dr)" strokeWidth="5.5" />
    </svg>
  );
}
