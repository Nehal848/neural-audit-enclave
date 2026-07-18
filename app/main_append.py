
# ============================================================
# HOSPITAL AI ECOSYSTEM — Full Endpoints (aligned to docx/detail)
# ============================================================

import random
import os
import httpx

# ─────────────────────────────────────────────
# HuggingFace API config for BiomedBERT model
# ─────────────────────────────────────────────
HF_BLOOD_CANCER_TEXT_MODEL = "user1729/BiomedBERT-cancer-bert-classifier-v1.0"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_BLOOD_CANCER_TEXT_MODEL}"
HF_TOKEN = os.environ.get("HF_TOKEN", "")  # Set via env var for real inference

# ─────────────────────────────────────────────
# In-memory stores (demo — no DB write needed)
# ─────────────────────────────────────────────
otp_store: dict = {}

doctor_registry: list = [
    {
        "full_name": "Dr. Sarah Vance",
        "license_no": "MED-98765-IN",
        "state": "Maharashtra",
        "email": "svance@cityhospital.in",
        "hospital_name": "City General Hospital",
        "phone": "+91-9876543210",
        "password": "doctor"
    }
]

hospital_registry: list = [
    {
        "hospital_name": "City General Hospital",
        "address": "42 Medical Avenue, Mumbai, MH 400001",
        "reg_no": "HOSP-MH-001",
        "admin_name": "Mr. Rajan Mehta",
        "admin_email": "admin@cityhospital.in",
        "email": "admin@cityhospital.in",
        "phone": "+91-9900001234",
        "password": "admin"
    }
]

hospital_doctors_store: list = [
    {"name": "Dr. Sarah Vance", "license": "MED-98765-IN", "status": "Active"},
    {"name": "Dr. Raj Patel", "license": "MED-11223-IN", "status": "Active"},
]

patient_store: list = list(MOCK_PATIENTS)  # reuse existing mock patients

model_feedback_store: list = [
    {
        "model_id": "pneumonia",
        "model_name": "Pneumonia Detection",
        "doctor": "Dr. Sarah Vance",
        "accuracy_observation": "Giving 100% accuracy across all results — excellent performance.",
        "notes": "No false positives in last 30 cases.",
        "timestamp": "2026-07-14 09:30"
    }
]

MARKETPLACE = [
    {
        "id": "pneu_v3",
        "name": "Pneumonia Detection Pro",
        "price": "$1,499",
        "accuracy": 97.2,
        "version": "v3.0",
        "formats": ["Image", "DICOM", "Tabular", "Text"],
        "input_types": ["Chest X-Ray", "CT Scan", "CSV Lab Data"],
        "type": "Classification",
        "description": "Enterprise-grade pneumonia detection with DICOM support and auto-report generation. Trained on 2M+ chest scans across 40 hospital networks."
    },
    {
        "id": "diab_v2",
        "name": "Diabetes Risk Predictor",
        "price": "$1,299",
        "accuracy": 94.5,
        "version": "v2.1",
        "formats": ["Tabular", "Text"],
        "input_types": ["Lab Values", "EHR Notes", "CSV"],
        "type": "Classification",
        "description": "Predicts diabetes onset risk using clinical history, lab markers, and patient demographics. Compliant with HIPAA and GDPR."
    },
    {
        "id": "cance_v4",
        "name": "Multi-Cancer Screener",
        "price": "$2,999",
        "accuracy": 98.1,
        "version": "v4.0",
        "formats": ["Image", "DICOM", "Text"],
        "input_types": ["MRI", "CT Scan", "Pathology Report"],
        "type": "Classification",
        "description": "Screens for multiple cancer types including lung, breast, colon with 98%+ accuracy validated across 12 independent clinical trials."
    },
    {
        "id": "cardio_v1",
        "name": "Cardiac Risk Predictor",
        "price": "$1,199",
        "accuracy": 95.3,
        "version": "v1.0",
        "formats": ["Tabular", "ECG", "Text"],
        "input_types": ["ECG Data", "Lab Results", "Clinical Notes"],
        "type": "Regression",
        "description": "Predicts 12-month cardiac event risk using ECG waveform patterns and clinical biomarkers with interpretable risk scores."
    },
    {
        "id": "tb_v2",
        "name": "Tuberculosis Detector",
        "price": "$899",
        "accuracy": 96.0,
        "version": "v2.0",
        "formats": ["Image", "DICOM", "Tabular"],
        "input_types": ["Chest X-Ray", "CT Scan", "Lab Results"],
        "type": "Classification",
        "description": "High-sensitivity TB detection from chest imaging. Supports WHO-compliant reporting and DICOM integration with PACS systems."
    },
    {
        "id": "brain_v1",
        "name": "Brain Tumor Classifier",
        "price": "$2,499",
        "accuracy": 97.8,
        "version": "v1.5",
        "formats": ["Image", "DICOM"],
        "input_types": ["MRI", "CT Scan"],
        "type": "Classification",
        "description": "Classifies glioma, meningioma, and pituitary tumors from MRI scans with pixel-level attention heatmaps for radiologist review."
    },
]

