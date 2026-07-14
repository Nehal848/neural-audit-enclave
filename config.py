import os
from pathlib import Path

# Base directories and files
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = os.getenv("ENCLAVE_DB_PATH", str(BASE_DIR / "enclave_audit_trail.db"))

# Security & Enclave Configuration
ENCLAVE_TOKEN = os.getenv("ENCLAVE_TOKEN", "SecureToken123")
ENCLAVE_TYPE = os.getenv("ENCLAVE_TYPE", "sim")

# Application Metadata
APP_TITLE = "Hospital AI Infrastructure Platform"
APP_VERSION = "2.1.0"
APP_DESCRIPTION = "Secure • Private • On-Premise • Compliant Medical Neural Enclave"

# Inference Defaults
DEFAULT_LATENCY_MS = 14.2
MAX_PAYLOAD_SIZE_MB = 25
