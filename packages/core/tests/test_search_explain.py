import json
from pathlib import Path

from suffeffix_core.explain import explain
from suffeffix_core.search import normalize, search

GOLDEN = Path(__file__).parent / "golden_explanations.json"

GOLDEN_IDS = [
    "lex:te:mancitanam", "lex:hi:bacpan", "lex:en:hopeless", "lex:hi:cini",
    "lex:en:sugar", "lex:te:pustakam", "lex:hi:kitab", "lex:hi:akelapan",
    "lex:te:ontaritanam", "lex:en:teacher",
]


def test_normalize_strips_diacritics():
    assert normalize("mañcitanaṁ") == "mancitanam"
    assert normalize("Oṇṭaritanaṁ") == "ontaritanam"


def test_search_finds_telugu_by_latin_translit(index):
    results = search(index, "manchitanam") or search(index, "mancitanam")
    assert results and results[0][0].id == "lex:te:mancitanam"


def test_search_finds_native_script(index):
    results = search(index, "बचपन")
    assert results and results[0][0].id == "lex:hi:bacpan"


def test_search_gloss_substring(index):
    results = search(index, "state of being good")
    assert any(e.concept_id == "concept:GOODNESS" for e, _ in results)


def test_search_lang_filter(index):
    assert all(e.lang == "en" for e, _ in search(index, "ness", lang="en"))


def test_explanations_deterministic(index):
    for eid in GOLDEN_IDS:
        a = explain(index, eid).model_dump()
        b = explain(index, eid).model_dump()
        assert a == b


def test_explanations_match_golden(index):
    golden = json.loads(GOLDEN.read_text(encoding="utf-8"))
    for eid in GOLDEN_IDS:
        got = explain(index, eid).model_dump()
        assert got == golden[eid], f"explanation drifted for {eid}"


def test_every_sentence_has_trace(index):
    for eid in GOLDEN_IDS:
        for s in explain(index, eid).sentences:
            assert s.trace, f"untraced sentence in {eid}: {s.text}"


def test_contested_edge_flagged_in_text(index):
    exp = explain(index, "lex:te:kukka")
    assert any("[contested]" in s.text for s in exp.sentences)


def test_search_informal_ch_romanisation(index):
    assert search(index, "manchitanam")[0][0].id == "lex:te:mancitanam"
