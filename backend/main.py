import os
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

sys.path.insert(0, str(Path(__file__).parent))

from models import AllParams
from calculator import calc_full_hm
from optimizer import reset_to_defaults, optimize_zyklen, optimize_fixverguetung

app = FastAPI(title="PV-Park Finanzrechner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


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
def optimize_reset():
    return AllParams().model_dump()


@app.post("/api/optimize/zyklen")
def optimize_zyklen_endpoint(params: AllParams):
    optimized = optimize_zyklen(params)
    return optimized.model_dump()


@app.post("/api/optimize/fixverguetung")
def optimize_fixverguetung_endpoint(params: AllParams):
    optimized = optimize_fixverguetung(params)
    return optimized.model_dump()


# Serve React build in production
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
