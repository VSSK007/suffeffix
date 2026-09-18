"""RFC 7807 problem+json helpers."""

from fastapi.responses import JSONResponse


def problem_response(status: int, title: str, detail: str, instance: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        media_type="application/problem+json",
        content={"type": "about:blank", "title": title, "status": status,
                 "detail": detail, "instance": instance},
    )
