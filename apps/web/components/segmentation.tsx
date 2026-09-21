import Link from "next/link";

export interface Piece {
  text: string;
  translit?: string;
  role: "stem" | "affix";
  label?: string;
  href?: string;
}

/** A word laid out as an apparatus: the pieces on a baseline, separated by
 *  the cinnabar cut, each piece labelled beneath in small caps. This is the
 *  site's signature object — it appears in the hero and on every entry. */
export function Segmentation({ pieces, size = "md" }: { pieces: Piece[]; size?: "md" | "lg" }) {
  const type = size === "lg" ? "text-[34px] sm:text-[44px]" : "text-[24px]";
  const tr = size === "lg" ? "text-[13px]" : "text-[11px]";

  return (
    <div className="flex flex-wrap items-stretch gap-x-0 gap-y-4">
      {pieces.map((p, i) => (
        <div key={i} className="flex items-stretch">
          {i > 0 && (
            <span
              className="w-px self-stretch mx-4 sm:mx-5"
              style={{ background: "var(--accent)", opacity: 0.6 }}
              aria-hidden="true"
            />
          )}
          <div className="flex flex-col justify-end">
            <span className={`${type} leading-none font-serif`} style={{ fontWeight: p.role === "stem" ? 400 : 600 }}>
              {p.href ? (
                <Link href={p.href} className="hover:text-accent transition-colors">
                  {p.text}
                </Link>
              ) : (
                p.text
              )}
            </span>
            <span className="mt-2.5 flex flex-col gap-0.5">
              {p.translit && p.translit !== p.text && (
                <span className={`font-mono ${tr} text-muted`}>{p.translit}</span>
              )}
              {p.label && <span className="label">{p.label}</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
