"""Process-wide dataset state, populated by the app lifespan."""

from __future__ import annotations

from suffeffix_core.index import GraphIndex

index: GraphIndex = None  # type: ignore[assignment]
validation_ok: bool = False
validation_errors: int = 0
started_at: str = ""
