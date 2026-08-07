"""
core/automl/profiler.py
Step 2 — Dataset profiling and auto-rejection.
Runs in a background thread. Writes results back to the job record.
"""
import json
import zipfile
import threading
from pathlib import Path

import pandas as pd
from PIL import Image as PILImage

from core.automl import job_manager as jm
from core.automl.job_manager import JobStatus
import config

# ─── Thresholds ──────────────────────────────────────────────────────────────
TABULAR_MIN_ROWS         = config.AUTOML_TABULAR_MIN_ROWS
TABULAR_MAX_MISSING_PCT  = config.AUTOML_TABULAR_MAX_MISSING_PCT
IMAGE_MIN_CLASSES        = config.AUTOML_IMAGE_MIN_CLASSES
IMAGE_MIN_PER_CLASS      = config.AUTOML_IMAGE_MIN_PER_CLASS
TEXT_MIN_ROWS            = config.AUTOML_TEXT_MIN_ROWS


def profile_async(job_id: str):
    """Entry point — runs in a daemon thread."""
    t = threading.Thread(target=_run, args=(job_id,), daemon=True)
    t.start()


def _run(job_id: str):
    job = jm.get_job(job_id)
    if not job:
        return

    jm.update_status(job_id, JobStatus.PROFILING, step=2)
    jm.append_log(job_id, "[PROFILING] Starting dataset validation...")

    file_path = Path(job["file_path"])
    data_type = job["data_type"]   # 'tabular' | 'image' | 'text'

    try:
        if data_type == "tabular":
            profile = _profile_tabular(job_id, file_path)
        elif data_type == "image":
            profile = _profile_image(job_id, file_path)
        elif data_type == "text":
            profile = _profile_text(job_id, file_path)
        else:
            raise ValueError(f"Unknown data_type: {data_type}")

        jm.append_log(job_id, "[PROFILING] Validation passed. Ready for configuration.")
        jm.update_status(
            job_id, JobStatus.AWAITING_CONFIG, step=3,
            profile=json.dumps(profile)
        )

    except _RejectionError as e:
        reason = str(e)
        jm.append_log(job_id, f"[REJECTED] {reason}")
        jm.update_status(job_id, JobStatus.REJECTED, error=reason)

    except Exception as e:
        jm.append_log(job_id, f"[ERROR] Profiling failed: {e}")
        jm.update_status(job_id, JobStatus.FAILED, error=str(e))


# ─── Tabular profiling ────────────────────────────────────────────────────────

def _profile_tabular(job_id: str, path: Path) -> dict:
    jm.append_log(job_id, f"[PROFILING] Reading CSV: {path.name}")
    df = pd.read_csv(path, low_memory=False)

    n_rows, n_cols = df.shape
    jm.append_log(job_id, f"[PROFILING] Rows: {n_rows}, Columns: {n_cols}")

    # Volume check
    if n_rows < TABULAR_MIN_ROWS:
        raise _RejectionError(
            f"Dataset has only {n_rows} rows. Minimum required is {TABULAR_MIN_ROWS}."
        )

    # Missing values check
    total_cells   = n_rows * n_cols
    total_missing = int(df.isnull().sum().sum())
    overall_pct   = round(total_missing / max(total_cells, 1) * 100, 2)
    jm.append_log(job_id, f"[PROFILING] Overall missing: {overall_pct}%")

    if overall_pct > TABULAR_MAX_MISSING_PCT:
        raise _RejectionError(
            f"Dataset has {overall_pct}% missing values (threshold: {TABULAR_MAX_MISSING_PCT}%)."
        )

    # Per-column stats
    col_stats = []
    for col in df.columns:
        missing_pct = round(df[col].isnull().mean() * 100, 2)
        n_unique    = int(df[col].nunique())
        dtype       = str(df[col].dtype)
        col_stats.append({
            "name": col,
            "dtype": dtype,
            "missing_pct": missing_pct,
            "unique_count": n_unique,
        })

    # Candidate target columns: low cardinality (≤20 unique) or binary
    candidate_targets = [
        c["name"] for c in col_stats
        if c["unique_count"] <= 20 or c["unique_count"] == 2
    ]

    jm.append_log(job_id, f"[PROFILING] Candidate target columns: {candidate_targets[:10]}")

    return {
        "data_type": "tabular",
        "n_rows": n_rows,
        "n_cols": n_cols,
        "overall_missing_pct": overall_pct,
        "duplicate_rows": int(df.duplicated().sum()),
        "columns": col_stats,
        "candidate_targets": candidate_targets[:20],
    }


