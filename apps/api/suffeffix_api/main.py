"""Suffeffix API entrypoint. Routers + wiring only; domain logic lives in
suffeffix_core. Data is loaded and validated once at startup."""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from suffeffix_core.index import GraphIndex
from suffeffix_core.load import load_dataset
from suffeffix_core.validate import validate_dataset

from .problem import problem_response
from .routers import v0
from . import state


@asynccontextmanager
async def lifespan(app: FastAPI):
    ds = load_dataset()
    report = validate_dataset(ds)
    state.index = GraphIndex(ds)
    state.validation_ok = report.ok
    state.validation_errors = len(report.errors)
    state.started_at = datetime.now(timezone.utc).isoformat()
    yield


app = FastAPI(
    title="Suffeffix API",
    version="0.1.0",
    description=("Suffeffix is an explainable lexical knowledge graph that jointly "
                 "represents morphology, semantic decomposition, etymology, and "
                 "affix alignment. Read-only; errors are RFC 7807 problem+json."),
    lifespan=lifespan,
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"], allow_headers=["*"])
app.include_router(v0.router, prefix="/v0")


@app.exception_handler(404)
async def not_found(request: Request, exc) -> JSONResponse:
    return problem_response(404, "Not Found", getattr(exc, "detail", "resource not found"), str(request.url.path))


@app.get("/health")
def health() -> dict:
    idx = state.index
    return {
        "ok": state.validation_ok,
        "validation_errors": state.validation_errors,
        "started_at": state.started_at,
        "counts": {
            "entries": len(idx.entries), "affixes": len(idx.affixes),
            "atoms": len(idx.atoms), "concepts": len(idx.concepts),
            "etymology_edges": len(idx.edges), "sources": len(idx.sources),
        },
    }
