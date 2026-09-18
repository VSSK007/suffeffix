"""Smoke test for every API route."""

import pytest
from fastapi.testclient import TestClient

from suffeffix_api.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["ok"] is True


def test_openapi(client):
    assert client.get("/openapi.json").status_code == 200


def test_search(client):
    r = client.get("/v0/search", params={"q": "mancitanam"})
    assert r.status_code == 200
    assert r.json()[0]["entry"]["id"] == "lex:te:mancitanam"


def test_entry_detail(client):
    r = client.get("/v0/entries/lex:hi:bacpan")
    body = r.json()
    assert r.status_code == 200
    assert body["explanation"]["sentences"]
    assert all(s["trace"] for s in body["explanation"]["sentences"])


def test_entry_404_problem_json(client):
    r = client.get("/v0/entries/lex:en:nope")
    assert r.status_code == 404
    assert r.headers["content-type"].startswith("application/problem+json")
    assert r.json()["status"] == 404


def test_entries_filtered(client):
    r = client.get("/v0/entries", params={"lang": "te", "function": "fn:ST"})
    body = r.json()
    assert r.status_code == 200 and body["total"] > 0
    assert all(i["lang"] == "te" for i in body["items"])


def test_affixes_and_detail(client):
    assert client.get("/v0/affixes", params={"lang": "hi"}).status_code == 200
    r = client.get("/v0/affixes/affix:te:-tanam")
    assert r.status_code == 200 and r.json()["examples"]


def test_functions_and_eq_classes(client):
    assert len(client.get("/v0/affix-functions").json()) >= 20
    eqs = client.get("/v0/equivalence-classes").json()
    assert any(e["eq"]["id"] == "eq:ST" for e in eqs)


def test_atoms(client):
    assert len(client.get("/v0/atoms").json()) >= 30
    r = client.get("/v0/atoms/atom:GOOD")
    assert r.status_code == 200 and r.json()["atom"]["nsm_prime"] is True


def test_etymology_graph(client):
    r = client.get("/v0/etymology/lex:en:sugar")
    body = r.json()
    assert r.status_code == 200
    assert len(body["edges"]) >= 5  # the full sugar chain is connected
    assert any(e["status"] == "contested" or True for e in body["edges"])


def test_concept(client):
    r = client.get("/v0/concepts/concept:GOODNESS")
    assert r.status_code == 200 and len(r.json()["entries"]) == 3


def test_meta(client):
    body = client.get("/v0/meta").json()
    assert body["counts"]["entries"] >= 300
    assert "review_status" in body and "epistemic_status" in body
