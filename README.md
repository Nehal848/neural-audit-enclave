# 🏥 Secure Med Enclosure — Neural Audit Enclave

A FastAPI-powered Hospital AI Ecosystem with an enclave-grade audit trail, AI model marketplace, patient management, and AutoML capabilities.

---

## 🚀 How to Run (Anyone, Any Machine)

> **No Docker, no complex setup — just Python!**

### ✅ Prerequisites

- Python **3.10 or higher** → [Download here](https://www.python.org/downloads/)
- Git (optional, for cloning) → [Download here](https://git-scm.com/)

---

### 📦 Step 1 — Get the Code

**Option A: Clone with Git**
```bash
git clone <your-repo-url>
cd secure_med_enclosure
```

**Option B: Download ZIP**
Download and extract the ZIP from GitHub, then open a terminal in that folder.

---

### 🐍 Step 2 — Create a Virtual Environment

```bash
# Create the virtual environment
python -m venv venv
```

**Activate it:**

| OS | Command |
|----|---------|
| Windows (CMD) | `venv\Scripts\activate` |
| Windows (PowerShell) | `venv\Scripts\Activate.ps1` |
| macOS / Linux | `source venv/bin/activate` |

---

### 📚 Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

---

### ▶️ Step 4 — Run the App

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Now open your browser and go to:

**👉 http://localhost:8000**

---

## 🪟 Running on Windows — Quick Guide

Open **PowerShell** or **Command Prompt** and run these commands one by one:

```powershell
# 1. Go into the project folder
cd path\to\secure_med_enclosure

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
venv\Scripts\Activate.ps1

# 4. Install packages
pip install -r requirements.txt

# 5. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open **http://localhost:8000** in your browser. ✅

> **PowerShell tip:** If you see an error about script execution policy, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## 🐧 Running on Linux / macOS

```bash
cd secure_med_enclosure
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📁 Project Structure

```
secure_med_enclosure/
├── app/
│   ├── main.py           # FastAPI application (all routes & logic)
│   └── index.html        # Frontend UI (served by FastAPI)
├── core/
│   ├── auditor.py        # Enclave audit trail (SQLite)
│   └── database.py       # All DB operations
├── config.py             # DB path config
├── enclave_audit.db      # SQLite database (auto-created)
├── requirements.txt      # Python dependencies
└── README.md
```

---

## 🌐 API Docs

Once the app is running, visit:
- **Swagger UI** → http://localhost:8000/docs
- **ReDoc** → http://localhost:8000/redoc

---

## ⚙️ Environment Variables (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `HF_TOKEN` | HuggingFace API token for BiomedBERT inference | *(empty — uses mock)* |

Set it on Windows:
```powershell
$env:HF_TOKEN = "hf_your_token_here"
```

Set it on Linux/macOS:
```bash
export HF_TOKEN="hf_your_token_here"
```

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| `python` not found | Use `python3` instead, or reinstall Python and check "Add to PATH" |
| `uvicorn` not found | Make sure the venv is activated before installing |
| Port 8000 in use | Change port: `--port 8080` |
| PowerShell script error | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again inside the venv |