VERSION_HISTORY = {
    "pneumonia": [
        {"version": "v2.1.0", "date": "2026-06-10", "notes": "Improved DICOM parsing, +1.2% accuracy", "status": "Active"},
        {"version": "v2.0.0", "date": "2026-03-01", "notes": "Added tabular submodel support", "status": "Retired"},
        {"version": "v1.5.0", "date": "2025-11-15", "notes": "Initial release with image submodel", "status": "Retired"},
    ],
    "cancer": [
        {"version": "v2.1.0", "date": "2026-05-20", "notes": "Multi-cancer screening added", "status": "Active"},
        {"version": "v1.0.0", "date": "2025-09-01", "notes": "Lung cancer only initial model", "status": "Retired"},
    ],
    "diabetes": [
        {"version": "v2.1.0", "date": "2026-04-15", "notes": "EHR integration + NLP notes support", "status": "Active"},
    ],
    "tb": [
        {"version": "v2.1.0", "date": "2026-06-01", "notes": "WHO-compliant upgrade", "status": "Active"},
    ],
    "blood_cancer": [
        {"version": "v2.1.0", "date": "2026-07-01", "notes": "Blast cell detection improvement", "status": "Active"},
    ],
    "blood_cancer_text": [
        {"version": "v1.0.0", "date": "2026-07-15", "notes": "BiomedBERT classifier — Cancer vs Non-Cancer text classification (HuggingFace)", "status": "Active"},
    ],
    "brain_tumor": [
        {"version": "v2.1.0", "date": "2026-06-25", "notes": "GradCAM heatmap integration", "status": "Active"},
    ],
}

INTEGRATIONS = [
    {"system": "MRI Machine", "type": "Imaging", "connected_models": ["Brain Tumor Detection", "Cancer Detection"], "status": "Active", "last_sync": "2 min ago", "throughput": "15.2 MB/s", "error_rate": "0.00%"},
    {"system": "CT Scan", "type": "Imaging", "connected_models": ["Pneumonia Detection", "Cancer Detection", "TB Detection"], "status": "Active", "last_sync": "5 min ago", "throughput": "12.4 MB/s", "error_rate": "0.00%"},
    {"system": "X-Ray (PACS)", "type": "Imaging", "connected_models": ["Pneumonia Detection", "TB Detection"], "status": "Active", "last_sync": "3 min ago", "throughput": "8.1 MB/s", "error_rate": "0.02%"},
    {"system": "Blood Lab Analyzer", "type": "Laboratory", "connected_models": ["Diabetes Detection", "Blood Cancer Detection"], "status": "Active", "last_sync": "1 min ago", "throughput": "2.3 MB/s", "error_rate": "0.00%"},
    {"system": "Pathology Lab", "type": "Laboratory", "connected_models": ["Cancer Detection", "Blood Cancer Detection"], "status": "In Use", "last_sync": "8 min ago", "throughput": "4.7 MB/s", "error_rate": "0.01%"},
    {"system": "ECG Monitor", "type": "Cardiology", "connected_models": [], "status": "Disconnected", "last_sync": "2h ago", "throughput": "0 MB/s", "error_rate": "N/A"},
    {"system": "EHR System", "type": "Records", "connected_models": ["Diabetes Detection", "Pneumonia Detection"], "status": "Active", "last_sync": "Just now", "throughput": "1.8 MB/s", "error_rate": "0.00%"},
    {"system": "EMR System", "type": "Records", "connected_models": ["Diabetes Detection"], "status": "Active", "last_sync": "4 min ago", "throughput": "1.2 MB/s", "error_rate": "0.00%"},
    {"system": "CIS (Clinical Info)", "type": "Records", "connected_models": [], "status": "Unconnected", "last_sync": "Never", "throughput": "0 MB/s", "error_rate": "N/A"},
]

