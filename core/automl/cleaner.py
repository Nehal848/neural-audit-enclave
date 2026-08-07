"""
core/automl/cleaner.py
Step 4 — PHI removal, data cleaning, feature engineering, quality scoring.
Optionally calls HuggingFace API for unit standardisation when rule-based
detection is insufficient.
"""
import json
import re
import os
import threading
from pathlib import Path
from typing import Any

import pandas as pd
import numpy as np

from core.automl import job_manager as jm
from core.automl.job_manager import JobStatus
import config

# ─── PHI column name patterns (case-insensitive) ─────────────────────────────
PHI_PATTERNS = re.compile(
    r"\b(name|patient[_\s]?id|ssn|social[_\s]?security|dob|date[_\s]?of[_\s]?birth"
    r"|birth[_\s]?date|phone|mobile|email|address|zip[_\s]?code|postal"
    r"|mrn|nhs|national[_\s]?id|passport|driving[_\s]?license|ip[_\s]?address"
    r"|device[_\s]?id|biometric)\b",
    re.IGNORECASE,
)

# ─── Known unit conversion rules (rule-based) ─────────────────────────────────
# Format: column name pattern → (multiplier to standard unit, standard name)
UNIT_CONVERSIONS: list[tuple[re.Pattern, float, str]] = [
    # Glucose: mg/dL → mmol/L  (divide by 18.018)
    (re.compile(r"glucose", re.I), 1 / 18.018, "glucose_mmol_L"),
    # Cholesterol: mg/dL → mmol/L
    (re.compile(r"cholesterol", re.I), 1 / 38.67, "cholesterol_mmol_L"),
    # HbA1c: % → proportion (if values look like %)
    # (detected by range, not name alone)
    # Weight: lbs → kg
    (re.compile(r"weight[_\s]?(lbs?|pounds?)", re.I), 0.453592, "weight_kg"),
    # Height: inches → cm
    (re.compile(r"height[_\s]?(in|inch)", re.I), 2.54, "height_cm"),
    # Temperature: Fahrenheit → Celsius
    (re.compile(r"temp.*([Ff]|fahrenheit)", re.I), None, "temperature_celsius"),  # handled specially
]

HF_API_URL = config.HF_BART_MODEL_URL
HF_TOKEN   = config.HF_TOKEN

MAX_MISSING_COL = config.AUTOML_MAX_MISSING_COL_PCT


def clean_async(job_id: str):
    t = threading.Thread(target=_run, args=(job_id,), daemon=True)
    t.start()


def _run(job_id: str):
    job = jm.get_job(job_id)
    if not job:
        return

    jm.append_log(job_id, "[CLEANING] Starting data cleaning pipeline...")

    cfg     = job.get("config") or {}
    if isinstance(cfg, str):
        cfg = json.loads(cfg)
    profile = job.get("profile") or {}
    if isinstance(profile, str):
        profile = json.loads(profile)

    target_col = cfg.get("target_col", "")
    phi_cols   = cfg.get("phi_cols", [])
    data_type  = job["data_type"]

    try:
        file_path = Path(job["file_path"])

        if data_type == "tabular":
            quality_score, log = _clean_tabular(job_id, file_path, target_col, phi_cols, profile)
        elif data_type == "image":
            quality_score, log = _clean_image(job_id, file_path, profile)
        elif data_type == "text":
            quality_score, log = _clean_text(job_id, file_path, target_col, phi_cols, profile)
        else:
            raise ValueError(f"Unknown data_type: {data_type}")

        jm.append_log(job_id, f"[CLEANING] Done. Quality score: {quality_score:.1f}%")
        jm.update_status(
            job_id, JobStatus.AWAITING_APPROVAL, step=5,
            quality_score=quality_score,
        )

    except Exception as e:
        jm.append_log(job_id, f"[ERROR] Cleaning failed: {e}")
        jm.update_status(job_id, JobStatus.FAILED, error=str(e))


# ─── Tabular cleaning ─────────────────────────────────────────────────────────

