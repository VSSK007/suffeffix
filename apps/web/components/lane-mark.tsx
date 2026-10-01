/** The mark: three lanes — two Indo-European, a gap, one Dravidian. */
export function LaneMark({ size = 18 }: { size?: number }) {
  const h = size;
  return (
    <svg width={h * 1.05} height={h} viewBox="0 0 21 20" aria-hidden="true">
      <rect x="0" y="2" width="4" height="16" rx="1.2" fill="var(--ie)" />
      <rect x="6" y="2" width="4" height="16" rx="1.2" fill="var(--ie)" />
      <rect x="15" y="2" width="4" height="16" rx="1.2" fill="var(--dr)" />
    </svg>
  );
}
