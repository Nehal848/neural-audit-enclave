# -*- coding: utf-8 -*-
"""
Generalized AutoML Training Pipeline
Supports:
1. Image folder datasets (subfolders representing classes of images)
2. Tabular CSV datasets (columns representing features, target column representing outcome)
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
import time
import json
import argparse
import random
import numpy as np
import pandas as pd
from PIL import Image

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

# Classification Models
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.neural_network import MLPClassifier

# Regression Models
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.svm import SVR


def clean_identifier_columns(df, target_col):
    """Remove columns that are likely patient-identifying or metadata (IDs, names, address, phone)."""
    cols_to_drop = []
    id_keywords = ["name", "id", "mrn", "ssn", "phone", "address", "dob", "contact", "email", "date", "timestamp"]
    for col in df.columns:
        if col == target_col:
            continue
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in id_keywords):
            cols_to_drop.append(col)
    
    if cols_to_drop:
        print(f"  [Auto-Cleaning] Dropping identifier/metadata columns: {cols_to_drop}")
        df = df.drop(columns=cols_to_drop)
    return df


def run_tabular_automl(df, target_col, output_path):
    """Process tabular dataset, detect problem type, and train 5 regression/classification models."""
    print("  [AutoML Tabular] Processing dataset...")
    
    # 1. Drop rows where target is null
    df = df.dropna(subset=[target_col])
    
    # 2. Drop identifier columns
    df = clean_identifier_columns(df, target_col)
    
    X_raw = df.drop(columns=[target_col])
    y_raw = df[target_col]
    
    # 3. Detect problem type
    unique_targets = y_raw.nunique()
    is_numeric_target = pd.api.types.is_numeric_dtype(y_raw)
    
    # Heuristic: If target has few unique values or is categorical, it's classification.
    # Otherwise, it's regression.
    if unique_targets <= 10 or not is_numeric_target:
        problem_type = "Classification"
        # Encode target if it's categorical
        le = LabelEncoder()
        y = le.fit_transform(y_raw.astype(str))
        target_classes = [str(c) for c in le.classes_]
        class_balance_str = " / ".join([f"{c}: {np.sum(y == i)}" for i, c in enumerate(target_classes)])
    else:
        problem_type = "Regression"
        y = y_raw.values.astype(np.float32)
        target_classes = []
        class_balance_str = f"Range: {np.min(y):.2f} to {np.max(y):.2f}"
        
    print(f"  Problem type detected: {problem_type}")
    print(f"  Target: '{target_col}' | Unique values: {unique_targets}")
    print(f"  Class/Range distribution: {class_balance_str}")
    
    # 4. Preprocess features (One-hot encode categorical features, impute numericals)
    # Numerical features
    num_cols = X_raw.select_dtypes(include=[np.number]).columns.tolist()
    # Categorical features
    cat_cols = X_raw.select_dtypes(exclude=[np.number]).columns.tolist()
    
    print(f"  Numeric columns: {len(num_cols)} | Categorical columns: {len(cat_cols)}")
    
    # Impute numeric features with median
    for col in num_cols:
        X_raw[col] = X_raw[col].fillna(X_raw[col].median())
        
    # Impute categorical features with mode, then dummy encode
    for col in cat_cols:
        X_raw[col] = X_raw[col].fillna(X_raw[col].mode()[0] if not X_raw[col].mode().empty else "missing")
        
    if cat_cols:
        X = pd.get_dummies(X_raw, columns=cat_cols, drop_first=True)
    else:
        X = X_raw
        
    X = X.values.astype(np.float32)
    
    # 5. Split and scale
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 6. Tournament
    results = []
    champion_name = None
    champion_metric = -float('inf') if problem_type == "Classification" else -float('inf')
    
    if problem_type == "Classification":
        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "SVM (RBF)": SVC(probability=True, random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
            "Neural Network (MLP)": MLPClassifier(max_iter=500, random_state=42),
            "Gradient Boosting": HistGradientBoostingClassifier(random_state=42)
        }
        
        for name, clf in models.items():
            t0 = time.time()
            clf.fit(X_train_scaled, y_train)
            train_time = time.time() - t0
            
            preds = clf.predict(X_test_scaled)
            acc = accuracy_score(y_test, preds) * 100
            
            # Use average='macro' in case of multi-class
            f1 = f1_score(y_test, preds, average='macro')
            prec = precision_score(y_test, preds, average='macro', zero_division=0)
            rec = recall_score(y_test, preds, average='macro', zero_division=0)
            
            print(f"  {name:25s} | Acc: {acc:.2f}% | F1: {f1:.4f} | Time: {train_time:.2f}s")
            
            results.append({
                "name": name,
                "accuracy": round(acc, 2),
                "f1": round(f1, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "status": "done"
            })
            
            if acc > champion_metric:
                champion_metric = acc
                champion_name = name
    else:
        # Regression models
        models = {
            "Linear Regression": LinearRegression(),
            "Ridge Regression": Ridge(random_state=42),
            "Random Forest Regressor": RandomForestRegressor(n_estimators=100, random_state=42),
            "SVR (RBF)": SVR(),
            "Gradient Boosting Regressor": HistGradientBoostingRegressor(random_state=42)
        }
        
        for name, reg in models.items():
            t0 = time.time()
            reg.fit(X_train_scaled, y_train)
            train_time = time.time() - t0
            
            preds = reg.predict(X_test_scaled)
            r2 = r2_score(y_test, preds)
            mae = mean_absolute_error(y_test, preds)
            mse = mean_squared_error(y_test, preds)
            
            # Map R2 directly as accuracy metric (cap at 100%)
            acc = max(0.0, min(100.0, r2 * 100))
            
            print(f"  {name:25s} | R2: {r2:.4f} | MAE: {mae:.4f} | Time: {train_time:.2f}s")
            
            results.append({
                "name": name,
                "accuracy": round(acc, 2),
                "f1": round(r2, 4), # Represent R2 score as F1/Quality indicator
                "precision": round(mae, 4),
                "recall": round(mse, 4),
                "status": "done"
            })
            
            if r2 > champion_metric:
                champion_metric = r2
                champion_name = name
                
    # Flag the champion
    for r in results:
        if r["name"] == champion_name:
            r["champion"] = True
            
    # Output JSON results
    output_data = {
        "disease": "Tabular Predictor",
        "records": X.shape[0],
        "test_split": 20,
        "problem_type": problem_type,
        "target_column": target_col,
        "champion_name": champion_name,
        "champion_accuracy": round(max(0.0, champion_metric if problem_type == "Classification" else champion_metric * 100), 2),
        "tournament": results
    }
    
    with open(output_path, "w") as f:
        json.dump(output_data, f, indent=4)
        
    print(f"  🏆 Champion Model: {champion_name} (Acc/R2 Score: {output_data['champion_accuracy']:.2f}%)")
    print(f"  [OK] Saved results to {output_path}")


def run_image_automl(dataset_dir, disease_name, output_path):
    """Scan subdirectories, load images of different classes, and train 5 classifiers."""
    print(f"  [AutoML Image] Scanning directories under: {dataset_dir}")
    
    # 1. Identify subfolders
    subfolders = [d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))]
    
    # Check if there are nested train/test/val folders
    nested_folders = ["train", "test", "val", "train_images", "test_images"]
    for nf in nested_folders:
        if nf in subfolders:
            nf_path = os.path.join(dataset_dir, nf)
            nf_subfolders = [d for d in os.listdir(nf_path) if os.path.isdir(os.path.join(nf_path, d))]
            # Check if this subfolder contains images in its subfolders
            has_images = False
            for sub in nf_subfolders:
                sub_path = os.path.join(nf_path, sub)
                try:
                    img_files = [f for f in os.listdir(sub_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
                    if img_files:
                        has_images = True
                        break
                except Exception:
                    pass
            if has_images:
                print(f"  [AutoML Image] Found nested structure, using subfolder: '{nf}'")
                dataset_dir = nf_path
                subfolders = nf_subfolders
                break

    # Filter classes with images
    classes = []
    image_paths = {}
    for folder in subfolders:
        folder_path = os.path.join(dataset_dir, folder)
        try:
            img_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) 
                         if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
            if img_files:
                classes.append(folder)
                image_paths[folder] = img_files
        except Exception:
            pass
            
    if len(classes) < 2:
        # Fallback to scanning dataset_dir directly (binary: images vs normal or mock splits)
        raise ValueError(f"Found less than 2 classes with images. Classes identified: {classes}")
        
    print(f"  Classes identified: {classes}")
    
    # Sample up to 500 images per class
    SAMPLE_SIZE = 500
    X = []
    y = []
    
    random.seed(42)
    for class_idx, class_name in enumerate(classes):
        files = image_paths[class_name]
        selected_files = random.sample(files, min(SAMPLE_SIZE, len(files)))
        print(f"    Class '{class_name}': loaded {len(selected_files)} images.")
        
        for fp in selected_files:
            try:
                with Image.open(fp) as img:
                    img_gray = img.convert('L').resize((32, 32))
                    X.append(np.array(img_gray).flatten())
                    y.append(class_idx)
            except Exception:
                pass
                
    X = np.array(X, dtype=np.float32) / 255.0
    y = np.array(y, dtype=np.int32)
    
    print(f"  Loaded dataset: X shape {X.shape} | y shape {y.shape}")
    
    # 2. Split and scale
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 3. Tournament
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "SVM (RBF)": SVC(probability=True, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Neural Network (MLP)": MLPClassifier(max_iter=500, random_state=42),
        "HistGradientBoosting": HistGradientBoostingClassifier(random_state=42)
    }
    
    results = []
    champion_name = None
    champion_acc = 0.0
    
    print("\n" + "-" * 50)
    print("  Running Multi-Algorithm Tournament")
    print("-" * 50)
    
    for name, clf in models.items():
        t0 = time.time()
        clf.fit(X_train_scaled, y_train)
        train_time = time.time() - t0
        
        preds = clf.predict(X_test_scaled)
        
        acc = accuracy_score(y_test, preds) * 100
        f1 = f1_score(y_test, preds, average='macro')
        prec = precision_score(y_test, preds, average='macro', zero_division=0)
        rec = recall_score(y_test, preds, average='macro', zero_division=0)
        
        print(f"  {name:25s} | Acc: {acc:.2f}% | F1: {f1:.4f} | Time: {train_time:.2f}s")
        
        results.append({
            "name": name,
            "accuracy": round(acc, 2),
            "f1": round(f1, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "status": "done"
        })
        
        if acc > champion_acc:
            champion_acc = acc
            champion_name = name
            
    # Flag the champion
    for r in results:
        if r["name"] == champion_name:
            r["champion"] = True
            
    # Save results
    output_data = {
        "disease": disease_name or "Custom Image Classifier",
        "records": X.shape[0],
        "test_split": 20,
        "problem_type": "Binary/Multi-class Image Classification",
        "classes": classes,
        "champion_name": champion_name,
        "champion_accuracy": round(champion_acc, 2),
        "tournament": results
    }
    
    with open(output_path, "w") as f:
        json.dump(output_data, f, indent=4)
        
    print("-" * 50)
    print(f"  🏆 Champion Model: {champion_name} ({champion_acc:.2f}% Accuracy)")
    print("-" * 50)
    print(f"  [OK] Saved results to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generalized AutoML Tournament Pipeline")
    parser.add_argument("--dataset_path", type=str, required=True, help="Path to CSV dataset or folder containing subfolders of images")
    parser.add_argument("--target_column", type=str, default="", help="Name of the target column (for CSV datasets)")
    parser.add_argument("--disease", type=str, default="Custom Model", help="Name of the disease / model")
    parser.add_argument("--output_path", type=str, default="app/automl_results.json", help="Path to write the output JSON results")
    
    args = parser.parse_args()
    
    path = args.dataset_path.strip()
    if not os.path.exists(path) and len(path) >= 2 and path[1] == ':':
        drive = path[0].lower()
        remainder = path[2:].replace('\\', '/').lstrip('/')
        wsl_path = f"/mnt/{drive}/{remainder}"
        if os.path.exists(wsl_path):
            path = wsl_path
    if not os.path.exists(path) and not os.path.isabs(path):
        for cand in [os.path.join("app", path), os.path.join("app/storage/uploads", path), os.path.join("storage/uploads", path)]:
            if os.path.exists(cand):
                path = cand
                break

    if not os.path.exists(path):
        print(f"  [Error] Path does not exist: {path}")
        sys.exit(1)
        
    try:
        # Check if CSV
        if os.path.isfile(path) and path.lower().endswith('.csv'):
            df = pd.read_csv(path)
            # Find target column
            target = args.target_column.strip()
            if not target:
                # Find default target name
                common_targets = ["target", "label", "outcome", "diagnosis", "class", "disease", "blood_sugar_level"]
                for t in common_targets:
                    if t in df.columns:
                        target = t
                        break
                if not target:
                    target = df.columns[-1]  # Default to last column
            
            print(f"  Detected Tabular CSV dataset at {path}. Target: '{target}'")
            run_tabular_automl(df, target, args.output_path)
            
        else:
            # Assume directory of image subfolders
            # Scan inside if the path contains TB_Chest_Radiography_Database directory
            tb_path = os.path.join(path, "TB_Chest_Radiography_Database")
            if os.path.exists(tb_path):
                path = tb_path
            
            print(f"  Detected Image directory dataset at {path}.")
            run_image_automl(path, args.disease, args.output_path)
            
    except Exception as e:
        print(f"  [Error during training] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