# ─── Image profiling ──────────────────────────────────────────────────────────

def _profile_image(job_id: str, zip_path: Path) -> dict:
    extract_dir = zip_path.parent / "images"
    jm.append_log(job_id, f"[PROFILING] Extracting ZIP: {zip_path.name}")

    if not zipfile.is_zipfile(zip_path):
        raise _RejectionError("Uploaded file is not a valid ZIP archive.")

    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_dir)

    # Find class subdirectories (top-level folders in the extracted tree)
    image_exts = {".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff"}
    class_counts: dict[str, int] = {}

    for subdir in sorted(extract_dir.rglob("*")):
        if subdir.is_dir():
            imgs = [f for f in subdir.iterdir()
                    if f.suffix.lower() in image_exts]
            if imgs:
                class_name = subdir.relative_to(extract_dir).parts[0]
                class_counts[class_name] = class_counts.get(class_name, 0) + len(imgs)

    if not class_counts:
        raise _RejectionError(
            "No class subdirectories found in ZIP. "
            "Organise images into folders: images/class_a/, images/class_b/, etc."
        )

    jm.append_log(job_id, f"[PROFILING] Classes found: {list(class_counts.keys())}")

    if len(class_counts) < IMAGE_MIN_CLASSES:
        raise _RejectionError(
            f"Only {len(class_counts)} class(es) found. "
            f"Minimum required: {IMAGE_MIN_CLASSES}."
        )

    for cls, cnt in class_counts.items():
        jm.append_log(job_id, f"[PROFILING]   {cls}: {cnt} images")
        if cnt < IMAGE_MIN_PER_CLASS:
            raise _RejectionError(
                f"Class '{cls}' has only {cnt} images. "
                f"Minimum per class: {IMAGE_MIN_PER_CLASS}."
            )

    # Sample one image to check dimensions
    sample_sizes: list[tuple] = []
    for cls in list(class_counts.keys())[:2]:
        cls_dir = extract_dir / cls
        sample_files = [
            f for f in cls_dir.iterdir()
            if f.suffix.lower() in image_exts
        ][:3]
        for sf in sample_files:
            try:
                with PILImage.open(sf) as img:
                    sample_sizes.append(img.size)
            except Exception:
                pass

    return {
        "data_type": "image",
        "class_counts": class_counts,
        "total_images": sum(class_counts.values()),
        "n_classes": len(class_counts),
        "classes": list(class_counts.keys()),
        "sample_dimensions": sample_sizes[:3],
        "extract_dir": str(extract_dir),
    }


# ─── Text profiling ───────────────────────────────────────────────────────────

def _profile_text(job_id: str, path: Path) -> dict:
    jm.append_log(job_id, f"[PROFILING] Reading text CSV: {path.name}")
    df = pd.read_csv(path, low_memory=False)

    n_rows = len(df)
    if n_rows < TEXT_MIN_ROWS:
        raise _RejectionError(
            f"Text dataset has only {n_rows} rows. Minimum required: {TEXT_MIN_ROWS}."
        )

    # Detect text column: the column with the highest mean string length
    text_cols = [
        col for col in df.columns
        if df[col].dtype == object
    ]
    text_col_candidate = None
    if text_cols:
        text_col_candidate = max(
            text_cols,
            key=lambda c: df[c].dropna().astype(str).str.len().mean()
        )

    overall_missing = round(df.isnull().mean().mean() * 100, 2)
    if overall_missing > TABULAR_MAX_MISSING_PCT:
        raise _RejectionError(
            f"Dataset has {overall_missing}% missing values (threshold: {TABULAR_MAX_MISSING_PCT}%)."
        )

    col_stats = [
        {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing_pct": round(df[col].isnull().mean() * 100, 2),
            "unique_count": int(df[col].nunique()),
        }
        for col in df.columns
    ]

    candidate_targets = [
        c["name"] for c in col_stats
        if c["unique_count"] <= 20 and c["name"] != text_col_candidate
    ]

    jm.append_log(job_id, f"[PROFILING] Detected text column: {text_col_candidate}")

    return {
        "data_type": "text",
        "n_rows": n_rows,
        "n_cols": len(df.columns),
        "overall_missing_pct": overall_missing,
        "text_column_candidate": text_col_candidate,
        "columns": col_stats,
        "candidate_targets": candidate_targets[:20],
    }


# ─── Internal ────────────────────────────────────────────────────────────────

class _RejectionError(Exception):
    """Raised when a dataset fails validation and the job should be REJECTED."""
    pass
