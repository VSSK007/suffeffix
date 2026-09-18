from suffeffix_core.schema import EtymNode, EtymologyEdge, Provenance
from suffeffix_core.validate import validate_dataset


def _edge(etype, fam1, fam2, refs=("oed",), conf=0.5):
    return EtymologyEdge(
        id="edge:test-x",
        **{"from": EtymNode(node_ref=None, lang_or_family="X", family=fam1, form="a")},
        to=EtymNode(node_ref=None, lang_or_family="Y", family=fam2, form="b"),
        type=etype, drift=["NONE"], source_ref=list(refs), confidence=conf,
        status="accepted",
        provenance=Provenance(annotator="t", date="2026-09-17"),
    )


def test_dataset_is_valid(dataset):
    report = validate_dataset(dataset)
    assert report.ok, report.errors


def test_counts_within_limits(dataset):
    assert 300 <= len(dataset.entries) <= 500
    assert 30 <= len(dataset.atoms) <= 50
    assert 20 <= len(dataset.affix_functions) <= 30


def test_family_constraint_rejects_cross_family_cognate(dataset):
    bad = dataset.model_copy(deep=True)
    bad.etymology_edges.append(_edge("COGNATE", "Dravidian:South-Central", "IE:Indo-Aryan"))
    report = validate_dataset(bad)
    assert any("crosses family boundary" in e for e in report.errors)


def test_family_constraint_allows_pie_to_germanic(dataset):
    ok = dataset.model_copy(deep=True)
    ok.etymology_edges.append(_edge("INHERITED", "Reconstructed:PIE", "IE:Germanic"))
    report = validate_dataset(ok)
    assert not any("crosses family boundary" in e for e in report.errors)


def test_wiktionary_only_confidence_cap(dataset):
    bad = dataset.model_copy(deep=True)
    bad.etymology_edges.append(_edge("BORROWED", "IE:Germanic", "IE:Germanic",
                                     refs=("wiktionary",), conf=0.9))
    report = validate_dataset(bad)
    assert any("Wiktionary-only" in e for e in report.errors)


def test_no_prohibited_languages(dataset):
    assert {e.lang for e in dataset.entries} <= {"en", "te", "hi"}


def test_every_edge_has_source(dataset):
    assert all(e.source_ref for e in dataset.etymology_edges)


def test_contested_edges_have_low_confidence(dataset):
    for e in dataset.etymology_edges:
        if e.status == "contested":
            assert e.confidence <= 0.6, e.id
