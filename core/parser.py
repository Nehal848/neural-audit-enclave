import io
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from app.engine import ClinicalFeatureEngine, InferenceTournamentEngine
from app.models.loader import ModelWeightLoader

class ClinicalDataParser:
    """
    Parses incoming data streams, applies feature transformations, and routes payloads
    to the appropriate enclave evaluation models (`InferenceTournamentEngine` & `ModelWeightLoader`).
    """
    @staticmethod
    def parse_tabular_payload(file_bytes: bytes) -> Tuple[pd.DataFrame, Dict[str, Any], Dict[str, Any]]:
        """
        Reads raw CSV/tabular bytes, extracts key features, runs feature scaling,
        and computes clinical triage evaluations.
        Returns: (processed_df, risk_evaluation, tournament_metrics)
        """
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception:
            # Fallback for structured text without clean headers
            text = file_bytes.decode('utf-8', errors='ignore')
            lines = [l.strip().split(',') for l in text.splitlines() if l.strip()]
            if len(lines) > 1:
                df = pd.DataFrame(lines[1:], columns=lines[0])
            else:
                df = pd.DataFrame([{"Blood_Sugar_Level": 120.0, "Age": 45, "prolonged_coughing": "yes"}])

        # Normalize and clean numeric columns using ClinicalFeatureEngine
        processed_df = ClinicalFeatureEngine.extract_features(df)
        
        # Run enclave clinical risk evaluation via InferenceTournamentEngine
        risk_evaluation = InferenceTournamentEngine.evaluate_clinical_risk(df)
        
        # Extract specific clinical indicators for respiratory & pathology weight loading
        metrics_dict = {}
        text_content = file_bytes.decode('utf-8', errors='ignore').lower()
        
        if "cough" in text_content or "yes" in text_content or "respiratory" in text_content:
            metrics_dict["prolonged_coughing"] = "yes"
        else:
            metrics_dict["prolonged_coughing"] = "no"
            
        if "family" in text_content or "history" in text_content:
            metrics_dict["family_history"] = "yes"
        else:
            metrics_dict["family_history"] = "no"

        tournament_result = ModelWeightLoader.predict_tabular_respiratory(metrics_dict)
        
        # Enhance tournament metrics with calculated triage scores from the engine
        if risk_evaluation.get("normalized_risk_score") is not None:
            triage_score = risk_evaluation["normalized_risk_score"]
            tournament_result["triage_category"] = risk_evaluation.get("triage_category", "Standard Monitoring")
            tournament_result["evaluated_features"] = risk_evaluation.get("evaluated_features", [])
            
        return processed_df, risk_evaluation, tournament_result

    @staticmethod
    def parse_vision_payload(file_bytes: bytes) -> Dict[str, Any]:
        """
        Processes vision/binary payloads through ModelWeightLoader for localized chest X-ray/pathology anomaly scores.
        """
        return ModelWeightLoader.predict_vision_pathology(file_bytes)

    @staticmethod
    def evaluate_patient_workflow(reports: dict, active_pipelines: list) -> dict:
        """
        Runs the AI Relevance Engine and executes diagnostic inference on relevant pipelines.
        reports: dict of {'imaging': bytes/str, 'lab': bytes/str, 'clinical_notes': str}
        active_pipelines: list of dicts specifying target pipelines
        """
        results = {}
        # relevance rules based on report types
        has_imaging = "imaging" in reports and reports["imaging"]
        has_lab = "lab" in reports and reports["lab"]
        has_notes = "clinical_notes" in reports and reports["clinical_notes"]
        
        # Check relevance for each active pipeline
        for pipeline in active_pipelines:
            p_name = pipeline["name"]
            p_id = pipeline["id"]
            
            # Simple relevance rules:
            # - Pneumonia/TB/Cancer are relevant if we have imaging or notes containing keywords
            # - Diabetes is relevant if we have lab CSV data or notes containing keywords
            relevant = False
            reason = "No relevant clinical reports found."
            
            notes_lower = str(reports.get("clinical_notes", "")).lower()
            
            if p_id == "pneumonia":
                if has_imaging:
                    relevant = True
                    reason = "Chest X-Ray / CT imaging found."
                elif has_notes and any(w in notes_lower for w in ["cough", "chest", "fever", "respiratory", "breath"]):
                    relevant = True
                    reason = "Clinical notes suggest respiratory symptoms."
            elif p_id == "tb":
                if has_imaging:
                    relevant = True
                    reason = "Chest imaging found."
                elif has_notes and any(w in notes_lower for w in ["cough", "fever", "hemoptysis", "weight loss", "night sweat"]):
                    relevant = True
                    reason = "Clinical notes indicate potential TB symptoms."
            elif p_id == "cancer":
                if has_imaging:
                    relevant = True
                    reason = "Thoracic CT scan / X-Ray found."
                elif has_notes and any(w in notes_lower for w in ["nodule", "mass", "smoking", "weight loss", "hemoptysis"]):
                    relevant = True
                    reason = "Clinical history indicates high oncological risk."
            elif p_id == "diabetes":
                if has_lab:
                    relevant = True
                    reason = "Lab panel / Blood chemistry data found."
                elif has_notes and any(w in notes_lower for w in ["sugar", "glucose", "thirst", "polyuria", "diabetic"]):
                    relevant = True
                    reason = "Symptomatology suggests glycemic imbalance."
            else:
                # Custom AutoML pipelines are checked based on pipeline name keywords
                p_name_lower = p_name.lower()
                if any(w in p_name_lower for w in ["heart", "cardio", "vascular"]):
                    if has_lab:
                        relevant = True
                        reason = "Lab panel / Lipid profile found."
                    elif has_notes and any(w in notes_lower for w in ["heart", "cardio", "chest pain", "angina"]):
                        relevant = True
                        reason = "Cardiac risk symptoms identified."
                elif any(w in p_name_lower for w in ["brain", "neuro", "tumor", "stroke"]):
                    if has_imaging:
                        relevant = True
                        reason = "Brain MRI/CT imaging scan found."
                    elif has_notes and any(w in notes_lower for w in ["headache", "dizziness", "neurological"]):
                        relevant = True
                        reason = "Neurological reports indicate possible lesions."
                else:
                    # Default custom pipeline relevance
                    if has_imaging or has_lab or has_notes:
                        relevant = True
                        reason = "General diagnostic indicators match custom pipeline specs."
            
            if relevant:
                # Run the model
                if p_id == "pneumonia":
                    pred = ModelWeightLoader.predict_pneumonia(reports)
                elif p_id == "tb":
                    pred = ModelWeightLoader.predict_tb(reports)
                elif p_id == "cancer":
                    pred = ModelWeightLoader.predict_cancer(reports)
                elif p_id == "diabetes":
                    pred = ModelWeightLoader.predict_diabetes(reports)
                else:
                    pred = ModelWeightLoader.predict_custom(p_name, reports)
                
                results[p_name] = {
                    "relevant": True,
                    "reason": reason,
                    "action": "RUN",
                    "champion": pred["champion"],
                    "confidence": pred["confidence"],
                    "score": pred.get("score", 0.75),
                    "pool": pred["pool"],
                    "questions": pred["questions"]
                }
            else:
                results[p_name] = {
                    "relevant": False,
                    "reason": reason,
                    "action": "SKIP",
                    "champion": "N/A",
                    "confidence": "N/A",
                    "score": 0.0,
                    "pool": {},
                    "questions": []
                }
        return results

