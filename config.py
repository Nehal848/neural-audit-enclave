"""
config.py — Central configuration for Hospital AI Ecosystem
All values loaded from .env (or environment). No hardcoded secrets.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR            = Path(__file__).resolve().parent

# PostgreSQL connection string
DATABASE_URL        = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/elvon_db")

# Fallbacks for backwards compatibility (can be removed if no longer accessed directly)
AUDIT_DB_PATH       = os.getenv("AUDIT_DB_PATH", str(BASE_DIR / "enclave_audit_trail.db"))
HOSPITAL_DB_PATH    = os.getenv("HOSPITAL_DB_PATH", str(BASE_DIR / "hospital_ecosystem.db"))
DB_PATH             = AUDIT_DB_PATH  # backward compat for auditor.py

AUTOML_UPLOAD_ROOT  = Path(os.getenv("AUTOML_UPLOAD_ROOT", str(BASE_DIR / "app/storage/uploads")))
AUTOML_MODEL_ROOT   = Path(os.getenv("AUTOML_MODEL_ROOT",  str(BASE_DIR / "app/storage/models")))
CUSTOM_PIPELINES_FILE = BASE_DIR / "app/storage/custom_pipelines.json"
VENDOR_MODELS_PATH  = Path(os.getenv("MOCK_VENDOR_MODELS_PATH",
                                      str(BASE_DIR / "app/storage/mock-data/vendor-models.json")))
SHADOW_LOG_PATH     = Path(os.getenv("SHADOW_MODE_LOG_PATH",
                                      str(BASE_DIR / "app/storage/mock-data/shadow-predictions.json")))

# ── App meta ─────────────────────────────────────────────────────────────────
APP_ENV             = os.getenv("APP_ENV", "demo")
DEMO_MODE           = os.getenv("DEMO_MODE", "true").lower() == "true"
APP_TITLE           = "Hospital AI Ecosystem"
APP_VERSION         = "2.1.0"
APP_DESCRIPTION     = "On-Premise AI Healthcare Platform — Demo Build"

# ── Auth ─────────────────────────────────────────────────────────────────────
JWT_SECRET          = os.getenv("JWT_SECRET", "change-me")
OTP_PROVIDER        = os.getenv("OTP_PROVIDER", "console")

# ── Vendor / Phase 1 ─────────────────────────────────────────────────────────
VENDOR_SCOPE_GATE_MODE = os.getenv("VENDOR_SCOPE_GATE_MODE", "block")  # block | warn

# ── AutoML / Phase 2 thresholds ──────────────────────────────────────────────
MODEL_PROMOTION_THRESHOLD_ACCURACY = float(
    os.getenv("MODEL_PROMOTION_THRESHOLD_ACCURACY", "0.80")
)
MODEL_PROMOTION_MIN_SAMPLE_SIZE = int(
    os.getenv("MODEL_PROMOTION_MIN_SAMPLE_SIZE", "20")
)
SHADOW_MODE_LOG_RETENTION_DAYS = int(
    os.getenv("SHADOW_MODE_LOG_RETENTION_DAYS", "30")
)
RLHF_REVIEWER_ROLE  = os.getenv("RLHF_REVIEWER_ROLE", "demo_reviewer")

# ── Gemini ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY      = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL        = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_ENABLED      = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
GEMINI_MAX_TOKENS   = int(os.getenv("GEMINI_MAX_TOKENS", "1024"))
LOCAL_FALLBACK_ENABLED = os.getenv("LOCAL_FALLBACK_ENABLED", "false").lower() == "true"
PHI_DETECTION_MODE  = os.getenv("PHI_DETECTION_MODE", "block_and_alert")

# ── HuggingFace ──────────────────────────────────────────────────────────────
HF_TOKEN            = os.getenv("HF_TOKEN", "")
HF_BLOOD_CANCER_TEXT_MODEL = "user1729/BiomedBERT-cancer-bert-classifier-v1.0"
HF_API_URL          = f"https://api-inference.huggingface.co/models/{HF_BLOOD_CANCER_TEXT_MODEL}"
HF_BART_MODEL_URL   = os.getenv("HF_BART_MODEL_URL", "https://api-inference.huggingface.co/models/facebook/bart-large-mnli")

# ── AutoML Profiling & Cleaning Thresholds ───────────────────────────────────
AUTOML_TABULAR_MIN_ROWS        = int(os.getenv("AUTOML_TABULAR_MIN_ROWS", "100"))
AUTOML_TABULAR_MAX_MISSING_PCT = float(os.getenv("AUTOML_TABULAR_MAX_MISSING_PCT", "75.0"))
AUTOML_IMAGE_MIN_CLASSES       = int(os.getenv("AUTOML_IMAGE_MIN_CLASSES", "2"))
AUTOML_IMAGE_MIN_PER_CLASS     = int(os.getenv("AUTOML_IMAGE_MIN_PER_CLASS", "50"))
AUTOML_TEXT_MIN_ROWS           = int(os.getenv("AUTOML_TEXT_MIN_ROWS", "100"))
AUTOML_MAX_MISSING_COL_PCT     = float(os.getenv("AUTOML_MAX_MISSING_COL_PCT", "60.0"))
AUTOML_MIN_QUALITY_SCORE       = float(os.getenv("AUTOML_MIN_QUALITY_SCORE", "0.30"))

# ── Legacy enclave ────────────────────────────────────────────────────────────
ENCLAVE_TOKEN       = os.getenv("SESSION_SECRET", "SecureToken123")
ENCLAVE_TYPE        = "sim"
DEFAULT_LATENCY_MS  = 14.2
MAX_PAYLOAD_SIZE_MB = 25