LAB_IMAGING_SOURCES = [
    {"source": "MRI", "type": "Imaging", "new_uploads": 8, "status": "Connected", "active": True, "findings": "8 new scans received — 2 flagged for review", "errors": None},
    {"source": "CT Scan", "type": "Imaging", "new_uploads": 9, "status": "Active", "active": True, "findings": "9 new CT studies queued for AI processing", "errors": None},
    {"source": "X-Ray", "type": "Imaging", "new_uploads": 12, "status": "Active", "active": True, "findings": "12 chest X-rays uploaded via PACS bridge", "errors": None},
    {"source": "Blood Report", "type": "Laboratory", "new_uploads": 6, "status": "Connected", "active": True, "findings": "6 new CBC panels — 1 showing elevated WBC", "errors": None},
    {"source": "Pathology Report", "type": "Laboratory", "new_uploads": 3, "status": "Active", "active": True, "findings": "3 biopsy reports awaiting AI classification", "errors": None},
    {"source": "ECG", "type": "Cardiology", "new_uploads": 0, "status": "Disconnected", "active": False, "findings": None, "errors": "Device offline — last heartbeat 2h ago"},
    {"source": "CIS", "type": "Records", "new_uploads": 10, "status": "Active", "active": True, "findings": "10 clinical info records synced", "errors": None},
    {"source": "EMR", "type": "Records", "new_uploads": 5, "status": "Active", "active": True, "findings": "5 EMR entries linked to active patients", "errors": None},
    {"source": "EHR", "type": "Records", "new_uploads": 10, "status": "Connected", "active": True, "findings": "10 EHR updates merged with patient profiles", "errors": None},
]


# ─────────────────────────────────────────────
# OTP
# ─────────────────────────────────────────────
class OTPSendPayload(BaseModel):
    identifier: str   # license_no or reg_no or email
    role: str         # 'doctor' | 'hospital'

@app.post("/api/otp/send")
async def send_otp(p: OTPSendPayload):
    code = str(random.randint(100000, 999999))
    otp_store[p.identifier] = code
    return {"status": "sent", "otp": code, "message": f"OTP sent to registered email for {p.identifier}"}

class OTPVerifyPayload(BaseModel):
    identifier: str
    otp: str

@app.post("/api/otp/verify")
async def verify_otp(p: OTPVerifyPayload):
    stored = otp_store.get(p.identifier)
    if stored and stored == p.otp:
        del otp_store[p.identifier]
        return {"status": "verified"}
    raise HTTPException(status_code=400, detail="Invalid or expired OTP.")


# ─────────────────────────────────────────────
# Doctor Auth
# ─────────────────────────────────────────────
class DoctorSignUpPayload(BaseModel):
    full_name: str
    license_no: str
    state: str
    email: str
    hospital_name: str
    phone: str
    password: str
    confirm_password: str

@app.post("/api/doctor/signup")
async def doctor_signup(p: DoctorSignUpPayload):
    if p.password != p.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    # Check if license already registered
    for d in doctor_registry:
        if d["license_no"] == p.license_no:
            raise HTTPException(status_code=400, detail="License number already registered.")
    doctor_registry.append({
        "full_name": p.full_name,
        "license_no": p.license_no,
        "state": p.state,
        "email": p.email,
        "hospital_name": p.hospital_name,
        "phone": p.phone,
        "password": p.password
    })
    return {"status": "registered", "message": "Doctor account created. OTP will be sent to your email."}

class DoctorLoginPayload(BaseModel):
    license_no: str
    password: str

@app.post("/api/doctor/login")
async def doctor_login(p: DoctorLoginPayload):
    for doc in doctor_registry:
        if doc["license_no"] == p.license_no and doc["password"] == p.password:
            return {
                "status": "success",
                "role": "doctor",
                "full_name": doc["full_name"],
                "hospital_name": doc["hospital_name"],
                "license_no": p.license_no,
                "token": "DoctorToken"
            }
    raise HTTPException(status_code=401, detail="Invalid license number or password. (Demo: MED-98765-IN / doctor)")


# ─────────────────────────────────────────────
# Hospital Auth
# ─────────────────────────────────────────────
class HospitalSignUpPayload(BaseModel):
    hospital_name: str
    address: str
    reg_no: str
    admin_name: str
    admin_email: str
    email: str
    phone: str
    password: str