def _clean_tabular(
    job_id: str,
    file_path: Path,
    target_col: str,
    phi_cols: list[str],
    profile: dict,
) -> tuple[float, list[str]]:
    df = pd.read_csv(file_path, low_memory=False)
    log = []

    # 1. Drop user-marked PHI columns
    to_drop = set(phi_cols)
    log.append(f"Dropping user-marked PHI: {list(to_drop)}")
    jm.append_log(job_id, f"[CLEANING] Dropping PHI columns: {list(to_drop)}")

    # 2. Auto-detect PHI from column names
    auto_phi = [c for c in df.columns if PHI_PATTERNS.search(c) and c != target_col]
    to_drop.update(auto_phi)
    if auto_phi:
        jm.append_log(job_id, f"[CLEANING] Auto-detected PHI columns: {auto_phi}")

    # 3. Drop high-missing columns (>60%)
    high_missing = [
        c for c in df.columns
        if df[c].isnull().mean() * 100 > MAX_MISSING_COL and c not in to_drop and c != target_col
    ]
    to_drop.update(high_missing)
    if high_missing:
        jm.append_log(job_id, f"[CLEANING] Dropping high-missing columns: {high_missing}")

    df = df.drop(columns=[c for c in to_drop if c in df.columns], errors="ignore")

    # 4. Unit standardisation (rule-based first, HF API if ambiguous)
    df = _standardise_units(job_id, df, target_col)

    # 5. Impute missing values
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    if target_col in num_cols:
        num_cols.remove(target_col)
    if target_col in cat_cols:
        cat_cols.remove(target_col)

    for col in num_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)

    for col in cat_cols:
        if df[col].isnull().any():
            mode_val = df[col].mode()
            if len(mode_val) > 0:
                df[col] = df[col].fillna(mode_val[0])

    jm.append_log(job_id, "[CLEANING] Imputed missing values (median/mode).")

    # 6. Feature engineering
    df = _feature_engineering(job_id, df)

    # 7. Encode categoricals (excluding target)
    for col in df.select_dtypes(exclude=[np.number]).columns:
        if col == target_col:
            continue
        n_unique = df[col].nunique()
        if n_unique <= 2:
            df[col] = pd.Categorical(df[col]).codes
        elif n_unique <= 15:
            dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
            df = df.drop(columns=[col]).join(dummies)
        else:
            df = df.drop(columns=[col])  # too high cardinality, drop

    jm.append_log(job_id, "[CLEANING] Encoded categorical columns.")

    # 8. Save cleaned CSV
    upload_dir = Path(job_manager_upload_dir(job_id))
    cleaned_path = upload_dir / "cleaned.csv"
    df.to_csv(cleaned_path, index=False)
    jm.append_log(job_id, f"[CLEANING] Saved cleaned data: {cleaned_path.name}")

    # 9. Quality score
    quality_score = _compute_quality_score(df, target_col)
    return quality_score, log


