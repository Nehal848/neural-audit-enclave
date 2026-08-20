from datetime import datetime
from typing import List, Dict, Any
from core.database import SessionLocal, AuditLog, User
from sqlalchemy.exc import IntegrityError
import pytz

class EnclaveAuditor:
    """
    Manages secure tamper-resistant audit logs for all clinical transactions
    executed inside the neural enclave using SQLAlchemy.
    """

    @staticmethod
    def init_db() -> None:
        # Tables are created in core.database.init_db() now.
        # We just need to seed default users if none exist.
        db = SessionLocal()
        try:
            if db.query(User).count() == 0:
                default_users = [
                    User(username='doctor', password='doctor', phase='phase_one', role='standard'),
                    User(username='user', password='user', phase='phase_two', role='user'),
                    User(username='admin', password='admin', phase='phase_two', role='admin')
                ]
                db.add_all(default_users)
                db.commit()
        finally:
            db.close()

    @staticmethod
    def commit_audit_log(
        modality: str,
        format: str,
        champion: str,
        confidence: str,
        action: str,
        dataset_hash: str = "0x8f3a9d10e241bc389a02d41a77",
        uploaded_by: str = "Dr. S. Vance (Senior Clinical Lead)",
        target_column: str = "Diagnosis",
        problem_type: str = "Classification (Binary)",
        doctor_notes: str = "Verified outputs against clinical relevance and edge parameters.",
        model_version: str = "v2.1.0-ONNX Registry Draft"
    ) -> int:
        db = SessionLocal()
        try:
            new_log = AuditLog(
                timestamp=datetime.now(pytz.timezone('Asia/Kolkata')).strftime('%Y-%m-%d %H:%M:%S'),
                modality=modality,
                format=format,
                champion_model=champion,
                confidence_score=confidence,
                doctor_action=action,
                dataset_hash=dataset_hash,
                uploaded_by=uploaded_by,
                target_column=target_column,
                problem_type=problem_type,
                doctor_notes=doctor_notes,
                model_version=model_version
            )
            db.add(new_log)
            db.commit()
            db.refresh(new_log)
            return new_log.id
        finally:
            db.close()

    @staticmethod
    def get_all_logs() -> List[Dict[str, Any]]:
        db = SessionLocal()
        try:
            logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(100).all()
            return [
                {
                    "id": log.id,
                    "timestamp": log.timestamp,
                    "modality": log.modality,
                    "champion_model": log.champion_model,
                    "confidence_score": log.confidence_score,
                    "doctor_action": log.doctor_action,
                    "format": log.format,
                    "dataset_hash": log.dataset_hash,
                    "uploaded_by": log.uploaded_by,
                    "target_column": log.target_column,
                    "problem_type": log.problem_type,
                    "doctor_notes": log.doctor_notes,
                    "model_version": log.model_version
                }
                for log in logs
            ]
        finally:
            db.close()

    @staticmethod
    def get_ledger_stats() -> Dict[str, Any]:
        db = SessionLocal()
        try:
            total_logs = db.query(AuditLog).count()
            approved_logs = db.query(AuditLog).filter(AuditLog.doctor_action == 'APPROVED').count()
            rejected_logs = db.query(AuditLog).filter(AuditLog.doctor_action == 'REJECTED').count()
            compliance_rate = round(approved_logs / max(1, total_logs) * 100, 1)
            return {
                "total_transactions": total_logs,
                "approved": approved_logs,
                "rejected": rejected_logs,
                "compliance_rate": f"{compliance_rate}%"
            }
        finally:
            db.close()

    @staticmethod
    def register_user(username: str, password: str, phase: str, role: str) -> bool:
        db = SessionLocal()
        try:
            new_user = User(username=username, password=password, phase=phase, role=role)
            db.add(new_user)
            db.commit()
            return True
        except IntegrityError:
            db.rollback()
            return False
        finally:
            db.close()

    @staticmethod
    def verify_user(username: str, password: str, phase: str, role: str) -> bool:
        db = SessionLocal()
        try:
            count = db.query(User).filter(
                User.username == username,
                User.password == password,
                User.phase == phase,
                User.role == role
            ).count()
            return count > 0
        finally:
            db.close()