@app.post("/api/hospital/signup")
async def hospital_signup(p: HospitalSignUpPayload):
    for h in hospital_registry:
        if h["reg_no"] == p.reg_no:
            raise HTTPException(status_code=400, detail="Registration number already exists.")
    hospital_registry.append({
        "hospital_name": p.hospital_name,
        "address": p.address,
        "reg_no": p.reg_no,
        "admin_name": p.admin_name,
        "admin_email": p.admin_email,
        "email": p.email,
        "phone": p.phone,
        "password": p.password
    })
    return {"status": "registered", "message": "Hospital account created. OTP will be sent to your official email."}

class HospitalLoginPayload(BaseModel):
    reg_no: str
    password: str

@app.post("/api/hospital/login")
async def hospital_login(p: HospitalLoginPayload):
    for h in hospital_registry:
        if h["reg_no"] == p.reg_no and h["password"] == p.password:
            return {
                "status": "success",
                "role": "hospital",
                "hospital_name": h["hospital_name"],
                "reg_no": p.reg_no,
                "token": "HospitalToken"
            }
    raise HTTPException(status_code=401, detail="Invalid registration number or password. (Demo: HOSP-MH-001 / admin)")


# ─────────────────────────────────────────────
# Doctor Dashboard
# ─────────────────────────────────────────────
@app.get("/api/doctor/dashboard")
async def get_doctor_dashboard():
    alerts = [
        {"patient_id": "PT-1001", "name": "Arthur Dent", "age": 42, "disease": "Pneumonia", "probability": 94, "severity": "high"},
        {"patient_id": "PT-1005", "name": "Marvin the Android", "age": 42000, "disease": "Brain Tumor", "probability": 98, "severity": "critical"},
        {"patient_id": "PT-1006", "name": "Fenchurch", "age": 28, "disease": "Blood Cancer", "probability": 91, "severity": "high"},
        {"patient_id": "PT-1002", "name": "Tricia McMillan", "age": 35, "disease": "Diabetes", "probability": 78, "severity": "moderate"},
        {"patient_id": "PT-1003", "name": "Ford Prefect", "age": 45, "disease": "Tuberculosis", "probability": 85, "severity": "high"},
        {"patient_id": "PT-1004", "name": "Zaphod Beeblebrox", "age": 110, "disease": "N/A", "probability": 12, "severity": "low"},
    ]
    active_models = [
        {"id": "pneumonia", "name": "Pneumonia Detection", "status": "Active", "accuracy": 96.8, "version": "v2.1.0"},
        {"id": "cancer", "name": "Cancer Detection", "status": "Active", "accuracy": 98.1, "version": "v2.1.0"},
        {"id": "diabetes", "name": "Diabetes Detection", "status": "Active", "accuracy": 94.5, "version": "v2.1.0"},
        {"id": "brain_tumor", "name": "Brain Tumor Detection", "status": "Active", "accuracy": 97.8, "version": "v2.1.0"},
        {"id": "blood_cancer", "name": "Blood Cancer Detection", "status": "Active", "accuracy": 95.0, "version": "v2.1.0"},
        {"id": "blood_cancer_text", "name": "Blood Cancer — Text (BiomedBERT)", "status": "Active", "accuracy": 93.6, "version": "v1.0.0", "source": "HuggingFace"},
        {"id": "tb", "name": "TB Detection", "status": "Active", "accuracy": 96.0, "version": "v2.1.0"},
    ]
    lab_uploads = [
        {"source": "MRI", "count": 8},
        {"source": "CT Scan", "count": 9},
        {"source": "EHR", "count": 10},
        {"source": "ECG", "count": 0},
        {"source": "PACS", "count": 12},
    ]
    ai_performance = {
        "confidence_score": "94.2%",
        "doctor_agreement": "97.1%",
        "avg_analysis_time_ms": 1420
    }
    return {
        "alerts": alerts,
        "active_models": active_models,
        "recent_patients": patient_store[:5],
        "lab_uploads": lab_uploads,
        "ai_performance": ai_performance
    }


