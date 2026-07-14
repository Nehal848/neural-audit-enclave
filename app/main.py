import uvicorn
import time
import io
import json
import hashlib
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.responses import HTMLResponse, Response, FileResponse
from pydantic import BaseModel

from config import ENCLAVE_TOKEN, APP_TITLE, APP_VERSION, BASE_DIR
from core.auditor import EnclaveAuditor
from core.parser import ClinicalDataParser
from app.sanitizers import DataSanitizerPipeline

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    import os
    os.system('pip install pillow --break-system-packages')
    from PIL import Image, ImageDraw, ImageFilter

app = FastAPI(title=APP_TITLE, version=APP_VERSION)

# Initialize secure Enclave SQLite audit trail
EnclaveAuditor.init_db()

# In-memory storage for pipelines (initially loaded from prebuilts)
STORAGE_DIR = BASE_DIR / "app" / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
CUSTOM_PIPELINES_FILE = STORAGE_DIR / "custom_pipelines.json"

PREBUILT_PIPELINES = [
    {
        "id": "pneumonia",
        "name": "Pneumonia Detection",
        "type": "Prebuilt",
        "modalities": ["Image Submodel", "DICOM / Scan Submodel", "Tabular/CSV Submodel"],
        "target": "Lobar Pneumonia Marker",
        "threshold": 0.70
    },
    {
        "id": "tb",
        "name": "TB Detection",
        "type": "Prebuilt",
        "modalities": ["Image Submodel", "Text / PDF Submodel", "Tabular/CSV Submodel"],
        "target": "Tuberculosis Marker",
        "threshold": 0.65
    },
    {
        "id": "cancer",
        "name": "Cancer Detection",
        "type": "Prebuilt",
        "modalities": ["Image Submodel", "DICOM / Scan Submodel", "Text / PDF Submodel"],
        "target": "Malignant Cell Opacity",
        "threshold": 0.75
    },
    {
        "id": "diabetes",
        "name": "Diabetes Detection",
        "type": "Prebuilt",
        "modalities": ["Tabular/CSV Submodel", "Text / PDF Submodel"],
        "target": "Blood Glucose Level",
        "threshold": 0.60
    },
    {
        "id": "blood_cancer",
        "name": "Blood Cancer Detection",
        "type": "Prebuilt",
        "modalities": ["Image Submodel", "Text / PDF Submodel"],
        "target": "Abnormal Blast Cells",
        "threshold": 0.70
    },
    {
        "id": "brain_tumor",
        "name": "Brain Tumor Detection",
        "type": "Prebuilt",
        "modalities": ["Image Submodel", "Text / PDF Submodel"],
        "target": "Cerebral Mass/Glioma",
        "threshold": 0.65
    }
]

def load_pipelines() -> List[Dict[str, Any]]:
    pipelines = list(PREBUILT_PIPELINES)
    if CUSTOM_PIPELINES_FILE.exists():
        try:
            custom = json.loads(CUSTOM_PIPELINES_FILE.read_text(encoding="utf-8"))
            pipelines.extend(custom)
        except Exception:
            pass
    return pipelines

