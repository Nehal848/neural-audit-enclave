# -*- coding: utf-8 -*-
"""
TB Chest X-Ray Dataset - Test Script (v2)
Tests the platform's TB Detection model with real Kaggle dataset images.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import kagglehub
import os
import random
import base64

# Step 1: Load dataset (already cached)
print("=" * 60)
print("  Loading TB Chest X-Ray Dataset...")
print("=" * 60)

path = kagglehub.dataset_download("tawsifurrahman/tuberculosis-tb-chest-xray-dataset")
print(f"  [OK] Dataset path: {path}")

# Step 2: Properly categorize images by folder name
tb_images = []
normal_images = []

for root, dirs, files in os.walk(path):
    folder = os.path.basename(root)
    img_files = [os.path.join(root, f) for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if folder.lower() == "tuberculosis":
        tb_images.extend(img_files)
    elif folder.lower() == "normal":
        normal_images.extend(img_files)

total = len(tb_images) + len(normal_images)
print(f"\n  Total images:      {total}")
print(f"  Tuberculosis:      {len(tb_images)} ({len(tb_images)/total*100:.1f}%)")
print(f"  Normal:            {len(normal_images)} ({len(normal_images)/total*100:.1f}%)")

# Step 3: Test against platform API
print("\n" + "=" * 60)
print("  Testing Against Platform API")
print("=" * 60)

import httpx

API_BASE = "http://127.0.0.1:8000"

# Check server
print("\n  [1] Checking server...")
try:
    r = httpx.get(f"{API_BASE}/api/doctor/dashboard", timeout=5)
    if r.status_code == 200:
        dashboard = r.json()
        models = dashboard.get("active_models", [])
        print(f"  [OK] Server running with {len(models)} models")
    else:
        print(f"  [WARN] Status {r.status_code}")
        sys.exit(1)
except Exception as e:
    print(f"  [ERR] Server not reachable: {e}")
    sys.exit(1)

# Test with real images
random.seed(42)
NUM_TB_SAMPLES = 5
NUM_NORMAL_SAMPLES = 5

tb_samples = random.sample(tb_images, min(NUM_TB_SAMPLES, len(tb_images)))
normal_samples = random.sample(normal_images, min(NUM_NORMAL_SAMPLES, len(normal_images)))

results = {"correct": 0, "incorrect": 0, "errors": 0}

print(f"\n  [2] Testing {NUM_TB_SAMPLES} TB images + {NUM_NORMAL_SAMPLES} Normal images")
print("-" * 60)

# Test TB images
print("\n  >> TB-Positive Images:")
for img_path in tb_samples:
    img_name = os.path.basename(img_path)
    size_kb = os.path.getsize(img_path) / 1024
    
    with open(img_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()
    
    try:
        r = httpx.post(
            f"{API_BASE}/api/models/tb/predict",
            json={"image": img_b64, "model": "tb", "filename": img_name},
            timeout=15
        )
        if r.status_code == 200:
            data = r.json()
            pred = data.get("prediction", "?")
            conf = data.get("confidence", "?")
            sev = data.get("severity", "?")
            match = "CORRECT" if pred == "Tuberculosis" else "WRONG"
            if pred == "Tuberculosis":
                results["correct"] += 1
            else:
                results["incorrect"] += 1
            print(f"    {img_name:30s} | {size_kb:6.1f} KB | Pred: {pred:15s} | Conf: {conf}% | Sev: {sev:8s} | {match}")
        else:
            results["errors"] += 1
            print(f"    {img_name:30s} | ERROR: Status {r.status_code}")
    except Exception as e:
        results["errors"] += 1
        print(f"    {img_name:30s} | ERROR: {e}")

# Test Normal images
print("\n  >> Normal Images:")
for img_path in normal_samples:
    img_name = os.path.basename(img_path)
    size_kb = os.path.getsize(img_path) / 1024
    
    with open(img_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()
    
    try:
        r = httpx.post(
            f"{API_BASE}/api/models/tb/predict",
            json={"image": img_b64, "model": "tb", "filename": img_name},
            timeout=15
        )
        if r.status_code == 200:
            data = r.json()
            pred = data.get("prediction", "?")
            conf = data.get("confidence", "?")
            sev = data.get("severity", "?")
            match = "CORRECT" if pred == "Normal" else "WRONG"
            if pred == "Normal":
                results["correct"] += 1
            else:
                results["incorrect"] += 1
            print(f"    {img_name:30s} | {size_kb:6.1f} KB | Pred: {pred:15s} | Conf: {conf}% | Sev: {sev:8s} | {match}")
        else:
            results["errors"] += 1
            print(f"    {img_name:30s} | ERROR: Status {r.status_code}")
    except Exception as e:
        results["errors"] += 1
        print(f"    {img_name:30s} | ERROR: {e}")

# Summary
total_tested = results["correct"] + results["incorrect"] + results["errors"]
accuracy = (results["correct"] / max(1, results["correct"] + results["incorrect"])) * 100

print("\n" + "=" * 60)
print("  TEST RESULTS")
print("=" * 60)
print(f"  Total tested:    {total_tested}")
print(f"  Correct:         {results['correct']}")
print(f"  Incorrect:       {results['incorrect']}")
print(f"  Errors:          {results['errors']}")
print(f"  Accuracy:        {accuracy:.1f}%")
print(f"  Model:           TB Detection v2.1.0 (Demo Mode)")
print(f"  Dataset:         Kaggle TB Chest X-Ray ({total} images)")
print("=" * 60)

# Test /api/analyze endpoint too
print("\n  [3] Testing /api/analyze endpoint...")
sample_img = tb_samples[0]
with open(sample_img, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

try:
    r = httpx.post(
        f"{API_BASE}/api/analyze",
        json={"image": img_b64, "model": "tb", "filename": os.path.basename(sample_img)},
        timeout=15
    )
    if r.status_code == 200:
        data = r.json()
        print(f"  [OK] /api/analyze works!")
        print(f"       Prediction: {data.get('prediction')} | Confidence: {data.get('confidence')}%")
        print(f"       Classifications: {data.get('classifications')}")
        print(f"       Recommendations: {data.get('recommendations')}")
    else:
        print(f"  [ERR] Status {r.status_code}: {r.text[:200]}")
except Exception as e:
    print(f"  [ERR] {e}")

print("\n  Done!")
