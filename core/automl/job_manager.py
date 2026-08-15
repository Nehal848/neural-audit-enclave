"""
core/automl/job_manager.py
SQLite-backed job state machine for the real AutoML pipeline.
All paths loaded from config — no hardcoded values.
"""
import sqlite3
import uuid
import json
import math
from datetime import datetime, timezone
from pathlib import Path

import config

DB_PATH     = config.HOSPITAL_DB_PATH
UPLOAD_ROOT = config.AUTOML_UPLOAD_ROOT
MODEL_ROOT  = config.AUTOML_MODEL_ROOT

# ── Status constants ─────────────────────────────────────────────────────────
class JobStatus:
    PENDING              = "PENDING"
    UPLOADED             = "UPLOADED"
    PROFILING            = "PROFILING"
    AWAITING_CONFIG      = "AWAITING_CONFIG"
    REJECTED             = "REJECTED"
    CLEANING             = "CLEANING"
    AWAITING_APPROVAL    = "AWAITING_APPROVAL"   # Step 5: quality check
    TRAINING             = "TRAINING"
    EXPLAINING           = "EXPLAINING"
    REPORT_READY         = "REPORT_READY"
    DEPLOYED             = "DEPLOYED"
    FAILED               = "FAILED"


def _conn():
    c = sqlite3.connect(DB_PATH, timeout=15, check_same_thread=False)
    c.execute("PRAGMA journal_mode=WAL")
    c.row_factory = sqlite3.Row
    return c


def init_table():
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS automl_jobs (
                id                TEXT PRIMARY KEY,
                hospital_id       INTEGER DEFAULT 1,
                disease_name      TEXT,
                data_type         TEXT,       -- 'tabular' | 'image' | 'text'
                status            TEXT,
                step              INTEGER DEFAULT 1,
                file_path         TEXT,
                model_path        TEXT,
                config            TEXT,       -- JSON: {target_col, phi_cols, problem_type}
                profile           TEXT,       -- JSON: stats from profiler
                quality_score     REAL,
                training_progress TEXT,       -- e.g. "Testing 3/5: XGBoost"
                metrics           TEXT,       -- JSON: accuracy, f1, auc, …
                report            TEXT,       -- JSON: SHAP + confusion + explanation
                error             TEXT,
                logs              TEXT,       -- JSON array of log lines
                created_at        TEXT,
                updated_at        TEXT
            )
        """)
        c.commit()


# ── CRUD helpers ─────────────────────────────────────────────────────────────

def create_job(hospital_id: int, disease_name: str, data_type: str, file_path: str) -> str:
    job_id = str(uuid.uuid4())
    now = _now()
    with _conn() as c:
        c.execute("""
            INSERT INTO automl_jobs
              (id, hospital_id, disease_name, data_type, status, step,
               file_path, logs, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, '[]', ?, ?)
        """, (job_id, hospital_id, disease_name, data_type,
              JobStatus.UPLOADED, file_path, now, now))
        c.commit()
    UPLOAD_ROOT.joinpath(job_id).mkdir(parents=True, exist_ok=True)
    MODEL_ROOT.joinpath(job_id).mkdir(parents=True, exist_ok=True)
    return job_id


def get_job(job_id: str) -> dict | None:
    with _conn() as c:
        row = c.execute("SELECT * FROM automl_jobs WHERE id = ?", (job_id,)).fetchone()
        return _row_to_dict(row) if row else None


def list_jobs(hospital_id: int) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM automl_jobs WHERE hospital_id = ? ORDER BY created_at DESC",
            (hospital_id,)
        ).fetchall()
        return [_row_to_dict(r) for r in rows]


def update_status(job_id: str, status: str, step: int | None = None, **kwargs):
    """Update status and any extra fields (profile, quality_score, metrics, etc.)"""
    fields = {"status": status, "updated_at": _now()}
    if step is not None:
        fields["step"] = step
    fields.update(kwargs)

    # Serialise any dict/list values to JSON
    for k, v in fields.items():
        if isinstance(v, (dict, list)):
            fields[k] = json.dumps(_sanitize_floats(v))
        elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            fields[k] = None

    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [job_id]
    with _conn() as c:
        c.execute(f"UPDATE automl_jobs SET {set_clause} WHERE id = ?", values)
        c.commit()


def append_log(job_id: str, line: str):
    """Thread-safe append a single log line to the job's logs JSON array."""
    with _conn() as c:
        row = c.execute("SELECT logs FROM automl_jobs WHERE id = ?", (job_id,)).fetchone()
        if row:
            try:
                logs = json.loads(row["logs"] or "[]")
            except Exception:
                logs = []
            logs.append(line)
            c.execute(
                "UPDATE automl_jobs SET logs = ?, updated_at = ? WHERE id = ?",
                (json.dumps(logs), _now(), job_id)
            )
            c.commit()


def set_config(job_id: str, target_col: str, phi_cols: list[str]):
    cfg = json.dumps({"target_col": target_col, "phi_cols": phi_cols})
    with _conn() as c:
        c.execute(
            "UPDATE automl_jobs SET config = ?, status = ?, step = 4, updated_at = ? WHERE id = ?",
            (cfg, JobStatus.CLEANING, _now(), job_id)
        )
        c.commit()




def set_quality_score(job_id: str, score: float) -> None:
    """Store quality score and move job to AWAITING_APPROVAL."""
    update_status(job_id, JobStatus.AWAITING_APPROVAL, step=5,
                  quality_score=score)


def set_metrics(job_id: str, metrics: dict) -> None:
    """Store training metrics and move job to EXPLAINING."""
    update_status(job_id, JobStatus.EXPLAINING, step=8,
                  metrics=json.dumps(_sanitize_floats(metrics)))


def set_report(job_id: str, report: dict) -> None:
    """Store explainability report and move job to REPORT_READY."""
    update_status(job_id, JobStatus.REPORT_READY, step=9,
                  report=json.dumps(_sanitize_floats(report)))

# ── Helpers ──────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()



def _sanitize_floats(obj):
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif isinstance(obj, dict):
        return {k: _sanitize_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_sanitize_floats(v) for v in obj]
    return obj


def _row_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    # Parse JSON fields back to Python objects for API responses
    for field in ("config", "profile", "metrics", "report"):
        if d.get(field):
            try:
                d[field] = json.loads(d[field])
            except Exception:
                pass
    if d.get("logs"):
        try:
            d["logs"] = json.loads(d["logs"])
        except Exception:
            d["logs"] = []
    return _sanitize_floats(d)
