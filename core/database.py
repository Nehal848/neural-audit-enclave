import sqlite3
import os
import json
import random
import string
from typing import List, Dict, Any
from config import DB_PATH

APP_DB_PATH = "hospital_ecosystem.db"

def _get_conn():
    conn = sqlite3.connect(APP_DB_PATH, timeout=10, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.row_factory = sqlite3.Row
    return conn

class DatabaseManager:
    @staticmethod
    def init_db():
        with _get_conn() as conn:
            cursor = conn.cursor()
            
            # Hospitals
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hospitals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    reg_no TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    address TEXT,
                    admin_name TEXT,
                    admin_email TEXT,
                    email TEXT,
                    phone TEXT,
                    password TEXT NOT NULL
                )
            """)
            
            # Doctors
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS doctors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    license_no TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    state TEXT,
                    email TEXT,
                    phone TEXT,
                    hospital_id INTEGER,
                    hospital_name TEXT,
                    password TEXT NOT NULL,
                    status TEXT DEFAULT 'Pending' -- 'Active' or 'Pending'
                )
            """)
            
            # Patients
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS patients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pt_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    age INTEGER,
                    symptoms TEXT,
                    hospital_id INTEGER,
                    doctor_id INTEGER
                )
            """)
            
            # Marketplace Models
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS marketplace_models (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    price TEXT,
                    accuracy REAL,
                    version TEXT,
                    formats TEXT, -- JSON array
                    input_types TEXT, -- JSON array
                    type TEXT,
                    description TEXT
                )
            """)
            
            # Deployed Models (Hospital's active models)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS deployed_models (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_id TEXT NOT NULL,
                    hospital_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    ownership TEXT NOT NULL, -- 'Licensed' or 'Hospital'
                    accuracy REAL,
                    version TEXT,
                    type TEXT,
                    status TEXT DEFAULT 'Active'
                )
            """)
            
            # Feedback
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model_feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_id TEXT NOT NULL,
                    model_name TEXT,
                    doctor_name TEXT,
                    accuracy_observation TEXT,
                    notes TEXT,
                    timestamp TEXT
                )
            """)
            
            conn.commit()
            
            # Check if seeded
            cursor.execute("SELECT COUNT(*) FROM hospitals")
            if cursor.fetchone()[0] == 0:
                DatabaseManager._seed_data(cursor)
                conn.commit()

    @staticmethod
    def _seed_data(cursor):
        # Seed Hospitals
        hospitals = [
            ("HOSP-DEL-001", "AIIMS New Delhi", "Ansari Nagar, New Delhi 110029", "Dr. M Srinivas", "admin@aiims.edu", "contact@aiims.edu", "+91-11-26588500", "admin"),
            ("HOSP-MH-001", "Apollo Hospitals Mumbai", "Navi Mumbai, MH 400614", "Rajesh Kumar", "rajesh@apollo.in", "info@apollo.in", "+91-22-33503350", "admin"),
            ("HOSP-KA-001", "Fortis Hospital Bangalore", "Bannerghatta Road, BLR 560076", "Priya Singh", "psingh@fortis.in", "contact@fortis.in", "+91-80-66214444", "admin")
        ]
        cursor.executemany("INSERT INTO hospitals (reg_no, name, address, admin_name, admin_email, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", hospitals)
        
        # Seed Doctors
        doctors = [
            ("MED-11001-DL", "Dr. Rahul Sharma", "Delhi", "rsharma@aiims.edu", "+91-9876543210", 1, "AIIMS New Delhi", "doctor", "Active"),
            ("MED-40001-MH", "Dr. Neha Patel", "Maharashtra", "npatel@apollo.in", "+91-9876500001", 2, "Apollo Hospitals Mumbai", "doctor", "Active"),
            ("MED-56001-KA", "Dr. Amit Singh", "Karnataka", "asingh@fortis.in", "+91-9876500002", 3, "Fortis Hospital Bangalore", "doctor", "Active")
        ]
        cursor.executemany("INSERT INTO doctors (license_no, name, state, email, phone, hospital_id, hospital_name, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", doctors)
        
        # Seed Patients
        patients = [
            ("PT-1001", "Rajiv Desai", 42, "Persistent dry cough, mild fever, chest tightness.", 1, 1),
            ("PT-1002", "Sunita Rao", 35, "Polydipsia, polyuria, frequent fatigue.", 2, 2),
            ("PT-1003", "Anil Kapoor", 45, "Chronic productive cough with blood-tinged sputum.", 3, 3),
            ("PT-1004", "Meera Reddy", 28, "Occasional mild headache, otherwise asymptomatic.", 1, 1)
        ]
        cursor.executemany("INSERT INTO patients (pt_id, name, age, symptoms, hospital_id, doctor_id) VALUES (?, ?, ?, ?, ?, ?)", patients)
        
        # Seed Marketplace Models
        market_models = [
            ("pneu_v3", "Pneumonia Detection Pro", "$1,499", 97.2, "v3.0", '["Image", "DICOM", "Tabular", "Text"]', '["Chest X-Ray", "CT Scan", "CSV Lab Data"]', "Classification", "Enterprise-grade pneumonia detection with DICOM support."),
            ("diab_v2", "Diabetes Risk Predictor", "$1,299", 94.5, "v2.1", '["Tabular", "Text"]', '["Lab Values", "EHR Notes", "CSV"]', "Classification", "Predicts diabetes onset risk using clinical history."),
            ("cance_v4", "Multi-Cancer Screener", "$2,999", 98.1, "v4.0", '["Image", "DICOM", "Text"]', '["MRI", "CT Scan", "Pathology Report"]', "Classification", "Screens for multiple cancer types."),
            ("cardio_v1", "Cardiac Risk Predictor", "$1,199", 95.3, "v1.0", '["Tabular", "ECG", "Text"]', '["ECG Data", "Lab Results", "Clinical Notes"]', "Regression", "Predicts 12-month cardiac event risk."),
            ("tb_v2", "Tuberculosis Detector", "$899", 96.0, "v2.0", '["Image", "DICOM", "Tabular"]', '["Chest X-Ray", "CT Scan", "Lab Results"]', "Classification", "High-sensitivity TB detection from chest imaging."),
            ("brain_v1", "Brain Tumor Classifier", "$2,499", 97.8, "v1.5", '["Image", "DICOM"]', '["MRI", "CT Scan"]', "Classification", "Classifies glioma, meningioma, and pituitary tumors.")
        ]
        cursor.executemany("INSERT INTO marketplace_models (id, name, price, accuracy, version, formats, input_types, type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", market_models)
        
        # Seed Deployed Models (for AIIMS / Hospital 1)
        deployed = [
            ("pneu_v3", 1, "Pneumonia Detection Pro", "Licensed", 97.2, "v3.0", "Classification", "Active"),
            ("cance_v4", 1, "Multi-Cancer Screener", "Licensed", 98.1, "v4.0", "Classification", "Active"),
            ("custom_1", 1, "AIIMS Retina Scanner", "Hospital", 95.5, "v1.0.0-ONNX", "Classification", "Active"),
            ("diab_v2", 2, "Diabetes Risk Predictor", "Licensed", 94.5, "v2.1", "Classification", "Active")
        ]
        cursor.executemany("INSERT INTO deployed_models (model_id, hospital_id, name, ownership, accuracy, version, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", deployed)

    # ------------------- Hospitals -------------------
    @staticmethod
    def get_hospital_by_reg(reg_no):
        with _get_conn() as c:
            row = c.execute("SELECT * FROM hospitals WHERE reg_no = ?", (reg_no,)).fetchone()
            return dict(row) if row else None
            
    @staticmethod
    def create_hospital(data: dict):
        with _get_conn() as c:
            c.execute("""
                INSERT INTO hospitals (reg_no, name, address, admin_name, admin_email, email, phone, password)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (data['reg_no'], data['hospital_name'], data['address'], data['admin_name'], data['admin_email'], data['email'], data['phone'], data['password']))
            c.commit()

    # ------------------- Doctors -------------------
    @staticmethod
    def get_doctor_by_license(license_no):
        with _get_conn() as c:
            row = c.execute("SELECT * FROM doctors WHERE license_no = ?", (license_no,)).fetchone()
            return dict(row) if row else None
            
    @staticmethod
    def create_doctor(data: dict):
        # Find hospital by name if not provided
        hospital_id = data.get('hospital_id')
        if not hospital_id and data.get('hospital_name'):
            with _get_conn() as c:
                h = c.execute("SELECT id FROM hospitals WHERE name = ?", (data['hospital_name'],)).fetchone()
                if h:
                    hospital_id = h['id']
                    
        with _get_conn() as c:
            # Check if exists (e.g. pre-registered by hospital)
            existing = c.execute("SELECT id FROM doctors WHERE license_no = ?", (data['license_no'],)).fetchone()
            if existing:
                c.execute("""
                    UPDATE doctors 
                    SET name = ?, state = ?, email = ?, phone = ?, hospital_id = ?, hospital_name = ?, password = ?, status = 'Active'
                    WHERE license_no = ?
                """, (data['full_name'], data['state'], data['email'], data['phone'], hospital_id, data['hospital_name'], data['password'], data['license_no']))
            else:
                c.execute("""
                    INSERT INTO doctors (license_no, name, state, email, phone, hospital_id, hospital_name, password, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
                """, (data['license_no'], data['full_name'], data['state'], data['email'], data['phone'], hospital_id, data['hospital_name'], data['password']))
            c.commit()
            
    @staticmethod
    def get_doctors_for_hospital(hospital_id=None, hospital_name=None):
        with _get_conn() as c:
            rows = c.execute("SELECT * FROM doctors WHERE hospital_id = ? OR hospital_name = ?", (hospital_id, hospital_name)).fetchall()
            return [dict(r) for r in rows]

    @staticmethod
    def add_doctor_by_hospital(hospital_id, hospital_name, license_no, name):
        temp_pass = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        with _get_conn() as c:
            # Check if doctor already exists
            existing = c.execute("SELECT id FROM doctors WHERE license_no = ?", (license_no,)).fetchone()
            if existing:
                raise Exception("Doctor with this license already exists.")
            c.execute("""
                INSERT INTO doctors (license_no, name, hospital_id, hospital_name, password, status)
                VALUES (?, ?, ?, ?, ?, 'Pending')
            """, (license_no, name, hospital_id, hospital_name, temp_pass))
            c.commit()
        return temp_pass

    # ------------------- Patients -------------------
    @staticmethod
    def get_all_patients():
        with _get_conn() as c:
            rows = c.execute("SELECT * FROM patients ORDER BY id DESC").fetchall()
            return [dict(r) for r in rows]

    @staticmethod
    def add_patient(pt_id, name, age, symptoms):
        with _get_conn() as c:
            c.execute("INSERT INTO patients (pt_id, name, age, symptoms) VALUES (?, ?, ?, ?)", (pt_id, name, age, symptoms))
            c.commit()

    # ------------------- Models & Feedback -------------------
    @staticmethod
    def get_marketplace_models():
        with _get_conn() as c:
            rows = c.execute("SELECT * FROM marketplace_models").fetchall()
            return [dict(r) for r in rows]
            
    @staticmethod
    def get_deployed_models(hospital_id=None):
        with _get_conn() as c:
            if hospital_id:
                rows = c.execute("SELECT * FROM deployed_models WHERE hospital_id = ?", (hospital_id,)).fetchall()
            else:
                rows = c.execute("SELECT * FROM deployed_models").fetchall()
            return [dict(r) for r in rows]
            
    @staticmethod
    def purchase_model(hospital_id, model_id, model_name, type_val, accuracy, version):
        with _get_conn() as c:
            c.execute("""
                INSERT INTO deployed_models (model_id, hospital_id, name, ownership, accuracy, version, type, status)
                VALUES (?, ?, ?, 'Licensed', ?, ?, ?, 'Active')
            """, (model_id, hospital_id, model_name, accuracy, version, type_val))
            c.commit()
            
    @staticmethod
    def add_custom_model(hospital_id, model_id, name, accuracy):
        with _get_conn() as c:
            c.execute("""
                INSERT INTO deployed_models (model_id, hospital_id, name, ownership, accuracy, version, type, status)
                VALUES (?, ?, ?, 'Hospital', ?, 'v1.0.0-ONNX', 'Custom AutoML', 'Active')
            """, (model_id, hospital_id, name, accuracy))
            c.commit()

    @staticmethod
    def add_feedback(model_id, model_name, doctor_name, observation, notes):
        from datetime import datetime
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        with _get_conn() as c:
            c.execute("""
                INSERT INTO model_feedback (model_id, model_name, doctor_name, accuracy_observation, notes, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (model_id, model_name, doctor_name, observation, notes, ts))
            c.commit()
            
    @staticmethod
    def get_feedback():
        with _get_conn() as c:
            rows = c.execute("SELECT * FROM model_feedback ORDER BY id DESC LIMIT 50").fetchall()
            return [dict(r) for r in rows]

    @staticmethod
    def get_integrations():
        with _get_conn() as c:
            try:
                rows = c.execute("SELECT * FROM integrations").fetchall()
                if rows: return [dict(r) for r in rows]
            except sqlite3.OperationalError:
                pass
        return [
            {"system": "MRI Machine", "type": "Imaging", "connected_models": ["Brain Tumor Detection", "Cancer Detection"], "status": "Active", "last_sync": "2 min ago", "throughput": "15.2 MB/s", "error_rate": "0.00%"},
            {"system": "CT Scan", "type": "Imaging", "connected_models": ["Pneumonia Detection", "Cancer Detection", "TB Detection"], "status": "Active", "last_sync": "5 min ago", "throughput": "12.4 MB/s", "error_rate": "0.00%"},
            {"system": "X-Ray (PACS)", "type": "Imaging", "connected_models": ["Pneumonia Detection", "TB Detection"], "status": "Active", "last_sync": "3 min ago", "throughput": "8.1 MB/s", "error_rate": "0.02%"},
            {"system": "Blood Lab Analyzer", "type": "Laboratory", "connected_models": ["Diabetes Detection", "Blood Cancer Detection"], "status": "Active", "last_sync": "1 min ago", "throughput": "2.3 MB/s", "error_rate": "0.00%"},
            {"system": "Pathology Lab", "type": "Laboratory", "connected_models": ["Cancer Detection", "Blood Cancer Detection"], "status": "In Use", "last_sync": "8 min ago", "throughput": "4.7 MB/s", "error_rate": "0.01%"},
            {"system": "ECG Monitor", "type": "Cardiology", "connected_models": [], "status": "Disconnected", "last_sync": "2h ago", "throughput": "0 MB/s", "error_rate": "N/A"},
            {"system": "EHR System", "type": "Records", "connected_models": ["Diabetes Detection", "Pneumonia Detection"], "status": "Active", "last_sync": "Just now", "throughput": "1.8 MB/s", "error_rate": "0.00%"},
            {"system": "EMR System", "type": "Records", "connected_models": ["Diabetes Detection"], "status": "Active", "last_sync": "4 min ago", "throughput": "1.2 MB/s", "error_rate": "0.00%"},
            {"system": "CIS (Clinical Info)", "type": "Records", "connected_models": [], "status": "Unconnected", "last_sync": "Never", "throughput": "0 MB/s", "error_rate": "N/A"}
        ]

    @staticmethod
    def get_lab_sources():
        with _get_conn() as c:
            try:
                rows = c.execute("SELECT * FROM lab_sources").fetchall()
                if rows: return [dict(r) for r in rows]
            except sqlite3.OperationalError:
                pass
        return [
            {"source": "MRI", "type": "Imaging", "new_uploads": 8, "status": "Connected", "active": True, "findings": "8 new scans received — 2 flagged for review", "errors": None},
            {"source": "CT Scan", "type": "Imaging", "new_uploads": 9, "status": "Active", "active": True, "findings": "9 new CT studies queued for AI processing", "errors": None},
            {"source": "X-Ray", "type": "Imaging", "new_uploads": 12, "status": "Active", "active": True, "findings": "12 chest X-rays uploaded via PACS bridge", "errors": None},
            {"source": "Blood Report", "type": "Laboratory", "new_uploads": 6, "status": "Connected", "active": True, "findings": "6 new CBC panels — 1 showing elevated WBC", "errors": None},
            {"source": "Pathology Report", "type": "Laboratory", "new_uploads": 3, "status": "Active", "active": True, "findings": "3 biopsy reports awaiting AI classification", "errors": None},
            {"source": "ECG", "type": "Cardiology", "new_uploads": 0, "status": "Disconnected", "active": False, "findings": None, "errors": "Device offline — last heartbeat 2h ago"},
            {"source": "CIS", "type": "Records", "new_uploads": 10, "status": "Active", "active": True, "findings": "10 clinical info records synced", "errors": None},
            {"source": "EMR", "type": "Records", "new_uploads": 5, "status": "Active", "active": True, "findings": "5 EMR entries linked to active patients", "errors": None},
            {"source": "EHR", "type": "Records", "new_uploads": 10, "status": "Connected", "active": True, "findings": "10 EHR updates merged with patient profiles", "errors": None}
        ]