# ─────────────────────────────────────────────
# Hospital Dashboard
# ─────────────────────────────────────────────
@app.get("/api/hospital/dashboard")
async def get_hospital_dashboard():
    return {
        "active_models": [
            {"id": "pneumonia", "name": "Pneumonia Detection", "ownership": "Ours", "accuracy": 96.8, "version": "v2.1.0", "status": "Active"},
            {"id": "cancer", "name": "Cancer Detection", "ownership": "Ours", "accuracy": 98.1, "version": "v2.1.0", "status": "Active"},
            {"id": "diabetes", "name": "Diabetes Detection", "ownership": "Ours", "accuracy": 94.5, "version": "v2.1.0", "status": "Active"},
        ],
        "training_models": [
            {"name": "Cardiac Arrest Predictor", "progress": 72, "stage": "Feature Engineering", "eta": "~18 min"},
            {"name": "Retinal Disease Screener", "progress": 34, "stage": "Data Cleaning", "eta": "~45 min"},
        ],
        "recent_feedback": model_feedback_store,
        "lab_status": [
            {"system": "MRI", "status": "Active", "last_sync": "2 min ago"},
            {"system": "CT Scan", "status": "Active", "last_sync": "5 min ago"},
            {"system": "PACS/X-Ray", "status": "Active", "last_sync": "3 min ago"},
            {"system": "Blood Lab", "status": "Active", "last_sync": "1 min ago"},
            {"system": "ECG", "status": "Disconnected", "last_sync": "2h ago"},
        ]
    }


# ─────────────────────────────────────────────
# Patient Management
# ─────────────────────────────────────────────
@app.get("/api/patients")
async def get_patients_list():
    return patient_store

@app.get("/api/patients/{patient_id}")
async def get_patient(patient_id: str):
    for p in patient_store:
        if p["id"] == patient_id:
            return p
    raise HTTPException(status_code=404, detail="Patient not found.")

class AddPatientPayload(BaseModel):
    name: str
    age: int
    symptoms: Optional[str] = ""
    email: Optional[str] = ""

@app.post("/api/patients")
async def add_patient(p: AddPatientPayload):
    new_id = f"PT-{1007 + len(patient_store)}"
    new_patient = {
        "id": new_id,
        "name": p.name,
        "age": p.age,
        "symptoms": p.symptoms,
        "has_imaging": False,
        "has_lab": False,
        "has_notes": bool(p.symptoms),
        "reports": {"imaging_name": "N/A", "lab_name": "N/A", "notes_name": "clinical_notes.txt"},
        "reports_content": {
            "imaging": "",
            "lab": "",
            "clinical_notes": p.symptoms
        }
    }
    patient_store.append(new_patient)
    return {"status": "added", "patient": new_patient}


# ─────────────────────────────────────────────
# Doctor — Laboratory & Imaging
# ─────────────────────────────────────────────
@app.get("/api/doctor/lab-imaging")
async def get_lab_imaging_status():
    return LAB_IMAGING_SOURCES


# ─────────────────────────────────────────────
# Models — Feedback & My Models
# ─────────────────────────────────────────────
class ModelFeedbackPayload(BaseModel):
    model_id: str
    model_name: str
    accuracy_observation: str
    notes: Optional[str] = ""
    doctor_name: Optional[str] = "Dr. Unknown"

@app.post("/api/models/feedback")
async def submit_model_feedback(p: ModelFeedbackPayload):
    from datetime import datetime
    model_feedback_store.append({
        "model_id": p.model_id,
        "model_name": p.model_name,
        "doctor": p.doctor_name,
        "accuracy_observation": p.accuracy_observation,
        "notes": p.notes,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
    })
    return {"status": "received", "model_id": p.model_id}

@app.get("/api/models/feedback")
async def get_model_feedback():
    return model_feedback_store

