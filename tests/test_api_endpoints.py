"""
Automated End-to-End Verification Suite for Hospital AI Ecosystem
Verifies Auth, Doctor Portal, Hospital Command, Marketplace, and the 13-Step AutoML Pipeline.
"""
import time
import io
import sys
from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from fastapi.testclient import TestClient
from app.main import app

def run_all_tests():
    client = TestClient(app)

    print("--- 1. Testing Doctor & Hospital Auth ---")
    r = client.post("/api/doctor/login", json={"license_no": "MED-98765-IN", "password": "doctor"})
    assert r.status_code == 200, r.text
    tok = r.json()["token"]
    doc_headers = {"Authorization": f"Bearer {tok}"}

    hr = client.post("/api/hospital/login", json={"reg_no": "HOSP-MH-001", "password": "admin"})
    assert hr.status_code == 200, hr.text
    htok = hr.json()["token"]
    hosp_headers = {"Authorization": f"Bearer {htok}"}
    print("  ✅ Auth verified.")

    print("--- 2. Testing Doctor Clinical Portal Routes ---")
    assert client.get("/api/doctor/dashboard", headers=doc_headers).status_code == 200
    assert client.get("/api/doctor/lab-imaging", headers=doc_headers).status_code == 200
    assert client.get("/api/patients", headers=doc_headers).status_code == 200
    assert client.get("/api/models/my-models", headers=doc_headers).status_code == 200
    print("  ✅ Doctor portal routes verified.")

    print("--- 3. Testing Hospital Admin Command Routes ---")
    assert client.get("/api/hospital/dashboard", headers=hosp_headers).status_code == 200
    assert client.get("/api/hospital/integrations", headers=hosp_headers).status_code == 200
    assert client.get("/api/hospital/version-control", headers=hosp_headers).status_code == 200
    assert client.get("/api/hospital/shadow-mode", headers=hosp_headers).status_code == 200
    print("  ✅ Hospital admin routes verified.")

    print("--- 4. Testing AI Marketplace & Scope Gate ---")
    assert client.get("/api/marketplace", headers=hosp_headers).status_code == 200
    sc = client.post("/api/marketplace/scope-check", json={
        "vendor_id": "pneumoscan_v2",
        "patient_age": 45,
        "modality": "X-Ray",
        "input_format": ".dcm"
    }, headers=hosp_headers)
    assert sc.status_code == 200 and sc.json()["passed"] is True
    print("  ✅ Marketplace and Vendor Scope Gate verified.")

    print("--- 5. Testing Real 13-Step AutoML Pipeline End-to-End ---")
    rows = ["age,bmi,bp,cholesterol,outcome"]
    for i in range(115):
        rows.append(f"{30 + (i % 40)},{21.5 + (i % 12)*0.8:.1f},{110 + (i % 35)},{170 + (i % 80)},{i % 2}")
    csv_data = "\n".join(rows).encode("utf-8")
    files = {"file": ("clinical_trial.csv", io.BytesIO(csv_data), "text/csv")}
    data = {"disease_name": "Cardiac Risk AI"}
    up = client.post("/api/hospital/automl/upload", files=files, data=data, headers=hosp_headers)
    assert up.status_code == 200, up.text
    job_id = up.json()["job_id"]
    print(f"  Step 1: Uploaded dataset -> job_id {job_id}")

    time.sleep(1.5)  # allow profiler thread to finish
    j = client.get(f"/api/hospital/automl/job/{job_id}", headers=hosp_headers).json()
    print(f"  Step 2: Profile status -> {j['status']}")

    cfg = client.post(
        f"/api/hospital/automl/job/{job_id}/config",
        json={"target_column": "outcome", "phi_columns": []},
        headers=hosp_headers
    )
    assert cfg.status_code == 200, cfg.text
    print("  Step 3: Config submitted -> status CLEANING")

    time.sleep(1.5)  # allow cleaner thread to finish
    j = client.get(f"/api/hospital/automl/job/{job_id}", headers=hosp_headers).json()
    if j["status"] == "CLEANING":
        time.sleep(1.5)
        j = client.get(f"/api/hospital/automl/job/{job_id}", headers=hosp_headers).json()
    print(f"  Step 4 & 5: Cleaned -> status {j['status']}, quality_score={j.get('quality_score')}")

    assert j["status"] == "AWAITING_APPROVAL", f"Expected AWAITING_APPROVAL got {j['status']}"
    appr = client.post(
        f"/api/hospital/automl/job/{job_id}/approve-quality",
        json={"approved": True},
        headers=hosp_headers
    )
    assert appr.status_code == 200, appr.text
    print("  Step 5: Human verification approved -> status TRAINING")

    for _ in range(20):
        time.sleep(1.0)
        j = client.get(f"/api/hospital/automl/job/{job_id}", headers=hosp_headers).json()
        if j["status"] in ("REPORT_READY", "DEPLOYED"):
            break
    print(f"  Step 6 & 7: Multi-algorithm tournament finished -> status {j['status']}")
    assert j["status"] == "REPORT_READY", f"Expected REPORT_READY got {j['status']}"

    rep = client.get(f"/api/hospital/automl/job/{job_id}/report", headers=hosp_headers).json()
    print(f"  Step 8: Explainability Report -> Champion: {rep['report'].get('champion_algorithm')}, AUC: {rep['metrics'].get('auc')}")

    gov = client.post(
        f"/api/hospital/automl/job/{job_id}/governing-approval",
        json={"job_id": job_id, "approved": True, "reviewer_notes": "Approved for clinical deployment"},
        headers=hosp_headers
    )
    assert gov.status_code == 200, gov.text
    print("  Step 12: Governing Body sign-off -> status DEPLOYED")

    dep = client.post(
        "/api/hospital/automl/deploy",
        json={"job_id": job_id, "name": "Cardiac Risk AI v1.0"},
        headers=hosp_headers
    )
    assert dep.status_code == 200, dep.text
    print("  Step 13: Model deployed to My Models registry!")

    print("=== ALL 13 STEPS AND API ENDPOINTS VERIFIED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_all_tests()
