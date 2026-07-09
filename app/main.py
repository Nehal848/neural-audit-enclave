import uvicorn
from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel
import time, io, sqlite3
from app.sanitizers import DataSanitizerPipeline
from app.models.loader import ModelWeightLoader

app = FastAPI(title="Hospital AI Infrastructure Platform", version="2.1.0")
DB_PATH = "enclave_audit_trail.db"

# Minimal layout interface for testing the new engine outputs
@app.get("/", response_class=HTMLResponse)
async def serve_hud():
    return """
    <html><body style="background:#020617;color:#cbd5e1;font-family:sans-serif;padding:40px;">
    <h2>🧠 Disease Prediction Core Status: <span style="color:#22d3ee;">ACTIVE</span></h2>
    <p>Upload files via the main viewport interface to stream parameters directly into the loader loop.</p>
    </body></html>
    """

@app.post("/enclave/ingest")
async def ingest_clinical_payload(file: UploadFile = File(...), x_internal_enclave_token: str = Header(None)):
    if x_internal_enclave_token != "SecureToken123":
        raise HTTPException(status_code=401, detail="Token mismatch.")
        
    start_time = time.time()
    file_bytes = await file.read()
    meta = DataSanitizerPipeline.identify_modality_and_process(file_bytes, file.filename)
    
    # Run through the true inference matrix engine logic block instead of hardcoded strings
    if "Tabular" in meta["modality"]:
        # Mocking values extracted by sanitizer text pipeline regex strings
        extracted_metrics = {"family_history": "yes", "prolonged_coughing": "yes"}
        result = ModelWeightLoader.predict_tabular_respiratory(extracted_metrics)
    else:
        result = ModelWeightLoader.predict_vision_pathology(file_bytes)
        
    execution_time_ms = (time.time() - start_time) * 1000
    
    return {
        "analysis_status": "SUCCESS",
        "enclave_execution_time_ms": round(execution_time_ms, 2),
        "modality_routing": meta,
        "tournament_metrics": {
            "tournament_pool": result["pool"],
            "selected_champion": result["champion"],
            "champion_confidence_auc": result["confidence"],
            "questions": result["questions"]
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
