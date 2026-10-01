"""Search: exact form, transliteration, gloss substring, with script-agnostic
normalization (NFC + lowercase + diacritic stripping for IAST/ISO translits)."""

from __future__ import annotations

import unicodedata

from .index import GraphIndex
from .schema import LexicalEntry

_TRANSLIT_MAP = str.maketrans({
    "ā": "a", "ī": "i", "ū": "u", "ē": "e", "ō": "o",
    "ṁ": "m", "ṃ": "m", "ñ": "n", "ṅ": "n", "ṇ": "n",
    "ṭ": "t", "ḍ": "d", "ś": "s", "ṣ": "s", "ṛ": "r", "ḷ": "l", "ḻ": "l",
    "ṟ": "r", "ṉ": "n",  # Tamil (ISO 15919)
    "ʰ": "h", "’": "", "ʼ": "",
})


def normalize(text: str) -> str:
    t = unicodedata.normalize("NFC", text).strip().lower()
    t = unicodedata.normalize("NFC", t.translate(_TRANSLIT_MAP))
    # strip remaining combining marks from Latin sequences only
    decomposed = unicodedata.normalize("NFD", t)
    out = []
    for ch in decomposed:
        if unicodedata.combining(ch) and out and out[-1].isascii():
            continue
        out.append(ch)
    return unicodedata.normalize("NFC", "".join(out))


def search(index: GraphIndex, q: str, lang: str | None = None) -> list[tuple[LexicalEntry, int]]:
    """Return (entry, score) ranked: exact form 100 > exact translit 90 >
    normalized translit 80 > form prefix 60 > gloss substring 40."""
    qn = normalize(q)
    if not qn:
        return []
    results: list[tuple[LexicalEntry, int]] = []
    for e in index.entries.values():
        if lang and e.lang != lang:
            continue
        form = unicodedata.normalize("NFC", e.lemma.form)
        translit = e.lemma.translit.lower()
        gloss = index.concepts[e.concept_id].gloss.lower() if e.concept_id in index.concepts else ""
        score = 0
        if qn == normalize(form) or q.strip() == form:
            score = 100
        elif qn == translit:
            score = 90
        elif qn == normalize(translit):
            score = 80
        elif normalize(form).startswith(qn) or normalize(translit).startswith(qn):
            score = 60
        elif qn in gloss:
            score = 40
        if score:
            results.append((e, score))
    results.sort(key=lambda t: (-t[1], t[0].id))
    return results
