// Lane order is a claim, not a convenience: the two Indo-European languages
// sit together and Dravidian Telugu sits across the family gutter.

export type LangCode = "en" | "hi" | "te";
export type FamilyKey = "ie" | "dr";

export const LANES: { code: LangCode; name: string; family: FamilyKey; familyName: string }[] = [
  { code: "en", name: "English", family: "ie", familyName: "Indo-European · Germanic" },
  { code: "hi", name: "Hindi", family: "ie", familyName: "Indo-European · Indo-Aryan" },
  { code: "te", name: "Telugu", family: "dr", familyName: "Dravidian · South-Central" },
];

export const LANG_NAME: Record<string, string> = { en: "English", hi: "Hindi", te: "Telugu" };
export const LANG_FAMILY: Record<string, FamilyKey> = { en: "ie", hi: "ie", te: "dr" };

export const REGISTER_NAME: Record<string, string> = {
  N: "native", S: "Sanskritic", P: "Perso-Arabic", E: "learned", mixed: "mixed",
};

const TRANSLIT: Record<string, string> = {
  "ā": "a", "ī": "i", "ū": "u", "ē": "e", "ō": "o", "ṁ": "m", "ṃ": "m",
  "ñ": "n", "ṅ": "n", "ṇ": "n", "ṭ": "t", "ḍ": "d", "ś": "s", "ṣ": "s",
  "ṛ": "r", "ḷ": "l", "ḻ": "l",
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
