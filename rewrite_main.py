import re

with open('app/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if 'from core.database import DatabaseManager' not in content:
    content = content.replace('from core.auditor import EnclaveAuditor', 'from core.auditor import EnclaveAuditor\nfrom core.database import DatabaseManager')

# 2. Add init_db to startup
content = content.replace('EnclaveAuditor.init_db()', 'EnclaveAuditor.init_db()\n    DatabaseManager.init_db()')

# 3. Replace Doctor Auth
doctor_auth_pattern = r'class DoctorSignUpPayload\(BaseModel\):.*?def doctor_login\(p: DoctorLoginPayload\):.*?raise HTTPException\(status_code=401, detail="Invalid license number or password.*?\)'
doctor_auth_new = '''class DoctorSignUpPayload(BaseModel):
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
    doc = DatabaseManager.get_doctor_by_license(p.license_no)
    if doc and doc["status"] == "Active":
        raise HTTPException(status_code=400, detail="License number already registered.")
    DatabaseManager.create_doctor({
        "full_name": p.full_name, "license_no": p.license_no, "state": p.state,
        "email": p.email, "hospital_name": p.hospital_name, "phone": p.phone, "password": p.password
    })
    return {"status": "registered", "message": "Doctor account created. OTP will be sent to your email."}

class DoctorLoginPayload(BaseModel):
    license_no: str
    password: str

@app.post("/api/doctor/login")
async def doctor_login(p: DoctorLoginPayload):
    doc = DatabaseManager.get_doctor_by_license(p.license_no)
    if doc and doc["password"] == p.password:
        return {
            "status": "success", "role": "doctor", "full_name": doc["name"],
            "hospital_name": doc["hospital_name"], "license_no": p.license_no, "token": "DoctorToken"
        }
    raise HTTPException(status_code=401, detail="Invalid license number or password.")'''
content = re.sub(doctor_auth_pattern, doctor_auth_new, content, flags=re.DOTALL)

# 4. Replace Hospital Auth
hospital_auth_pattern = r'class HospitalSignUpPayload\(BaseModel\):.*?def hospital_login\(p: HospitalLoginPayload\):.*?raise HTTPException\(status_code=401, detail="Invalid registration number or password.*?\)'
hospital_auth_new = '''class HospitalSignUpPayload(BaseModel):
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
    h = DatabaseManager.get_hospital_by_reg(p.reg_no)
    if h:
        raise HTTPException(status_code=400, detail="Registration number already exists.")
    DatabaseManager.create_hospital({
        "hospital_name": p.hospital_name, "address": p.address, "reg_no": p.reg_no,
        "admin_name": p.admin_name, "admin_email": p.admin_email, "email": p.email,
        "phone": p.phone, "password": p.password
    })
    return {"status": "registered", "message": "Hospital account created. OTP will be sent to your official email."}

class HospitalLoginPayload(BaseModel):
    reg_no: str
    password: str

@app.post("/api/hospital/login")
async def hospital_login(p: HospitalLoginPayload):
    h = DatabaseManager.get_hospital_by_reg(p.reg_no)
    if h and h["password"] == p.password:
        return {
            "status": "success", "role": "hospital", "hospital_name": h["name"],
            "reg_no": p.reg_no, "token": "HospitalToken"
        }
    raise HTTPException(status_code=401, detail="Invalid registration number or password.")'''
content = re.sub(hospital_auth_pattern, hospital_auth_new, content, flags=re.DOTALL)

# 5. Patient endpoints
patient_endpoints_pattern = r'@app\.get\("/api/patients"\).*?return \{"status": "added", "patient": new_patient\}'
patient_endpoints_new = '''@app.get("/api/patients")
async def get_patients_list():
    return DatabaseManager.get_all_patients()

@app.get("/api/patients/{patient_id}")
async def get_patient(patient_id: str):
    pts = DatabaseManager.get_all_patients()
    for p in pts:
        if p["pt_id"] == patient_id:
            return p
    raise HTTPException(status_code=404, detail="Patient not found.")

@app.get("/api/patients/{patient_id}/reports")
async def get_patient_reports(patient_id: str):
    pts = DatabaseManager.get_all_patients()
    for p in pts:
        if p["pt_id"] == patient_id:
            return p
    raise HTTPException(status_code=404, detail="Patient reports not found.")

class AddPatientPayload(BaseModel):
    name: str
    age: int
    symptoms: Optional[str] = ""
    email: Optional[str] = ""

@app.post("/api/patients")
async def add_patient(p: AddPatientPayload):
    pts = DatabaseManager.get_all_patients()
    new_id = f"PT-{1007 + len(pts)}"
    DatabaseManager.add_patient(new_id, p.name, p.age, p.symptoms)
    return {"status": "added", "pt_id": new_id}'''
content = re.sub(patient_endpoints_pattern, patient_endpoints_new, content, flags=re.DOTALL)

# 6. Marketplace
marketplace_endpoints_pattern = r'@app\.get\("/api/marketplace"\).*?message": f"License for \{p\.model_name\} \(\{p\.price\}\) activated.*?\}'
marketplace_endpoints_new = '''@app.get("/api/marketplace")
async def get_marketplace():
    return DatabaseManager.get_marketplace_models()

class PurchasePayload(BaseModel):
    model_id: str
    model_name: str
    price: str

@app.post("/api/marketplace/purchase")
async def purchase_model(p: PurchasePayload):
    DatabaseManager.purchase_model(1, p.model_id, p.model_name, "Classification", 95.0, "v1.0")
    EnclaveAuditor.commit_audit_log(
        modality="Marketplace Purchase", format="Activation",
        champion=p.model_name, confidence="N/A", action="PURCHASED",
        doctor_notes=f"Purchased license for {p.model_name} at {p.price}."
    )
    return {
        "status": "purchased", "model_id": p.model_id, "model_name": p.model_name,
        "ownership": "Licensed", "message": f"License for {p.model_name} activated."
    }'''
content = re.sub(marketplace_endpoints_pattern, marketplace_endpoints_new, content, flags=re.DOTALL)

# 7. Model Feedback
feedback_pattern = r'@app\.post\("/api/models/feedback"\).*?@app\.get\("/api/models/feedback"\).*?return model_feedback_store'
feedback_new = '''@app.post("/api/models/feedback")
async def submit_model_feedback(p: ModelFeedbackPayload):
    DatabaseManager.add_feedback(p.model_id, p.model_name, p.doctor_name, p.accuracy_observation, p.notes)
    EnclaveAuditor.commit_audit_log(
        modality="Feedback Submission", format="JSON", champion=p.model_name,
        confidence="N/A", action="FEEDBACK_SUBMITTED", doctor_notes=p.accuracy_observation
    )
    return {"status": "received", "model_id": p.model_id}

@app.get("/api/models/feedback")
async def get_model_feedback():
    return DatabaseManager.get_feedback()'''
content = re.sub(feedback_pattern, feedback_new, content, flags=re.DOTALL)

# 8. My Models
my_models_pattern = r'@app\.get\("/api/models/my-models"\).*?return prebuilt \+ custom'
my_models_new = '''@app.get("/api/models/my-models")
async def get_my_models():
    return DatabaseManager.get_deployed_models()'''
content = re.sub(my_models_pattern, my_models_new, content, flags=re.DOTALL)

# 9. Hospital Integrations & Lab Sources
content = content.replace('return INTEGRATIONS', 'return DatabaseManager.get_integrations()')
content = content.replace('return LAB_IMAGING_SOURCES', 'return DatabaseManager.get_lab_sources()')

# 10. Doctors
doctors_pattern = r'@app\.get\("/api/hospital/doctors"\).*?return hospital_doctors_store\n.*?class AddDoctorPayload.*?return \{"status": "added", "license": p\.license_number\}'
doctors_new = '''@app.get("/api/hospital/doctors")
async def get_hospital_doctors():
    # Fetch all doctors (for demo, hospital_id is assumed 1)
    return DatabaseManager.get_doctors_for_hospital(1, "AIIMS New Delhi")

class AddDoctorPayload(BaseModel):
    license_number: str
    name: Optional[str] = "Dr. Unknown"
    hospital_name: Optional[str] = "AIIMS New Delhi"

@app.post("/api/hospital/doctors")
async def add_doctor_to_hospital(p: AddDoctorPayload):
    try:
        temp_pass = DatabaseManager.add_doctor_by_hospital(1, p.hospital_name, p.license_number, p.name)
        return {"status": "added", "license": p.license_number, "temp_password": temp_pass}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))'''
content = re.sub(doctors_pattern, doctors_new, content, flags=re.DOTALL)

# 11. Dashboards
dash_doc_pattern = r'recent_patients": patient_store\[:5\]'
content = content.replace(dash_doc_pattern, 'recent_patients": DatabaseManager.get_all_patients()[:5]')
dash_hos_pattern = r'recent_feedback": model_feedback_store'
content = content.replace(dash_hos_pattern, 'recent_feedback": DatabaseManager.get_feedback()[:5]')

with open('app/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Rewrite complete.")
