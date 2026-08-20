import json
import math
import uuid
from datetime import datetime, timezone
from config import AUTOML_UPLOAD_ROOT, AUTOML_MODEL_ROOT
from core.database import SessionLocal, AutomlJob
from sqlalchemy.exc import IntegrityError

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
    CLINICAL_GOVERNANCE  = "CLINICAL_GOVERNANCE"
    IN_RLHF              = "IN_RLHF"
    REGULATORY_REVIEW    = "REGULATORY_REVIEW"
    REJECTED_CLINICAL    = "REJECTED_CLINICAL"
    REJECTED_REGULATORY  = "REJECTED_REGULATORY"


def init_table():
    # Handled by core.database.init_db() now
    pass


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

def _row_to_dict(row: AutomlJob) -> dict:
    d = {c.name: getattr(row, c.name) for c in row.__table__.columns}
    for field in ("config", "profile", "metrics", "report"):
        if d.get(field):
            try: d[field] = json.loads(d[field])
            except: pass
    if d.get("logs"):
        try: d["logs"] = json.loads(d["logs"])
        except: d["logs"] = []
    else:
        d["logs"] = []
    return _sanitize_floats(d)

# ── CRUD helpers ─────────────────────────────────────────────────────────────

def create_job(hospital_id: int, disease_name: str, data_type: str, file_path: str) -> str:
    job_id = str(uuid.uuid4())
    now = _now()
    db = SessionLocal()
    try:
        new_job = AutomlJob(
            id=job_id, hospital_id=hospital_id, disease_name=disease_name,
            data_type=data_type, status=JobStatus.UPLOADED, step=1,
            file_path=file_path, logs="[]", created_at=now, updated_at=now
        )
        db.add(new_job)
        db.commit()
    finally:
        db.close()
    
    AUTOML_UPLOAD_ROOT.joinpath(job_id).mkdir(parents=True, exist_ok=True)
    AUTOML_MODEL_ROOT.joinpath(job_id).mkdir(parents=True, exist_ok=True)
    return job_id

def get_job(job_id: str) -> dict | None:
    db = SessionLocal()
    try:
        job = db.query(AutomlJob).filter(AutomlJob.id == job_id).first()
        return _row_to_dict(job) if job else None
    finally:
        db.close()

def list_jobs(hospital_id: int) -> list[dict]:
    db = SessionLocal()
    try:
        jobs = db.query(AutomlJob).filter(AutomlJob.hospital_id == hospital_id).order_by(AutomlJob.created_at.desc()).all()
        return [_row_to_dict(j) for j in jobs]
    finally:
        db.close()

def update_status(job_id: str, status: str, step: int | None = None, **kwargs):
    fields = {"status": status, "updated_at": _now()}
    if step is not None:
        fields["step"] = step
    fields.update(kwargs)

    for k, v in fields.items():
        if isinstance(v, (dict, list)):
            fields[k] = json.dumps(_sanitize_floats(v))
        elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            fields[k] = None

    db = SessionLocal()
    try:
        job = db.query(AutomlJob).filter(AutomlJob.id == job_id).first()
        if job:
            for k, v in fields.items():
                setattr(job, k, v)
            db.commit()
    finally:
        db.close()

def append_log(job_id: str, line: str):
    db = SessionLocal()
    try:
        job = db.query(AutomlJob).filter(AutomlJob.id == job_id).first()
        if job:
            logs = json.loads(job.logs) if job.logs else []
            logs.append(line)
            job.logs = json.dumps(logs)
            job.updated_at = _now()
            db.commit()
    finally:
        db.close()

def set_config(job_id: str, target_col: str, phi_cols: list[str]):
    cfg = json.dumps({"target_col": target_col, "phi_cols": phi_cols})
    db = SessionLocal()
    try:
        job = db.query(AutomlJob).filter(AutomlJob.id == job_id).first()
        if job:
            job.config = cfg
            job.status = JobStatus.CLEANING
            job.step = 4
            job.updated_at = _now()
            db.commit()
    finally:
        db.close()

def set_quality_score(job_id: str, score: float) -> None:
    update_status(job_id, JobStatus.AWAITING_APPROVAL, step=5, quality_score=score)

def set_metrics(job_id: str, metrics: dict) -> None:
    update_status(job_id, JobStatus.EXPLAINING, step=8, metrics=metrics)

def set_report(job_id: str, report: dict) -> None:
    update_status(job_id, JobStatus.REPORT_READY, step=9, report=report)