@app.get("/api/models/my-models")
async def get_my_models():
    prebuilt = [
        {"id": "pneumonia", "name": "Pneumonia Detection", "type": "Classification", "accuracy": 96.8, "version": "v2.1.0", "status": "Active", "ownership": "Ours", "feedback_count": 3},
        {"id": "cancer", "name": "Cancer Detection", "type": "Classification", "accuracy": 98.1, "version": "v2.1.0", "status": "Active", "ownership": "Ours", "feedback_count": 1},
        {"id": "diabetes", "name": "Diabetes Detection", "type": "Classification", "accuracy": 94.5, "version": "v2.1.0", "status": "Active", "ownership": "Ours", "feedback_count": 2},
        {"id": "tb", "name": "TB Detection", "type": "Classification", "accuracy": 96.0, "version": "v2.1.0", "status": "Active", "ownership": "Ours", "feedback_count": 0},
        {"id": "blood_cancer", "name": "Blood Cancer Detection", "type": "Classification", "accuracy": 95.0, "version": "v2.1.0", "status": "Active", "ownership": "Ours", "feedback_count": 0},
        {"id": "blood_cancer_text", "name": "Blood Cancer — Text (BiomedBERT)", "type": "Text Classification", "accuracy": 93.6, "version": "v1.0.0", "status": "Active", "ownership": "Ours", "feedback_count": 0, "source": "HuggingFace", "hf_model": HF_BLOOD_CANCER_TEXT_MODEL},
        {"id": "brain_tumor", "name": "Brain Tumor Detection", "type": "Classification", "accuracy": 97.8, "version": "v2.1.0", "status": "Active", "ownership": "Ours", "feedback_count": 1},
    ]
    custom = []
    if CUSTOM_PIPELINES_FILE.exists():
        try:
            data = json.loads(CUSTOM_PIPELINES_FILE.read_text(encoding="utf-8"))
            custom = [
                {"id": c["id"], "name": c["name"], "type": "Custom AutoML",
                 "accuracy": 95.0, "version": "v1.0.0-ONNX", "status": "Active",
                 "ownership": "Theirs", "feedback_count": 0}
                for c in data
            ]
        except Exception:
            pass
    return prebuilt + custom


# ─────────────────────────────────────────────
# Marketplace
# ─────────────────────────────────────────────
@app.get("/api/marketplace")
async def get_marketplace():
    return MARKETPLACE

class PurchasePayload(BaseModel):
    model_id: str
    model_name: str
    price: str

@app.post("/api/marketplace/purchase")
async def purchase_model(p: PurchasePayload):
    return {
        "status": "purchased",
        "model_id": p.model_id,
        "model_name": p.model_name,
        "ownership": "Ours",
        "message": f"License for {p.model_name} ({p.price}) activated. Model added to My Models."
    }


# ─────────────────────────────────────────────
# Version Control
# ─────────────────────────────────────────────
@app.get("/api/hospital/version-control")
async def get_version_control():
    result = []
    for model_id, versions in VERSION_HISTORY.items():
        result.append({
            "model_id": model_id,
            "model_name": model_id.replace("_", " ").title() + " Detection",
            "versions": versions,
            "active_version": next((v["version"] for v in versions if v["status"] == "Active"), "N/A")
        })
    # Also add any custom pipelines
    if CUSTOM_PIPELINES_FILE.exists():
        try:
            data = json.loads(CUSTOM_PIPELINES_FILE.read_text(encoding="utf-8"))
            for c in data:
                result.append({
                    "model_id": c["id"],
                    "model_name": c["name"],
                    "versions": [{"version": "v1.0.0", "date": "2026-07-01", "notes": "Hospital-created via AutoML", "status": "Active"}],
                    "active_version": "v1.0.0"
                })
        except Exception:
            pass
    return result


# ─────────────────────────────────────────────
# Hospital Integrations
# ─────────────────────────────────────────────
@app.get("/api/hospital/integrations")
async def get_hospital_integrations():
    return INTEGRATIONS


# ─────────────────────────────────────────────
# Hospital — Doctor Management
# ─────────────────────────────────────────────
@app.get("/api/hospital/doctors")
async def get_hospital_doctors():
    return hospital_doctors_store

class AddDoctorPayload(BaseModel):
    license_number: str
    name: Optional[str] = "Dr. Unknown"

@app.post("/api/hospital/doctors")
async def add_doctor_to_hospital(p: AddDoctorPayload):
    hospital_doctors_store.append({"name": p.name, "license": p.license_number, "status": "Pending Sign-in"})
    return {"status": "added", "license": p.license_number}


# ─────────────────────────────────────────────
# Image-Based Model Inference (TB, Pneumonia, etc.)
# ─────────────────────────────────────────────

class ImagePredictPayload(BaseModel):
    image: str  # base64-encoded image
    model: Optional[str] = "tb"
    filename: Optional[str] = ""