def save_custom_pipeline(pipeline: Dict[str, Any]):
    custom = []
    if CUSTOM_PIPELINES_FILE.exists():
        try:
            custom = json.loads(CUSTOM_PIPELINES_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    custom.append(pipeline)
    CUSTOM_PIPELINES_FILE.write_text(json.dumps(custom, indent=4), encoding="utf-8")

MOCK_PATIENTS = [
    {
        "id": "PT-1001",
        "name": "Arthur Dent",
        "age": 42,
        "symptoms": "Severe dry cough, slight chest tightness, low-grade fever for 3 days.",
        "has_imaging": True,
        "has_lab": True,
        "has_notes": True,
        "reports": {
            "imaging_name": "chest_xray_dent.png",
            "lab_name": "metabolic_panel_dent.csv",
            "notes_name": "clinical_notes_dent.txt"
        },
        "reports_content": {
            "imaging": "Simulated Chest X-Ray (High Opacity in Right Lower Lobe)",
            "lab": "Age,Blood_Sugar_Level,Prolonged_Cough\n42,105.0,Yes",
            "clinical_notes": "Patient presents with persistent dry cough, mild chest pain. Former smoker. Vitals stable."
        }
    },
    {
        "id": "PT-1002",
        "name": "Tricia McMillan",
        "age": 35,
        "symptoms": "Elevated fasting blood sugar, persistent fatigue, increased fluid intake (polydipsia).",
        "has_imaging": False,
        "has_lab": True,
        "has_notes": True,
        "reports": {
            "imaging_name": "N/A",
            "lab_name": "glucose_tolerance_mcmillan.csv",
            "notes_name": "clinical_notes_mcmillan.txt"
        },
        "reports_content": {
            "imaging": "",
            "lab": "Age,Blood_Sugar_Level,Prolonged_Cough\n35,168.0,No",
            "clinical_notes": "Fasting blood sugar measured at 168 mg/dL. History of polyuria and polydipsia. Patient reports family history of diabetes."
        }
    },
    {
        "id": "PT-1003",
        "name": "Ford Prefect",
        "age": 45,
        "symptoms": "Productive cough with blood-tinged sputum, night sweats, unexplained weight loss.",
        "has_imaging": True,
        "has_lab": True,
        "has_notes": True,
        "reports": {
            "imaging_name": "chest_ct_prefect.png",
            "lab_name": "blood_count_prefect.csv",
            "notes_name": "clinical_notes_prefect.txt"
        },
        "reports_content": {
            "imaging": "Simulated Chest CT Scan (Apical cavitary lesion detected in left upper lobe)",
            "lab": "Age,Blood_Sugar_Level,Prolonged_Cough\n45,95.0,Yes",
            "clinical_notes": "Symptoms indicate active hemoptysis and chronic cough. High suspicion of pulmonary tuberculosis infection."
        }
    },
    {
        "id": "PT-1004",
        "name": "Zaphod Beeblebrox",
        "age": 110,
        "symptoms": "Routine corporate physical checkup, no current physical complaints, high energy levels.",
        "has_imaging": False,
        "has_lab": True,
        "has_notes": True,
        "reports": {
            "imaging_name": "N/A",
            "lab_name": "routine_vitals_beeblebrox.csv",
            "notes_name": "clinical_notes_beeblebrox.txt"
        },
        "reports_content": {
            "imaging": "",
            "lab": "Age,Blood_Sugar_Level,Prolonged_Cough\n110,88.0,No",
            "clinical_notes": "Patient is in high spirits. All metabolic indices check out clean. Baseline parameters within normal limits."
        }
    },
    {
        "id": "PT-1005",
        "name": "Marvin the Android",
        "age": 42000,
        "symptoms": "Chronic headaches, severe localized skull pressure, diagnostic memory-core anomaly flags.",
        "has_imaging": True,
        "has_lab": False,
        "has_notes": True,
        "reports": {
            "imaging_name": "brain_mri_marvin.png",
            "lab_name": "N/A",
            "notes_name": "clinical_notes_marvin.txt"
        },
        "reports_content": {
            "imaging": "Simulated Brain MRI (Contrast enhancing lesion in right cerebral hemisphere)",
            "lab": "",
            "clinical_notes": "Patient presents with persistent severe headaches and localized skull pressure. Scanning shows contrast-enhancing mass indicating glioma or mass lesion."
        }
    },
    {
        "id": "PT-1006",
        "name": "Fenchurch",
        "age": 28,
        "symptoms": "Unexplained bruising, severe fatigue, pallor, elevated leukocyte counts.",
        "has_imaging": True,
        "has_lab": True,
        "has_notes": True,
        "reports": {
            "imaging_name": "blood_smear_fenchurch.png",
            "lab_name": "blood_count_fenchurch.csv",
            "notes_name": "clinical_notes_fenchurch.txt"
        },
        "reports_content": {
            "imaging": "Simulated Peripheral Blood Smear (Abnormal leukocyte blast cells present)",
            "lab": "Age,Leukocytes,Lymphocytes\n28,45000.0,Yes",
            "clinical_notes": "Patient reports progressive fatigue, sudden bruising. Blood counts confirm marked leukocytosis. Smear shows high count of blast cells."
        }
    }
]

class AntigravityOrchestrator:
    @staticmethod
    def generate_gradcam_mock(image_bytes: bytes) -> bytes:
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception:
            # Generate backup image if bytes are simulated string
            img = Image.new("RGB", (512, 512), color=(30, 30, 45))
        w, h = img.size
        ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(ov)
        np.random.seed(int(time.time()) % 1000)
        cx, cy = np.random.randint(int(w * 0.3), int(w * 0.7)), np.random.randint(int(h * 0.3), int(h * 0.7))
        r = min(w, h) // 6
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(0, 0, 255, 60))
        draw.ellipse([cx - int(r * 0.7), cy - int(r * 0.7), cx + int(r * 0.7), cy + int(r * 0.7)], fill=(255, 255, 0, 100))
        draw.ellipse([cx - int(r * 0.4), cy - int(r * 0.4), cx + int(r * 0.4), cy + int(r * 0.4)], fill=(255, 0, 0, 140))
        final = Image.alpha_composite(img.convert("RGBA"), ov.filter(ImageFilter.GaussianBlur(r // 3)))
        out = io.BytesIO()
        final.convert("RGB").save(out, format="JPEG")
        return out.getvalue()

cached_heatmap = None

@app.get("/", response_class=HTMLResponse)
async def serve_master_platform():
    html_path = BASE_DIR / "app" / "index.html"
    if html_path.exists():
        return HTMLResponse(content=html_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Error: app/index.html not found.</h1>", status_code=404)

@app.get("/api/audit/logs")
async def get_audit_logs_json(x_user_role: Optional[str] = Header(None)):
    if x_user_role not in ["admin", "user", "standard"]:
        raise HTTPException(status_code=403, detail="Forbidden. Access restricted to Administrator role.")
    try:
        return EnclaveAuditor.get_all_logs()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/audit/stats")
async def get_audit_stats_json(x_user_role: Optional[str] = Header(None)):
    if x_user_role not in ["admin", "user", "standard"]:
        raise HTTPException(status_code=403, detail="Forbidden. Access restricted to Administrator role.")
    try:
        return EnclaveAuditor.get_ledger_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pipelines")
async def get_all_active_pipelines(x_user_role: Optional[str] = Header(None)):
    pipelines = load_pipelines()
    if x_user_role == "standard":
        return [p for p in pipelines if p["type"] == "Prebuilt"]
    return pipelines

@app.get("/api/patients")
async def get_patients_list():
    return MOCK_PATIENTS

@app.get("/api/patients/{patient_id}/reports")
async def get_patient_reports(patient_id: str):
    for patient in MOCK_PATIENTS:
        if patient["id"] == patient_id:
            return patient
    raise HTTPException(status_code=404, detail="Patient not found")

class RunWorkflowPayload(BaseModel):
    patient_id: str
    custom_notes: Optional[str] = None

@app.post("/api/workflow/run")
async def run_automatic_workflow(p: RunWorkflowPayload, x_user_role: Optional[str] = Header(None)):
    global cached_heatmap
    patient = None
    for pat in MOCK_PATIENTS:
        if pat["id"] == p.patient_id:
            patient = pat
            break
            
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    start_time = time.time()
    reports = dict(patient["reports_content"])
    
    if p.custom_notes:
        reports["clinical_notes"] = p.custom_notes
        
    pipelines = load_pipelines()
    if x_user_role == "standard":
        pipelines = [pipe for pipe in pipelines if pipe["type"] == "Prebuilt"]
    
    # Step 1-3: Run the AI Relevance Engine & Decision Logic
    workflow_results = ClinicalDataParser.evaluate_patient_workflow(reports, pipelines)
    
    # Simulate generating heatmap if imaging is present
    if patient["has_imaging"]:
        img = Image.new("RGB", (512, 512), color=(30, 30, 45))
        draw = ImageDraw.Draw(img)
        draw.ellipse([80, 100, 220, 420], fill=(70, 70, 90))
        draw.ellipse([292, 100, 432, 420], fill=(70, 70, 90))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="PNG")
        cached_heatmap = AntigravityOrchestrator.generate_gradcam_mock(img_bytes.getvalue())
    else:
        cached_heatmap = None
        
    execution_time_ms = (time.time() - start_time) * 1000
    
    # Gather findings and recommendations
    findings = []
    recommendations = []
    scores = {}
    
    for p_name, details in workflow_results.items():
        if details["relevant"] and details["action"] == "RUN":
            score_val = details["score"]
            scores[p_name] = details["confidence"]
            findings.append(f"Relevance Engine matched {p_name}: likelihood at {details['confidence']}.")
            if p_name == "Pneumonia Detection" and score_val > 0.70:
                findings.append("Radiographic consolidations spotted matching pneumonia parameters.")
                recommendations.append("Expedited clinical evaluation for acute pneumonia.")
            elif p_name == "TB Detection" and score_val > 0.65:
                findings.append("Apical lobe cavity markers suggest active tuberculosis.")
                recommendations.append("Request sputum culture and tuberculosis PCR test.")
            elif p_name == "Cancer Detection" and score_val > 0.75:
                findings.append("Nodule opacity boundary anomaly detected.")
                recommendations.append("Schedule high-resolution chest CT scan.")
            elif p_name == "Diabetes Detection" and score_val > 0.60:
                findings.append("Elevated blood glucose levels indicate hyperglycemia.")
                recommendations.append("Initiate HbA1c screening panel and glycemic management.")
            elif p_name == "Blood Cancer Detection" and score_val > 0.70:
                findings.append("Abnormal leukocyte blast cell proliferation detected in peripheral blood smear analysis.")
                recommendations.append("Urgent oncology referral for bone marrow biopsy and cytogenetic profiling.")
            elif p_name == "Brain Tumor Detection" and score_val > 0.65:
                findings.append("Contrast-enhancing cerebral mass lesion identified on MRI scan. Glioma/mass classification suspected.")
                recommendations.append("Neurosurgery and neuro-oncology consultation with urgent contrast-MRI follow-up.")
            else:
                findings.append(f"Custom AutoML pipeline {p_name} flagged anomalous parameters.")
                recommendations.append(f"Perform secondary diagnostic evaluation for {p_name}.")
                
    if not findings:
        findings.append("All disease pipeline indices stable. No anomalous clinical markers identified.")
        recommendations.append("Standard outpatient followup according to hospital guidelines.")
        
    dataset_hash = "0x" + hashlib.sha256(str(reports).encode('utf-8')).hexdigest()[:16]
    
    return {
        "execution_time_ms": round(execution_time_ms, 2),
        "dataset_hash": dataset_hash,
        "stages": {
            "stage1": {
                "status": "COMPLETED",
                "details": f"Patient '{patient['name']}' selected. Vitals ingested successfully."
            },
            "stage2": {
                "status": "COMPLETED",
                "details": {
                    "imaging": f"{patient['reports']['imaging_name']} (Found)" if patient["has_imaging"] else "N/A",
                    "lab": f"{patient['reports']['lab_name']} (Found)" if patient["has_lab"] else "N/A",
                    "clinical_notes": f"{patient['reports']['notes_name']} (Found)" if patient["has_notes"] else "N/A"
                }
            },
            "stage3": {
                "status": "COMPLETED",
                "details": f"Checking clinical relevance across {len(pipelines)} active pipelines."
            },
            "stage4": {
                "status": "COMPLETED",
                "decisions": { p_name: {"action": det["action"], "reason": det["reason"]} for p_name, det in workflow_results.items() }
            },
            "stage5": {
                "status": "COMPLETED",
                "details": f"Executed {len([k for k,v in workflow_results.items() if v['action'] == 'RUN'])} relevant pipelines."
            },
            "stage6": {
                "status": "COMPLETED",
                "details": "Aggregated all neural network activations and tabular metrics."
            },
            "stage7": {
                "status": "COMPLETED",
                "report": {
                    "patient_name": patient["name"],
                    "age": patient["age"],
                    "findings": findings,
                    "recommendations": recommendations,
                    "scores": scores,
                    "supporting_evidence": reports.get("clinical_notes", "Vitals normal."),
                    "dataset_hash": dataset_hash
                }
            }
        }
    }

@app.post("/api/workflow/upload")
async def run_workflow_on_uploaded_file(file: UploadFile = File(...), x_user_role: Optional[str] = Header(None)):
    global cached_heatmap
    start_time = time.time()
    file_bytes = await file.read()
    filename = file.filename
    
    meta = DataSanitizerPipeline.identify_modality_and_process(file_bytes, filename)
    
    reports = {
        "imaging": b"",
        "lab": "",
        "clinical_notes": f"Uploaded File: {filename}"
    }
    
    is_image = "Image" in meta["modality"]
    is_tabular = "Tabular" in meta["modality"]
    
    if is_image:
        reports["imaging"] = file_bytes
        cached_heatmap = AntigravityOrchestrator.generate_gradcam_mock(file_bytes)
    elif is_tabular:
        csv_text = file_bytes.decode('utf-8', errors='ignore')
        reports["lab"] = csv_text
        reports["clinical_notes"] += "\n" + csv_text
    else:
        reports["clinical_notes"] = file_bytes.decode('utf-8', errors='ignore')
        cached_heatmap = None
        
    pipelines = load_pipelines()
    if x_user_role == "standard":
        pipelines = [pipe for pipe in pipelines if pipe["type"] == "Prebuilt"]
    workflow_results = ClinicalDataParser.evaluate_patient_workflow(reports, pipelines)
    
    execution_time_ms = (time.time() - start_time) * 1000
    
    findings = []
    recommendations = []
    scores = {}
    
    for p_name, details in workflow_results.items():
        if details["relevant"] and details["action"] == "RUN":
            score_val = details["score"]
            scores[p_name] = details["confidence"]
            findings.append(f"Relevance Engine matched {p_name}: likelihood at {details['confidence']}.")
            if p_name == "Pneumonia Detection" and score_val > 0.70:
                findings.append("Radiographic consolidations spotted matching pneumonia parameters.")
                recommendations.append("Expedited clinical evaluation for acute pneumonia.")
            elif p_name == "TB Detection" and score_val > 0.65:
                findings.append("Apical lobe cavity markers suggest active tuberculosis.")
                recommendations.append("Request sputum culture and tuberculosis PCR test.")
            elif p_name == "Cancer Detection" and score_val > 0.75:
                findings.append("Nodule opacity boundary anomaly detected.")
                recommendations.append("Schedule high-resolution chest CT scan.")
            elif p_name == "Diabetes Detection" and score_val > 0.60:
                findings.append("Elevated blood glucose levels indicate hyperglycemia.")
                recommendations.append("Initiate HbA1c screening panel and glycemic management.")
            elif p_name == "Blood Cancer Detection" and score_val > 0.70:
                findings.append("Abnormal leukocyte blast cell proliferation detected in peripheral blood smear analysis.")
                recommendations.append("Urgent oncology referral for bone marrow biopsy and cytogenetic profiling.")
            elif p_name == "Brain Tumor Detection" and score_val > 0.65:
                findings.append("Contrast-enhancing cerebral mass lesion identified on MRI scan. Glioma/mass classification suspected.")
                recommendations.append("Neurosurgery and neuro-oncology consultation with urgent contrast-MRI follow-up.")
            else:
                findings.append(f"Custom AutoML pipeline {p_name} flagged anomalous parameters.")
                recommendations.append(f"Perform secondary diagnostic evaluation for {p_name}.")
                
    if not findings:
        findings.append("All disease pipeline indices stable. No anomalous clinical markers identified.")
        recommendations.append("Standard outpatient followup according to hospital guidelines.")
        
    dataset_hash = "0x" + hashlib.sha256(file_bytes[:1024]).hexdigest()[:16]
    patient_name = f"Uploaded: {filename}"
    
    return {
        "execution_time_ms": round(execution_time_ms, 2),
        "dataset_hash": dataset_hash,
        "stages": {
            "stage1": {
                "status": "COMPLETED",
                "details": f"File '{filename}' uploaded. Data successfully parsed."
            },
            "stage2": {
                "status": "COMPLETED",
                "details": {
                    "imaging": f"{filename} (Ingested)" if is_image else "N/A",
                    "lab": f"{filename} (Ingested)" if is_tabular else "N/A",
                    "clinical_notes": f"{filename} (Ingested)" if not (is_image or is_tabular) else "N/A"
                }
            },
            "stage3": {
                "status": "COMPLETED",
                "details": f"Checking clinical relevance across {len(pipelines)} active pipelines."
            },
            "stage4": {
                "status": "COMPLETED",
                "decisions": { p_name: {"action": det["action"], "reason": det["reason"]} for p_name, det in workflow_results.items() }
            },
            "stage5": {
                "status": "COMPLETED",
                "details": f"Executed {len([k for k,v in workflow_results.items() if v['action'] == 'RUN'])} relevant pipelines."
            },
            "stage6": {
                "status": "COMPLETED",
                "details": "Aggregated all neural network activations and tabular metrics."
            },
            "stage7": {
                "status": "COMPLETED",
                "report": {
                    "patient_name": patient_name,
                    "age": 45,
                    "findings": findings,
                    "recommendations": recommendations,
                    "scores": scores,
                    "supporting_evidence": f"Custom dataset upload. Detected modality: {meta['modality']}.",
                    "dataset_hash": dataset_hash
                }
            }
        }
    }

class AutoMLTrainPayload(BaseModel):
    pipeline_name: str
    target_column: str
    problem_type: str

@app.post("/api/automl/train")
async def run_automl_training_simulation(p: AutoMLTrainPayload, x_user_role: Optional[str] = Header(None)):
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden. Access restricted to Administrator role.")
    np.random.seed(int(time.time()) % 1000)
    base_score = 0.82 + np.random.uniform(-0.05, 0.12)
    base_score = min(0.99, max(0.55, base_score))
    
    val_metrics = {
        "accuracy": round(base_score, 4),
        "precision": round(base_score * 0.98, 4),
        "recall": round(base_score * 0.95, 4),
        "f1_score": round(base_score * 0.96, 4),
        "auc": round(base_score + 0.01, 4)
    }
    
    stages_logs = [
        "Stage 01: [UPLOADED] Clinical training dataset ingested successfully.",
        "Stage 02: [INGESTION] Format validated. Missing values identified (4% total).",
        "Stage 03: [PREPROCESSING] Imputed null values. Normalized numerical features.",
        "Stage 04: [FEATURE ENGINEERING] Generated interaction terms. Applied PCA.",
        "Stage 05: [MODEL TRAINING] Evaluated XGBoost, LightGBM, and Random Forest models.",
        "Stage 06: [EVALUATION] Completed 5-fold cross-validation on hold-out cases.",
        "Stage 07: [BEST MODEL] Selected XGBoost Champion based on validation AUC.",
        "Stage 08: [OPTIMIZATION] Finished Optuna hyperparameter sweep (50 trials).",
        "Stage 09: [PACKAGING] Wrapped weights into secure Enclave ONNX format.",
        "Stage 10: [MONITORING] Attestation signature generated. Logging active."
    ]
    
    model_version = f"v1.0.{int(time.time()) % 100}-ONNX"
    
    return {
        "status": "SUCCESS",
        "pipeline_name": p.pipeline_name,
        "logs": stages_logs,
        "metrics": val_metrics,
        "model_version": model_version,
        "target_column": p.target_column,
        "problem_type": p.problem_type
    }

class AutoMLDeployPayload(BaseModel):
    pipeline_name: str
    target_column: str
    problem_type: str
    model_version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc: float

@app.post("/api/automl/deploy")
async def deploy_automl_pipeline(p: AutoMLDeployPayload, x_user_role: Optional[str] = Header(None)):
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden. Access restricted to Administrator role.")
    pipeline_id = p.pipeline_name.lower().replace(" ", "_")
    new_pipeline = {
        "id": pipeline_id,
        "name": p.pipeline_name,
        "type": "Custom AutoML",
        "modalities": ["Tabular/CSV Submodel", "Text/PDF Submodel"],
        "target": p.target_column,
        "threshold": 0.65
    }
    save_custom_pipeline(new_pipeline)
    return {"status": "DEPLOYED", "pipeline_id": pipeline_id}

@app.post("/enclave/ingest")
async def ingest_and_process_clinical_data(
    file: UploadFile = File(...), 
    x_internal_enclave_token: str = Header(None)
):
    global cached_heatmap
    if x_internal_enclave_token != ENCLAVE_TOKEN:
        raise HTTPException(status_code=401, detail="Token mismatch. Invalid Enclave Authorization Token.")
    
    start_time = time.time()
    file_bytes = await file.read()
    meta = DataSanitizerPipeline.identify_modality_and_process(file_bytes, file.filename)
    
    if "Tabular" in meta["modality"]:
        processed_df, risk_evaluation, tournament_metrics = ClinicalDataParser.parse_tabular_payload(file_bytes)
        result = tournament_metrics
        meta["triage_evaluation"] = risk_evaluation
        dataset_rows = len(processed_df)
        dataset_cols = len(processed_df.columns) if hasattr(processed_df, 'columns') else 4
        draft_model = "model_xgboost_enclave_v2.1.onnx"
        val_metrics = {"accuracy": 0.96, "precision": 0.95, "recall": 0.94, "f1_score": 0.94}
    else:
        cached_heatmap = AntigravityOrchestrator.generate_gradcam_mock(file_bytes)
        result = ClinicalDataParser.parse_vision_payload(file_bytes)
        dataset_rows = 1
        dataset_cols = 3 # RGB channels
        draft_model = "model_vision_cnn_v2.1.onnx"
        val_metrics = {"accuracy": 0.94, "precision": 0.93, "recall": 0.92, "f1_score": 0.93}
        
    execution_time_ms = (time.time() - start_time) * 1000
    
    # Generate reproducible dataset hash for audit trail
    import hashlib
    dataset_hash = "0x" + hashlib.sha256(file_bytes[:1024]).hexdigest()[:16]

    return {
        "analysis_status": "SUCCESS",
        "enclave_execution_time_ms": round(execution_time_ms, 2),
        "modality_routing": meta,
        "dataset_metadata": {
            "dataset_hash": dataset_hash,
            "rows": dataset_rows,
            "cols": dataset_cols,
            "target_column": "Diagnosis" if "Tabular" in meta["modality"] else "Lobar Pneumonia Marker",
            "problem_type": "Classification (Binary Yes/No)",
            "draft_model_saved": draft_model,
            "validation_metrics": val_metrics
        },
        "tournament_metrics": {
            "tournament_pool": result["pool"],
            "selected_champion": result["champion"],
            "champion_confidence_auc": result["confidence"],
            "questions": result["questions"],
            "triage_category": result.get("triage_category", "High Risk / Expedited Review")
        }
    }

class AuditCommitPayload(BaseModel):
    action: str
    modality: str
    format: str
    champion: str
    confidence: str
    dataset_hash: str = "0x8f3a9d10e241bc389a02d41a77"
    uploaded_by: str = "Dr. S. Vance (Senior Clinical Lead)"
    target_column: str = "Diagnosis"
    problem_type: str = "Classification (Binary)"
    doctor_notes: str = "Verified outputs against clinical relevance and edge parameters."
    model_version: str = "v2.1.0-ONNX Registry Draft"

@app.post("/enclave/audit/commit")
async def commit_audit_log(p: AuditCommitPayload):
    try:
        log_id = EnclaveAuditor.commit_audit_log(
            modality=p.modality,
            format=p.format,
            champion=p.champion,
            confidence=p.confidence,
            action=p.action,
            dataset_hash=p.dataset_hash,
            uploaded_by=p.uploaded_by,
            target_column=p.target_column,
            problem_type=p.problem_type,
            doctor_notes=p.doctor_notes,
            model_version=p.model_version
        )
        return {"status": "LOGGED", "log_id": log_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/enclave/heatmap")
async def get_enclave_heatmap():
    global cached_heatmap
    if cached_heatmap is None:
        raise HTTPException(status_code=404, detail="No map found.")
    return Response(content=cached_heatmap, media_type="image/jpeg")

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
        if p.phase == "phase_one":
            token = "PhaseOneToken"
        elif role == "admin":
            token = "PhaseTwoAdminToken"
        else:
            token = "PhaseTwoUserToken"
            
        return {
            "status": "success",
            "phase": p.phase,
            "role": role,
            "token": token
        }
    else:
        hint = ""
        if p.phase == "phase_one":
            hint = " (Hint: doctor/doctor)"
        elif role == "admin":
            hint = " (Hint: admin/admin)"
        else:
            hint = " (Hint: user/user)"
        raise HTTPException(status_code=401, detail=f"Invalid credentials for {p.phase} {role}{hint}.")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