def _standardise_units(job_id: str, df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """Rule-based unit conversion, with optional HF API fallback."""
    for pattern, multiplier, new_name in UNIT_CONVERSIONS:
        matching = [c for c in df.columns if pattern.search(c) and c != target_col]
        for col in matching:
            if not pd.api.types.is_numeric_dtype(df[col]):
                continue
            if multiplier is not None:
                df[new_name] = (df[col] * multiplier).round(4)
                df = df.drop(columns=[col])
                jm.append_log(job_id, f"[CLEANING] Converted '{col}' → '{new_name}'")
            elif "temp" in col.lower():
                # Fahrenheit to Celsius: (F - 32) × 5/9
                if df[col].dropna().max() > 50:  # likely Fahrenheit
                    df["temperature_celsius"] = ((df[col] - 32) * 5 / 9).round(2)
                    df = df.drop(columns=[col])
                    jm.append_log(job_id, f"[CLEANING] Converted temperature F→C")

    # HF-API fallback: ask zero-shot classifier if a column looks like it needs conversion
    if HF_TOKEN:
        _hf_unit_check(job_id, df)

    return df


def _hf_unit_check(job_id: str, df: pd.DataFrame):
    """Use HuggingFace zero-shot BART to flag columns that might need unit conversion."""
    try:
        import httpx
        suspect_cols = [
            c for c in df.select_dtypes(include=[np.number]).columns
            if df[c].dropna().max() > 500  # suspicious large numeric values
        ]
        if not suspect_cols:
            return

        for col in suspect_cols[:5]:  # limit API calls
            prompt = (
                f"Medical dataset column named '{col}' "
                f"with max value {df[col].dropna().max():.1f}. "
                f"Does this column need unit conversion to a standard medical unit?"
            )
            response = httpx.post(
                HF_API_URL,
                headers={"Authorization": f"Bearer {HF_TOKEN}"},
                json={
                    "inputs": prompt,
                    "parameters": {"candidate_labels": ["needs unit conversion", "already in standard units"]},
                },
                timeout=10,
            )
            if response.status_code == 200:
                result = response.json()
                labels = result.get("labels", [])
                scores = result.get("scores", [])
                if labels and labels[0] == "needs unit conversion" and scores[0] > 0.75:
                    jm.append_log(
                        job_id,
                        f"[CLEANING] ⚠ HF API flagged '{col}' as potentially needing unit conversion "
                        f"(confidence {scores[0]:.0%}). Please verify manually.",
                    )
    except Exception:
        pass  # HF API failure is non-fatal


def _feature_engineering(job_id: str, df: pd.DataFrame) -> pd.DataFrame:
    cols_lower = {c.lower(): c for c in df.columns}

    # BMI from weight + height
    w_col = next((cols_lower[k] for k in cols_lower if "weight" in k and "kg" in k), None)
    h_col = next((cols_lower[k] for k in cols_lower if "height" in k and "cm" in k), None)
    if w_col and h_col and "bmi" not in cols_lower:
        df["bmi"] = (df[w_col] / ((df[h_col] / 100) ** 2)).round(2)
        jm.append_log(job_id, "[CLEANING] Engineered 'bmi' from weight + height.")

    # Pulse pressure from systolic + diastolic
    sys_col  = next((cols_lower[k] for k in cols_lower if "systolic" in k), None)
    dias_col = next((cols_lower[k] for k in cols_lower if "diastolic" in k), None)
    if sys_col and dias_col and "pulse_pressure" not in cols_lower:
        df["pulse_pressure"] = (df[sys_col] - df[dias_col]).round(1)
        jm.append_log(job_id, "[CLEANING] Engineered 'pulse_pressure'.")

    # Age bucket
    age_col = next((cols_lower[k] for k in cols_lower if k == "age"), None)
    if age_col and "age_bucket" not in cols_lower:
        df["age_bucket"] = pd.cut(
            df[age_col],
            bins=[0, 17, 35, 60, 200],
            labels=["0-17", "18-35", "36-60", "60+"],
        ).astype(str)
        jm.append_log(job_id, "[CLEANING] Engineered 'age_bucket'.")

    return df


def _compute_quality_score(df: pd.DataFrame, target_col: str) -> float:
    """Returns a quality score 0–100."""
    # Completeness: fraction of non-null values
    completeness = 1.0 - df.isnull().mean().mean()

    # Class balance (only for low-cardinality target)
    balance_score = 1.0
    if target_col and target_col in df.columns:
        counts = df[target_col].value_counts(normalize=True)
        if len(counts) >= 2:
            balance_score = float(counts.min() / counts.max())

    # Feature coverage: fraction of columns with < 5% missing
    coverage = (df.isnull().mean() < 0.05).mean()

    score = (completeness * 0.4 + balance_score * 0.3 + coverage * 0.3) * 100
    return round(score, 2)


def job_manager_upload_dir(job_id: str) -> str:
    return str(jm.UPLOAD_ROOT / job_id)


# ─── Image cleaning ───────────────────────────────────────────────────────────

def _clean_image(job_id: str, file_path: Path, profile: dict) -> tuple[float, list]:
    from PIL import Image as PILImage

    extract_dir = Path(profile.get("extract_dir", str(file_path.parent / "images")))
    classes = profile.get("classes", [])
    image_exts = {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}

    total = 0
    corrupt = 0

    for cls in classes:
        cls_dir = extract_dir / cls
        if not cls_dir.exists():
            continue
        for img_file in cls_dir.iterdir():
            if img_file.suffix.lower() not in image_exts:
                continue
            total += 1
            try:
                with PILImage.open(img_file) as img:
                    img_rgb = img.convert("RGB").resize((224, 224))
                    img_rgb.save(img_file)  # overwrite with cleaned version
            except Exception:
                corrupt += 1
                img_file.unlink(missing_ok=True)
                jm.append_log(job_id, f"[CLEANING] Removed corrupt image: {img_file.name}")

    jm.append_log(job_id, f"[CLEANING] Processed {total} images, removed {corrupt} corrupt.")

    counts = {cls: sum(1 for f in (extract_dir / cls).iterdir()
                       if f.suffix.lower() in image_exts)
              for cls in classes if (extract_dir / cls).exists()}

    corrupt_ratio = corrupt / max(total, 1)
    balance_score = min(counts.values()) / max(max(counts.values()), 1) if counts else 1.0
    quality_score = round((1 - corrupt_ratio) * balance_score * 100, 2)

    return quality_score, []


# ─── Text cleaning ─────────────────────────────────────────────────────────────

def _clean_text(
    job_id: str,
    file_path: Path,
    target_col: str,
    phi_cols: list[str],
    profile: dict,
) -> tuple[float, list]:
    import re as re_mod

    df = pd.read_csv(file_path, low_memory=False)
    text_col = profile.get("text_column_candidate")

    # Drop PHI
    to_drop = set(phi_cols) | set(c for c in df.columns if PHI_PATTERNS.search(c) and c not in (target_col, text_col))
    df = df.drop(columns=[c for c in to_drop if c in df.columns], errors="ignore")

    if text_col and text_col in df.columns:
        jm.append_log(job_id, f"[CLEANING] Cleaning text column: '{text_col}'")
        df[text_col] = (
            df[text_col]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.replace(r"[^\w\s]", " ", regex=True)
            .str.strip()
        )
        # Drop empty text rows
        before = len(df)
        df = df[df[text_col].str.len() > 5]
        jm.append_log(job_id, f"[CLEANING] Removed {before - len(df)} empty text rows.")

    # Quality score
    completeness = 1 - df.isnull().mean().mean()
    balance_score = 1.0
    if target_col and target_col in df.columns:
        counts = df[target_col].value_counts(normalize=True)
        if len(counts) >= 2:
            balance_score = float(counts.min() / counts.max())

    quality_score = round((completeness * 0.5 + balance_score * 0.5) * 100, 2)

    # Save
    cleaned_path = file_path.parent / "cleaned.csv"
    df.to_csv(cleaned_path, index=False)
    jm.append_log(job_id, f"[CLEANING] Saved cleaned text data.")

    return quality_score, []
