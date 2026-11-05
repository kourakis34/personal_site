"""Simple in-memory, per-visitor rate limiting for the chat endpoint.

Good enough for one Render instance; counts reset when the service restarts.
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from app.config import settings

_hits: dict[str, deque] = defaultdict(deque)
_DAY = 24 * 60 * 60


def client_ip(request: Request) -> str:
    # Render sits behind a proxy; the first X-Forwarded-For entry is the visitor.
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def check_rate_limit(request: Request) -> None:
    now = time.time()
    hits = _hits[client_ip(request)]
    while hits and now - hits[0] > _DAY:
        hits.popleft()

    last_minute = sum(1 for t in hits if now - t < 60)
    if last_minute >= settings.rate_limit_per_minute:
        raise HTTPException(status_code=429, detail="You're sending messages quickly. Please wait a minute and try again.")
    if len(hits) >= settings.rate_limit_per_day:
        raise HTTPException(status_code=429, detail="You've reached today's chat limit. Feel free to email Nick instead.")

    hits.append(now)

    # Keep memory bounded if many visitors show up.
    if len(_hits) > 10_000:
        for ip in [ip for ip, q in _hits.items() if not q or now - q[-1] > _DAY]:
            del _hits[ip]
