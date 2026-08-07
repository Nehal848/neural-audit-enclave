"""
core/automl/explainer.py
Step 8 — SHAP explainability report + confusion matrix + natural-language explanation.
"""
import json
from pathlib import Path

import numpy as np
import joblib

from core.automl import job_manager as jm
from core.automl.job_manager import JobStatus


def explain(job_id: str):
    """Called directly after training finishes (same thread)."""
    job = jm.get_job(job_id)
    if not job:
        return

    jm.append_log(job_id, "[EXPLAINING] Generating explainability report...")

    metrics_raw = job.get("metrics") or {}
    if isinstance(metrics_raw, str):
        metrics_raw = json.loads(metrics_raw)

    model_path = job.get("model_path")
    if not model_path or not Path(model_path).exists():
        jm.append_log(job_id, "[EXPLAINING] No model file found, skipping SHAP.")
        _finish(job_id, metrics_raw, shap_values=[], explanation="Model file not found.")
        return

    try:
        saved = joblib.load(model_path)
        pipeline = saved.get("pipeline")
        feature_names = saved.get("feature_names", [])

        problem_type = metrics_raw.get("problem_type", "classification")
        all_results  = metrics_raw.get("all_results", [])
        champion     = metrics_raw.get("algorithm", "Unknown")

        shap_values = _compute_shap(pipeline, feature_names, job_id, problem_type)
        explanation  = _build_explanation(champion, all_results, metrics_raw)

        report = {
            "champion_algorithm": champion,
            "explanation": explanation,
            "feature_importance": shap_values,
            "confusion_matrix": metrics_raw.get("confusion_matrix", []),
            "metrics": {
                k: metrics_raw[k]
                for k in ("accuracy", "f1", "auc", "precision", "recall", "r2", "mae")
                if k in metrics_raw
            },
        }

        _finish(job_id, metrics_raw, shap_values, explanation, report)

    except Exception as e:
        jm.append_log(job_id, f"[EXPLAINING] SHAP failed (non-fatal): {e}")
        report = {
            "champion_algorithm": metrics_raw.get("algorithm", "Unknown"),
            "explanation": _build_explanation(
                metrics_raw.get("algorithm", "Unknown"),
                metrics_raw.get("all_results", []),
                metrics_raw,
            ),
            "feature_importance": [],
            "confusion_matrix": metrics_raw.get("confusion_matrix", []),
            "metrics": metrics_raw,
        }
        _finish(job_id, metrics_raw, [], report["explanation"], report)


def _compute_shap(pipeline, feature_names: list[str], job_id: str, problem_type: str) -> list[dict]:
    """Compute SHAP feature importances. Returns top-10 list of {feature, importance}."""
    if not feature_names:
        return []

    try:
        import shap

        model = pipeline.named_steps.get("model")
        scaler = pipeline.named_steps.get("scaler")

        # Load a small sample of the cleaned data for background
        upload_dir = jm.UPLOAD_ROOT / job_id
        cleaned_path = upload_dir / "cleaned.csv"
        if not cleaned_path.exists():
            return []

        import pandas as pd
        df = pd.read_csv(cleaned_path)
        X = df[[c for c in feature_names if c in df.columns]].fillna(0).values
        if scaler is not None:
            X = scaler.transform(X)

        # Use at most 200 rows for SHAP background
        X_bg = X[:min(200, len(X))]

        tree_models = ("XGBClassifier", "XGBRegressor", "LGBMClassifier", "LGBMRegressor",
                       "RandomForestClassifier", "RandomForestRegressor",
                       "GradientBoostingClassifier", "GradientBoostingRegressor")

        model_type = type(model).__name__
        if model_type in tree_models:
            explainer = shap.TreeExplainer(model, X_bg)
        else:
            explainer = shap.LinearExplainer(model, X_bg)

        shap_raw = explainer.shap_values(X_bg)

        if isinstance(shap_raw, list):
            # Multi-class: average abs across classes
            shap_arr = np.mean([np.abs(s) for s in shap_raw], axis=0)
        else:
            shap_arr = np.abs(shap_raw)

        mean_shap = shap_arr.mean(axis=0)
        top_idx   = np.argsort(mean_shap)[::-1][:10]

        result = []
        for idx in top_idx:
            if idx < len(feature_names):
                result.append({
                    "feature": feature_names[idx],
                    "importance": round(float(mean_shap[idx]), 6),
                })
        return result

    except Exception as e:
        jm.append_log(job_id, f"[EXPLAINING] SHAP warning: {e}")
        # Fallback: use sklearn feature_importances_ if available
        try:
            model = pipeline.named_steps.get("model")
            if hasattr(model, "feature_importances_"):
                fi = model.feature_importances_
                top_idx = np.argsort(fi)[::-1][:10]
                return [
                    {"feature": feature_names[i], "importance": round(float(fi[i]), 6)}
                    for i in top_idx if i < len(feature_names)
                ]
            if hasattr(model, "coef_"):
                coef = np.abs(model.coef_).mean(axis=0) if model.coef_.ndim > 1 else np.abs(model.coef_)
                top_idx = np.argsort(coef)[::-1][:10]
                return [
                    {"feature": feature_names[i], "importance": round(float(coef[i]), 6)}
                    for i in top_idx if i < len(feature_names)
                ]
        except Exception:
            pass
        return []


def _build_explanation(champion: str, all_results: list[dict], metrics: dict) -> str:
    """Build a human-readable explanation of why the champion was selected."""
    if not all_results:
        return f"{champion} was selected as the best model."

    key = "r2" if metrics.get("problem_type") == "regression" else "auc"
    sorted_results = sorted(all_results, key=lambda r: r.get(key, 0), reverse=True)

    lines = [f"{champion} was selected as the best-performing model based on {key.upper()} score."]
    lines.append("")
    lines.append("All algorithms evaluated (5-fold cross-validation):")
    for r in sorted_results:
        score = r.get(key, r.get("accuracy", 0))
        marker = " ← CHAMPION" if r["name"] == champion else ""
        lines.append(f"  • {r['name']}: {key.upper()} = {score:.4f}{marker}")

    acc = metrics.get("accuracy")
    auc = metrics.get("auc")
    f1  = metrics.get("f1")
    r2  = metrics.get("r2")

    lines.append("")
    if acc is not None:
        lines.append(f"Final test-set Accuracy: {acc:.4f} ({acc*100:.1f}%)")
    if auc is not None and auc > 0:
        lines.append(f"Final test-set AUC-ROC: {auc:.4f}")
    if f1 is not None:
        lines.append(f"Final test-set F1 (weighted): {f1:.4f}")
    if r2 is not None:
        lines.append(f"Final test-set R²: {r2:.4f}")

    return "\n".join(lines)


def _finish(job_id: str, metrics: dict, shap_values: list, explanation: str, report: dict | None = None):
    if report is None:
        report = {
            "champion_algorithm": metrics.get("algorithm", "Unknown"),
            "explanation": explanation,
            "feature_importance": shap_values,
            "confusion_matrix": metrics.get("confusion_matrix", []),
            "metrics": metrics,
        }
    jm.append_log(job_id, "[EXPLAINING] Explainability report ready.")
    jm.update_status(job_id, JobStatus.REPORT_READY, step=9, report=json.dumps(report))
