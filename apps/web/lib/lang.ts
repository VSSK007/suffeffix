// Lane order is a claim, not a convenience: the three Indo-European languages
// sit together and the two Dravidian languages sit across the family gutter.
// T.H.E.F.T. — Telugu, Hindi, English, French, Tamil.

export type LangCode = "en" | "fr" | "hi" | "te" | "ta";
export type FamilyKey = "ie" | "dr";

export type LaneDef = { code: LangCode; name: string; family: FamilyKey; familyName: string };

export const LANES: LaneDef[] = [
  { code: "en", name: "English", family: "ie", familyName: "Indo-European · Germanic" },
  { code: "fr", name: "French", family: "ie", familyName: "Indo-European · Romance" },
  { code: "hi", name: "Hindi", family: "ie", familyName: "Indo-European · Indo-Aryan" },
  { code: "te", name: "Telugu", family: "dr", familyName: "Dravidian · South-Central" },
  { code: "ta", name: "Tamil", family: "dr", familyName: "Dravidian · South" },
];
export const IE_LANES = LANES.filter((l) => l.family === "ie");
export const DR_LANES = LANES.filter((l) => l.family === "dr");
export const LANG_CODES = LANES.map((l) => l.code);

/** HTML lang attribute for a language code; English is the page default. */
export const langAttr = (l: string): string | undefined => (l === "en" ? undefined : l);

export const LANG_NAME: Record<string, string> = Object.fromEntries(LANES.map((l) => [l.code, l.name]));
export const LANG_FAMILY: Record<string, FamilyKey> = Object.fromEntries(LANES.map((l) => [l.code, l.family]));
export const isDravidian = (l: string) => LANG_FAMILY[l] === "dr";
export const chipClass = (l: string) => (isDravidian(l) ? "chip-dr" : "chip-ie");

export const REGISTER_NAME: Record<string, string> = {
  N: "native", S: "Sanskritic", P: "Perso-Arabic", E: "English loan", L: "learned", mixed: "mixed",
};

const TRANSLIT: Record<string, string> = {
  "ā": "a", "ī": "i", "ū": "u", "ē": "e", "ō": "o", "ṁ": "m", "ṃ": "m",
  "ñ": "n", "ṅ": "n", "ṇ": "n", "ṭ": "t", "ḍ": "d", "ś": "s", "ṣ": "s",
  "ṛ": "r", "ḷ": "l", "ḻ": "l", "ṟ": "r", "ṉ": "n",
};

/** Mirrors suffeffix_core.search.normalize: NFC, lowercase, IAST diacritics
 *  folded, combining marks stripped only after Latin letters. */
export function normalize(text: string): string {
  let t = text.normalize("NFC").trim().toLowerCase();
  t = [...t].map((c) => TRANSLIT[c] ?? c).join("");
  let out = "";
  for (const ch of t.normalize("NFD")) {
    if (/\p{M}/u.test(ch) && out.length > 0 && out.charCodeAt(out.length - 1) < 128) continue;
    out += ch;
  }
  return out.normalize("NFC");
}
