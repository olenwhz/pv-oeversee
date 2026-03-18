import json
import os
from datetime import datetime
from pathlib import Path

ACTIVITY_FILE = Path(__file__).parent / "activity_log.json"


def _load() -> list:
    if ACTIVITY_FILE.exists():
        try:
            return json.loads(ACTIVITY_FILE.read_text())
        except Exception:
            return []
    return []


def _save(entries: list) -> None:
    ACTIVITY_FILE.write_text(json.dumps(entries, indent=2))


def log_activity(user: str, action: str, detail: str = "") -> dict:
    entries = _load()
    entry = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "user": user,
        "action": action,
        "detail": detail,
    }
    entries.append(entry)
    # Keep last 500 entries
    if len(entries) > 500:
        entries = entries[-500:]
    _save(entries)
    return entry


def get_recent_activity(limit: int = 100) -> list:
    entries = _load()
    return entries[-limit:]


def get_user_sessions(limit: int = 50) -> list:
    entries = _load()
    # Last login per user
    seen = {}
    for e in reversed(entries):
        if e["action"] == "login" and e["user"] not in seen:
            seen[e["user"]] = e
    return list(seen.values())
