import os
import sys
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

sys.path.insert(0, str(Path(__file__).parent))

from models import AllParams
from calculator import calc_full_hm
from optimizer import reset_to_defaults, optimize_zyklen, optimize_fixverguetung
from auth import log_activity, get_recent_activity, get_user_sessions

app = FastAPI(title="PV-Park Finanzrechner")

_allowed_origin = os.environ.get("ALLOWED_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_allowed_origin] if _allowed_origin != "*" else ["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# In-memory rate limiter for optimize endpoints
_rate_store: dict[str, list[float]] = defaultdict(list)
_RATE_LIMIT = 10       # max requests
_RATE_WINDOW = 60.0    # per 60 seconds


def _check_rate(key: str) -> None:
    now = time.monotonic()
    hits = _rate_store[key]
    _rate_store[key] = [t for t in hits if now - t < _RATE_WINDOW]
    if len(_rate_store[key]) >= _RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Zu viele Anfragen, bitte warten.")
    _rate_store[key].append(now)


@app.exception_handler(Exception)
async def _global_exc(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Interner Serverfehler"})


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/defaults")
def get_defaults():
    return AllParams().model_dump()


@app.post("/api/calculate")
def calculate(params: AllParams):
    hm_keys = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {hm: executor.submit(calc_full_hm, hm, params) for hm in hm_keys}
        results = {hm: futures[hm].result() for hm in hm_keys}
    return results


@app.post("/api/optimize/reset")
def optimize_reset(request: Request):
    _check_rate(request.client.host if request.client else "anon")
    return AllParams().model_dump()


@app.post("/api/optimize/zyklen")
def optimize_zyklen_endpoint(params: AllParams, request: Request):
    _check_rate(request.client.host if request.client else "anon")
    optimized = optimize_zyklen(params)
    return optimized.model_dump()


@app.post("/api/optimize/fixverguetung")
def optimize_fixverguetung_endpoint(params: AllParams, request: Request):
    _check_rate(request.client.host if request.client else "anon")
    optimized = optimize_fixverguetung(params)
    return optimized.model_dump()


@app.post("/api/activity/log")
async def activity_log_endpoint(request: Request):
    body = await request.json()
    user = body.get("user", "unknown")
    action = body.get("action", "")
    detail = body.get("detail", "")
    entry = log_activity(user, action, detail)
    return entry


@app.get("/api/activity/recent")
def activity_recent():
    return get_recent_activity(100)


@app.get("/api/users/sessions")
def user_sessions():
    return get_user_sessions(50)


# Serve React build in production
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
