// Static JSON index of concepts, affixes and atoms for the command palette.
// Entries live in public/search-index.json (normalized by the Python exporter).

import { data, slug } from "@/lib/data";
import { LANG_NAME, normalize } from "@/lib/lang";

export const dynamic = "force-static";

export async function GET() {
  const [concepts, affixes, atoms] = await Promise.all([data.concepts(), data.affixes(), data.atoms()]);
  const fnLabel = new Map((await data.functions()).map((f) => [f.id, f.label]));

  const items = [
    ...concepts.map((c) => {
      const forms = (["en", "hi", "te"] as const).flatMap((l) => c.lanes[l].map((e) => e.form));
      return {
        type: "concept" as const,
        href: slug.conceptHref(c.id),
        title: c.gloss,
        sub: forms.join(" · "),
        keys: [normalize(c.gloss), ...forms.map(normalize)],
      };
    }),
    ...affixes.map((a) => ({
      type: "affix" as const,
      href: slug.affixHref(a.id),
      title: a.form,
      sub: `${LANG_NAME[a.lang]} · ${a.functions.map((f) => fnLabel.get(f) ?? f).join(", ")}`,
      keys: [normalize(a.form), normalize(a.translit), ...a.functions.map((f) => normalize(fnLabel.get(f) ?? ""))],
    })),
    ...atoms.map((a) => ({
      type: "atom" as const,
      href: slug.atomHref(a.id),
      title: a.id.replace("atom:", ""),
      sub: `${a.exponents.en} · ${a.exponents.hi} · ${a.exponents.te}`,
      keys: [normalize(a.id.replace("atom:", "")), normalize(a.exponents.en), normalize(a.exponents.hi), normalize(a.exponents.te)],
    })),
  ];
  return Response.json(items);
}
