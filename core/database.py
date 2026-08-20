from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from config import DATABASE_URL
import json

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phase = Column(String, nullable=False)
    role = Column(String, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String, nullable=False)
    modality = Column(String, nullable=False)
    format = Column(String, nullable=False)
    champion_model = Column(String, nullable=False)
    confidence_score = Column(String, nullable=False)
    doctor_action = Column(String, nullable=False)
    
    # Extended fields
    dataset_hash = Column(String, default="0x8f3a9d10")
    uploaded_by = Column(String, default="Dr. S. Vance (Senior Clinical Lead)")
    target_column = Column(String, default="Diagnosis")
    problem_type = Column(String, default="Classification (Binary)")
    doctor_notes = Column(String, default="Verified against localized chest opacity markers.")
    model_version = Column(String, default="v2.1.0-ONNX Registry Draft")

class AutomlJob(Base):
    __tablename__ = "automl_jobs"
    id = Column(String, primary_key=True, index=True)
    hospital_id = Column(Integer, default=1)
    disease_name = Column(String)
    data_type = Column(String)
    status = Column(String)
    step = Column(Integer, default=1)
    file_path = Column(String)
    model_path = Column(String)
    config = Column(Text)       # JSON string
    profile = Column(Text)      # JSON string
    quality_score = Column(Float)
    training_progress = Column(String)
    metrics = Column(Text)      # JSON string
    report = Column(Text)       # JSON string
    error = Column(Text)
    logs = Column(Text)         # JSON array
    created_at = Column(String)
    updated_at = Column(String)
    evaluation_start_time = Column(String)
    rlhf_accuracy_score = Column(Float)
    governance_reason = Column(String)

# Helper functions to serialize/deserialize dicts safely
def serialize(obj):
    if obj is None: return None
    return json.dumps(obj)

def deserialize(obj_str, default=None):
    if not obj_str: return default
    try:
        return json.loads(obj_str)
    except:
        return default

def init_db():
    Base.metadata.create_all(bind=engine)