@app.post("/api/models/tb/predict")
async def predict_tb(p: ImagePredictPayload):
    """
    Classify a chest X-ray image as Tuberculosis vs Normal.
    Accepts base64-encoded image data and returns prediction with confidence.
    Currently uses simulated inference with realistic results.
    """
    import base64 as b64
    try:
        img_bytes = b64.b64decode(p.image)
        img_size_kb = len(img_bytes) / 1024
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    if img_size_kb < 1:
        raise HTTPException(status_code=400, detail="Image too small — likely corrupt.")

    # Simulated inference — uses image size and filename heuristics for demo
    filename_lower = (p.filename or "").lower()

    # Heuristic: If filename contains TB indicators, give higher TB confidence
    if any(kw in filename_lower for kw in ["tuberculosis", "tb-", "tb_"]):
        tb_confidence = round(random.uniform(0.88, 0.97), 4)
    elif "normal" in filename_lower:
        tb_confidence = round(random.uniform(0.04, 0.18), 4)
    else:
        # Random but weighted slightly toward normal for general images
        tb_confidence = round(random.uniform(0.08, 0.45), 4)

    normal_confidence = round(1 - tb_confidence, 4)

    if tb_confidence >= 0.5:
        prediction = "Tuberculosis"
        severity = "high" if tb_confidence >= 0.85 else "moderate"
    else:
        prediction = "Normal"
        severity = "low"

    return {
        "status": "success",
        "mode": "demo",
        "model": "TB Detection v2.1.0",
        "model_id": "tb",
        "filename": p.filename or "unknown",
        "image_size_kb": round(img_size_kb, 1),
        "prediction": prediction,
        "confidence": round(max(tb_confidence, normal_confidence) * 100, 2),
        "confidence_score": f"{round(max(tb_confidence, normal_confidence) * 100, 2)}%",
        "severity": severity,
        "classifications": [
            {"label": "Tuberculosis", "score": round(tb_confidence * 100, 2)},
            {"label": "Normal", "score": round(normal_confidence * 100, 2)},
        ],
        "recommendations": [
            "Sputum AFB smear test recommended" if prediction == "Tuberculosis" else "No abnormalities detected",
            "Correlate with clinical symptoms and patient history",
        ]
    }


@app.post("/api/analyze")
async def analyze_image(p: ImagePredictPayload):
    """
    General image analysis endpoint — routes to the appropriate model based on the 'model' field.
    """
    model = (p.model or "tb").lower()
    if model == "tb":
        return await predict_tb(p)
    else:
        # For other models, return simulated results
        import base64 as b64
        try:
            img_bytes = b64.b64decode(p.image)
            img_size_kb = len(img_bytes) / 1024
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data.")

        confidence = round(random.uniform(0.72, 0.98), 4)
        return {
            "status": "success",
            "mode": "demo",
            "model": model,
            "filename": p.filename or "unknown",
            "image_size_kb": round(img_size_kb, 1),
            "prediction": "Positive" if confidence > 0.5 else "Negative",
            "confidence": round(confidence * 100, 2),
            "confidence_score": f"{round(confidence * 100, 2)}%",
        }


# ─────────────────────────────────────────────
# Blood Cancer Text Model — BiomedBERT (HuggingFace)
# ─────────────────────────────────────────────

class BloodCancerTextPredictPayload(BaseModel):
    text: str

