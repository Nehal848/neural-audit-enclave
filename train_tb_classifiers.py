# -*- coding: utf-8 -*-
"""
AutoML Training Script for TB Chest X-ray Dataset
Trains 5 Scikit-Learn classifiers and outputs the tournament results.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
import random
import time
import json
import base64
import numpy as np
from PIL import Image
import kagglehub

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

print("=" * 60)
print("  Starting AutoML Scikit-Learn Training Pipeline for TB")
print("=" * 60)

# Step 1: Load dataset path
path = kagglehub.dataset_download("tawsifurrahman/tuberculosis-tb-chest-xray-dataset")
base_dir = os.path.join(path, "TB_Chest_Radiography_Database")
print(f"  [OK] Dataset root: {base_dir}")

# Step 2: Properly collect image files
tb_dir = os.path.join(base_dir, "Tuberculosis")
normal_dir = os.path.join(base_dir, "Normal")

tb_files = [os.path.join(tb_dir, f) for f in os.listdir(tb_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
normal_files = [os.path.join(normal_dir, f) for f in os.listdir(normal_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

print(f"  Total Tuberculosis images: {len(tb_files)}")
print(f"  Total Normal images:       {len(normal_files)}")

# To keep training fast and memory efficient, use a balanced sample of 500 images per class
random.seed(42)
SAMPLE_SIZE = min(500, len(tb_files), len(normal_files))
print(f"  Sampling {SAMPLE_SIZE} images per class for training...")

selected_tb = random.sample(tb_files, SAMPLE_SIZE)
selected_normal = random.sample(normal_files, SAMPLE_SIZE)

# Step 3: Load and extract features (Resize to 32x32 and flatten grayscale values)
print("  Extracting image features (32x32 Grayscale pixels)...")
X = []
y = []

# Class labels: 1 for Tuberculosis, 0 for Normal
for img_path in selected_tb:
    try:
        with Image.open(img_path) as img:
            img_gray = img.convert('L').resize((32, 32))
            X.append(np.array(img_gray).flatten())
            y.append(1)
    except Exception as e:
        print(f"    Error reading {os.path.basename(img_path)}: {e}")

for img_path in selected_normal:
    try:
        with Image.open(img_path) as img:
            img_gray = img.convert('L').resize((32, 32))
            X.append(np.array(img_gray).flatten())
            y.append(0)
    except Exception as e:
        print(f"    Error reading {os.path.basename(img_path)}: {e}")

X = np.array(X, dtype=np.float32) / 255.0  # Normalize pixel values to [0, 1]
y = np.array(y, dtype=np.int32)

print(f"  Feature matrix shape: {X.shape}")
print(f"  Labels array shape:   {y.shape}")

# Step 4: Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print(f"  Train samples: {X_train.shape[0]} | Test samples: {X_test.shape[0]}")

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Step 5: Multi-Algorithm Tournament
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
champion_model = None

print("\n" + "-" * 50)
print("  Running Multi-Algorithm Tournament")
print("-" * 50)

for name, clf in models.items():
    t0 = time.time()
    # Train
    clf.fit(X_train_scaled, y_train)
    train_time = time.time() - t0
    
    # Predict
    preds = clf.predict(X_test_scaled)
    
    # Metrics
    acc = accuracy_score(y_test, preds) * 100
    f1 = f1_score(y_test, preds)
    prec = precision_score(y_test, preds)
    rec = recall_score(y_test, preds)
    
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
        champion_model = clf

# Flag the champion
for r in results:
    if r["name"] == champion_name:
        r["champion"] = True

print("-" * 50)
print(f"  🏆 Champion Model: {champion_name} ({champion_acc:.2f}% Accuracy)")
print("-" * 50)

# Save results
output_data = {
    "disease": "Tuberculosis (TB)",
    "records": X.shape[0],
    "test_split": 20,
    "champion_name": champion_name,
    "champion_accuracy": round(champion_acc, 2),
    "tournament": results
}

output_path = "app/automl_results.json"
with open(output_path, "w") as f:
    json.dump(output_data, f, indent=4)
print(f"  [OK] Saved results to {output_path}")