@app.post("/api/models/blood-cancer-text/predict")
async def predict_blood_cancer_text(p: BloodCancerTextPredictPayload):
    """
    Classify medical text as Cancer vs Non-Cancer using BiomedBERT.
    Uses HuggingFace Inference API when HF_TOKEN is set, otherwise falls back to demo mode.
    Model: user1729/BiomedBERT-cancer-bert-classifier-v1.0
    """
    input_text = p.text.strip()
    if not input_text:
        raise HTTPException(status_code=400, detail="Text input is required.")

    # Try real HuggingFace Inference API if token is available
    if HF_TOKEN:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    HF_API_URL,
                    headers={"Authorization": f"Bearer {HF_TOKEN}"},
                    json={"inputs": input_text}
                )
                if response.status_code == 200:
                    hf_result = response.json()
                    # HF returns list of lists for text-classification
                    if isinstance(hf_result, list) and len(hf_result) > 0:
                        predictions = hf_result[0] if isinstance(hf_result[0], list) else hf_result
                        return {
                            "status": "success",
                            "mode": "live",
                            "model": HF_BLOOD_CANCER_TEXT_MODEL,
                            "input_text": input_text[:200] + ("..." if len(input_text) > 200 else ""),
                            "predictions": predictions,
                            "top_label": predictions[0]["label"] if predictions else "unknown",
                            "top_score": round(predictions[0]["score"] * 100, 2) if predictions else 0,
                        }
                else:
                    # Fall through to demo mode if API call fails
                    pass
        except Exception:
            pass  # Fall through to demo mode

    # Demo mode — simulate realistic BiomedBERT output
    text_lower = input_text.lower()
    cancer_keywords = [
        "cancer", "tumor", "tumour", "malignant", "carcinoma", "lymphoma", "leukemia",
        "leukaemia", "metastasis", "metastatic", "oncology", "neoplasm", "sarcoma",
        "blast cell", "myeloma", "chemotherapy", "biopsy", "adenocarcinoma",
        "hodgkin", "non-hodgkin", "melanoma", "pathology", "staging",
        "breast cancer", "lung cancer", "blood cancer", "bone marrow"
    ]
    keyword_hits = sum(1 for kw in cancer_keywords if kw in text_lower)
    if keyword_hits >= 3:
        cancer_score = round(random.uniform(0.88, 0.98), 4)
    elif keyword_hits >= 1:
        cancer_score = round(random.uniform(0.62, 0.87), 4)
    else:
        cancer_score = round(random.uniform(0.05, 0.28), 4)
    non_cancer_score = round(1 - cancer_score, 4)

    if cancer_score >= 0.5:
        predictions = [
            {"label": "LABEL_1", "score": cancer_score},
            {"label": "LABEL_0", "score": non_cancer_score}
        ]
        top_label = "Cancer"
    else:
        predictions = [
            {"label": "LABEL_0", "score": non_cancer_score},
            {"label": "LABEL_1", "score": cancer_score}
        ]
        top_label = "Non-Cancer"

    return {
        "status": "success",
        "mode": "demo",
        "model": HF_BLOOD_CANCER_TEXT_MODEL,
        "input_text": input_text[:200] + ("..." if len(input_text) > 200 else ""),
        "predictions": predictions,
        "top_label": top_label,
        "top_score": round(max(cancer_score, non_cancer_score) * 100, 2),
    }


@app.get("/api/models/blood-cancer-text/info")
async def get_blood_cancer_text_info():
    """Return metadata about the BiomedBERT blood cancer text classifier."""
    return {
        "model_id": "blood_cancer_text",
        "name": "Blood Cancer — Text Classifier (BiomedBERT)",
        "hf_model_id": HF_BLOOD_CANCER_TEXT_MODEL,
        "hf_url": f"https://huggingface.co/{HF_BLOOD_CANCER_TEXT_MODEL}",
        "architecture": "BertForSequenceClassification",
        "base_model": "microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract",
        "pipeline": "text-classification",
        "task": "Cancer vs Non-Cancer medical text classification",
        "labels": {"LABEL_0": "Non-Cancer", "LABEL_1": "Cancer"},
        "parameters": "109M",
        "license": "Apache-2.0",
        "input_type": "Medical text / clinical notes / abstracts",
        "accuracy": 93.6,
        "version": "v1.0.0",
        "status": "Active",
        "mode": "live" if HF_TOKEN else "demo",
    }


# ─────────────────────────────────────────────
# Legacy aliases (keep backward compat)
# ─────────────────────────────────────────────
class LoginPayload(BaseModel):
    username: str
    password: str
    phase: str
    role: Optional[str] = ""

class SignUpPayload(BaseModel):
    username: str
    password: str
    phase: str
    role: Optional[str] = "standard"

@app.post("/api/signup")
async def signup_endpoint(p: SignUpPayload):
    role = "standard" if p.phase == "phase_one" else p.role
    registered = EnclaveAuditor.register_user(p.username, p.password, p.phase, role)
    if registered:
        return {"status": "success", "message": "User registered successfully."}
    else:
        raise HTTPException(status_code=400, detail="Username already exists inside Enclave registry.")

@app.post("/api/login")
async def login_endpoint(p: LoginPayload):
    role = "standard" if p.phase == "phase_one" else p.role
    valid = EnclaveAuditor.verify_user(p.username, p.password, p.phase, role)
    if valid:
        token = "PhaseOneToken" if p.phase == "phase_one" else ("PhaseTwoAdminToken" if role == "admin" else "PhaseTwoUserToken")
        return {"status": "success", "phase": p.phase, "role": role, "token": token}
    else:
        raise HTTPException(status_code=401, detail=f"Invalid credentials for {p.phase} {role}.")
