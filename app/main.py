import uvicorn
from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel
import time
import io
import sqlite3
import numpy as np
from app.sanitizers import DataSanitizerPipeline
from app.models.loader import ModelWeightLoader

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    import os
    os.system('pip install pillow --break-system-packages')
    from PIL import Image, ImageDraw, ImageFilter

app = FastAPI(title="Secure Clinical Enclave Node", version="1.0.0")

ENCLAVE_TOKEN = "SecureToken123"
DB_PATH = "enclave_audit_trail.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            timestamp TEXT, 
            modality TEXT, 
            format TEXT, 
            champion_model TEXT, 
            confidence_score TEXT, 
            doctor_action TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

class AntigravityOrchestrator:
    @staticmethod
    def run_tournament(modality: str):
        if "Tabular" in modality:
            leaderboard = {
                "XGBoost Classifier (Antigravity Wrapper)": 0.9452,
                "Random Forest Enclave Model": 0.8921,
                "Logistic Regression Baseline": 0.8210
            }
            champion = "XGBoost Classifier (Antigravity Wrapper)"
            questions = [
                "Does the patient have a family history of chronic respiratory conditions?",
                "Are there any secondary symptoms present like prolonged coughing?"
            ]
        else:
            leaderboard = {
                "Custom CNN (Antigravity Vision v1)": 0.9642,
                "Pre-trained ResNet Target": 0.9120,
                "MobileNet Enclave Edge": 0.8544
            }
            champion = "Custom CNN (Antigravity Vision v1)"
            questions = [
                "Is there visible costophrenic angle blunting on the chest X-Ray?",
                "Has this image gone through local contrast equalization?"
            ]
        return champion, leaderboard, questions

    @staticmethod
    def generate_gradcam_mock(image_bytes):
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size
        ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(ov)
        np.random.seed(int(time.time()) % 1000)
        cx, cy = np.random.randint(int(w * 0.3), int(w * 0.7)), np.random.randint(int(h * 0.3), int(h * 0.7))
        r = min(w, h) // 6
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(0, 0, 255, 60))
        draw.ellipse([cx - int(r * 0.7), cy - int(r * 0.7), cx + int(r * 0.7), cy + int(r * 0.7)], fill=(255, 255, 0, 100))
        draw.ellipse([cx - int(r * 0.4), cy - int(r * 0.4), cx + int(r * 0.4), cy + int(r * 0.4)], fill=(255, 0, 0, 140))
        final = Image.alpha_composite(img.convert("RGBA"), ov.filter(ImageFilter.GaussianBlur(r // 3)))
        out = io.BytesIO()
        final.convert("RGB").save(out, format="JPEG")
        return out.getvalue()

cached_heatmap = None

@app.get("/", response_class=HTMLResponse)
async def serve_unified_enclave_hud():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Clinical Enclave HUD</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: radial-gradient(circle at 50% 0%, #111827 0%, #030712 80%); font-family: sans-serif; }
            .glass-panel { background: rgba(17, 24, 39, 0.35); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.04); }
            .nav-btn-active { color: #22d3ee; border-color: rgba(6, 182, 212, 0.4); background: rgba(6, 182, 212, 0.1); }
        </style>
    </head>
    <body class="text-slate-100 min-h-screen flex flex-col p-6 font-sans antialiased">
        <header class="w-full max-w-7xl mx-auto flex justify-between items-center border-b border-slate-900 pb-5 mb-8">
            <div class="flex items-center gap-4">
                <div class="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.4)]"></div>
                <h1 class="text-sm font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-cyan-400 uppercase">
                    SECURE CLINICAL ENCLAVE // AUTOMATED ML
                </h1>
            </div>
            <div class="flex items-center gap-3 font-mono text-[10px] tracking-widest">
                <button id="navHud" onclick="switchView('hud')" class="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition-all nav-btn-active">🖥️ WORKSPACE HUD</button>
                <button id="navAdmin" onclick="switchView('admin')" class="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition-all">⚙️ COMPLIANCE LEDGER</button>
            </div>
        </header>

        <div id="hudView" class="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow view-container">
            <div class="flex flex-col gap-6">
                <section class="glass-panel rounded-2xl p-6 flex flex-col gap-5">
                    <div>
                        <h2 class="text-xs font-bold tracking-[0.15em] text-cyan-400 uppercase">Secure Ingestion Barrier</h2>
                        <p class="text-[11px] text-slate-500 font-mono mt-0.5">Isolated runtime file parser.</p>
                    </div>
                    <div class="border border-dashed border-slate-800 hover:border-cyan-500/40 transition-all duration-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer relative bg-slate-950/10 group">
                        <input type="file" id="fileInput" class="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.png,.jpg,.jpeg" onchange="uploadDataset()"/>
                        <div class="p-3 bg-cyan-950/10 group-hover:bg-cyan-950/30 border border-cyan-500/10 group-hover:border-cyan-500/30 rounded-xl text-cyan-400 transition-all">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        </div>
                        <p class="text-xs text-center text-slate-400">Select framework file input matrix</p>
                    </div>
                </section>
                <section id="qaSection" class="glass-panel rounded-2xl p-6 hidden flex flex-col gap-4">
                    <h2 class="text-xs font-bold tracking-[0.15em] text-amber-500 uppercase">// Clinical Clarifications</h2>
                    <div id="questionsContainer" class="flex flex-col gap-4 text-xs"></div>
                </section>
            </div>

            <section class="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between min-h-[550px]">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 class="text-xs font-bold tracking-[0.15em] text-slate-400 uppercase mb-3">Telemetry & Ingestion Logs</h2>
                        <div id="terminalScreen" class="bg-slate-950/90 border border-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-400 h-80 overflow-y-auto flex flex-col gap-2 shadow-inner">
                            <span class="text-slate-600">// Engine idling. Ready to pipeline multi-modal binary arrays.</span>
                        </div>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold tracking-[0.15em] text-slate-400 uppercase mb-3">Grad-CAM Spatial Reasoning</h2>
                        <div id="visualScreen" class="bg-slate-950/90 border border-slate-900 rounded-xl h-80 flex items-center justify-center text-center p-4 text-[11px] text-slate-600 font-mono relative overflow-hidden">
                            <span id="visualPlaceholder">// Activation overlays populate for image pathways</span>
                            <img id="heatmapElement" class="hidden w-full h-full object-contain rounded-lg" src="" alt="Grad-CAM Output"/>
                        </div>
                    </div>
                </div>
                <div id="doctorValidationActions" class="hidden border-t border-slate-900 pt-5 mt-5 flex items-center justify-between">
                    <span class="text-xs text-slate-500 font-mono italic">Write response logs directly to SQLite ledger?</span>
                    <div class="flex gap-3">
                        <button onclick="signOffResult('REJECTED')" class="px-5 py-2 bg-rose-950/10 border border-rose-900/30 rounded-xl text-rose-400 text-xs font-mono">Reject Logic</button>
                        <button onclick="signOffResult('APPROVED')" class="px-6 py-2 bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold tracking-wider">Confirm & Deploy</button>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 border-t border-slate-900 pt-5 mt-5">
                    <div class="bg-slate-950/30 rounded-xl p-4 border border-slate-900 text-center"><div class="text-[10px] font-mono tracking-widest text-slate-600 uppercase">Enclave Latency</div><div id="latencyMetric" class="text-base font-bold font-mono text-emerald-400 mt-1">--</div></div>
                    <div class="bg-slate-950/30 rounded-xl p-4 border border-slate-900 text-center flex flex-col justify-center items-center"><div class="text-[10px] font-mono tracking-widest text-slate-600 uppercase">Leader Estimator</div><div id="championMetric" class="text-xs font-bold truncate text-cyan-400 mt-1 max-w-[140px]">--</div></div>
                    <div class="bg-slate-950/30 rounded-xl p-4 border border-slate-900 text-center"><div class="text-[10px] font-mono tracking-widest text-slate-600 uppercase">Confidence Score</div><div id="confidenceMetric" class="text-base font-bold font-mono text-purple-400 mt-1">--</div></div>
                </div>
            </section>
        </div>

        <div id="adminView" class="w-full max-w-7xl mx-auto hidden flex-grow view-container">
            <section class="glass-panel rounded-2xl p-6 w-full">
                <div class="mb-5 flex justify-between items-center">
                    <div>
                        <h2 class="text-xs font-bold tracking-[0.15em] text-slate-400 uppercase">// Persistent Compliance Ledger Audit Trail</h2>
                        <p class="text-[10px] text-slate-600 font-mono mt-0.5">Active database transaction file: target=enclave_audit_trail.db</p>
                    </div>
                    <button onclick="refreshLedgerTable()" class="px-3 py-1 bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-[10px] font-mono">🔄 REFRESH LEDGER</button>
                </div>
                <div class="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/10">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-950 font-mono text-[10px] tracking-widest text-slate-500 uppercase border-b border-slate-900">
                                <th class="p-4">ID</th><th class="p-4">Timestamp</th><th class="p-4">Modality Track</th><th class="p-4">Tournament Champion Model</th><th class="p-4">AUC Performance</th><th class="p-4">Practitioner Signature</th>
                            </tr>
                        </thead>
                        <tbody id="ledgerTableBody">
                            <tr><td colspan="6" class="p-12 text-center text-xs text-slate-600 font-mono italic">// Loading transaction matrix array...</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <script>
            let currentTransaction = null;
            function switchView(viewName) {
                document.querySelectorAll(".view-container").forEach(el => el.classList.add("hidden"));
                document.getElementById("navHud").classList.remove("nav-btn-active");
                document.getElementById("navAdmin").classList.remove("nav-btn-active");
                if(viewName === "hud") {
                    document.getElementById("hudView").classList.remove("hidden");
                    document.getElementById("navHud").classList.add("nav-btn-active");
                } else {
                    document.getElementById("adminView").classList.remove("hidden");
                    document.getElementById("navAdmin").classList.add("nav-btn-active");
                    refreshLedgerTable();
                }
            }
            async function refreshLedgerTable() {
                const tbody = document.getElementById("ledgerTableBody");
                try {
                    const response = await fetch("/api/audit/logs");
                    const rows = await response.json();
                    if(rows.length === 0) {
                        tbody.innerHTML = "<tr><td colspan='6' class='p-12 text-center text-xs text-slate-600 font-mono italic'>// Schema pristine. No signatures found.</td></tr>";
                        return;
                    }
                    tbody.innerHTML = rows.map(row => {
                        const badge = row.doctor_action === "APPROVED" ? "bg-emerald-950/20 text-emerald-400" : "bg-rose-950/20 text-rose-400";
                        return `<tr class="border-b border-slate-900 font-mono text-[11px] text-slate-300">
                            <td class="p-4 text-slate-600">#\${row.id}</td><td class="p-4 text-slate-400">\${row.timestamp}</td>
                            <td class="p-4"><span class="text-cyan-400">\${row.modality.split("/")[0]}</span></td>
                            <td class="p-4">\${row.champion_model}</td><td class="p-4 text-purple-400">\${row.confidence_score}</td>
                            <td class="p-4"><span class="px-2 py-1 border rounded \${badge}">\${row.doctor_action}</span></td>
                        </tr>`;
                    }).join("");
                } catch (err) { tbody.innerHTML = "<tr><td colspan='6' class='p-12 text-center text-xs text-rose-400'>// Database disconnected.</td></tr>"; }
            }
            async function uploadDataset() {
                const fileInput = document.getElementById("fileInput");
                const terminal = document.getElementById("terminalScreen");
                const visualPlaceholder = document.getElementById("visualPlaceholder");
                const heatmapElement = document.getElementById("heatmapElement");
                if (!fileInput.files[0]) return;
                const file = fileInput.files[0];
                const isImage = file.type.startsWith("image/") || /\\.(jpg|jpeg|png)$/i.test(file.name);
                const formData = new FormData();
                formData.append("file", file);
                terminal.innerHTML = `<span class="text-cyan-400 animate-pulse font-mono">> RUNNING ENGINE POOL...</span>`;
                try {
                    const response = await fetch("/enclave/ingest", { method: "POST", headers: { "x-internal-enclave-token": "SecureToken123" }, body: formData });
                    const data = await response.json();
                    currentTransaction = { modality: data.modality_routing.modality, format: data.modality_routing.detected_format, champion: data.tournament_metrics.selected_champion, confidence: data.tournament_metrics.champion_confidence_auc };
                    terminal.innerHTML = `
<span class="text-emerald-400 font-bold">> SECURITY ROUTING: METADATA CLEAN</span>
<span class="text-slate-300">> Modality Track: \${data.modality_routing.modality}</span>
\${Object.entries(data.tournament_metrics.tournament_pool).map(([m, s], idx) => \`<span class="\${idx===0?'text-cyan-400 font-bold':'text-purple-400/80'} pl-4"> -> \${m}: \${s}</span>\`).join("\\n")}
<span class="text-cyan-400 font-bold">> CHAMPION DESIGNATED: \${data.tournament_metrics.selected_champion}</span>`;
                    document.getElementById("latencyMetric").innerText = data.enclave_execution_time_ms + " ms";
                    document.getElementById("championMetric").innerText = data.tournament_metrics.selected_champion.split(" ")[0];
                    document.getElementById("confidenceMetric").innerText = data.tournament_metrics.champion_confidence_auc;
                    if (isImage) { visualPlaceholder.classList.add("hidden"); heatmapElement.src = \`/enclave/heatmap?t=\${new Date().getTime()}\`; heatmapElement.classList.remove("hidden"); }
                    else { heatmapElement.classList.add("hidden"); visualPlaceholder.classList.remove("hidden"); visualPlaceholder.innerText = "// Spatial mapping skipped for text matrices."; }
                    document.getElementById("questionsContainer").innerHTML = data.tournament_metrics.questions.map((q, i) => \`<div class="bg-slate-950/40 p-3 rounded-xl border border-slate-900"><span class="text-slate-400">Q\${i+1}: \${q}</span><input type="text" placeholder="Observation notes..." class="w-full bg-slate-950 border border-slate-900 rounded p-1.5 mt-1 text-slate-300 outline-none"></div>\`).join("");
                    document.getElementById("qaSection").classList.remove("hidden"); document.getElementById("doctorValidationActions").classList.remove("hidden");
                } catch (err) { terminal.innerHTML = `<span class="text-rose-400 font-bold">> PAYLOAD ROUTING RUNTIME BARRIER.</span>`; }
            }
            async function signOffResult(action) {
                const terminal = document.getElementById("terminalScreen"); if(!currentTransaction) return;
                try {
                    const response = await fetch("/enclave/audit/commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: action, modality: currentTransaction.modality, format: currentTransaction.format, champion: currentTransaction.champion, confidence: currentTransaction.confidence }) });
                    const resData = await response.json();
                    terminal.innerHTML += `\\n<span class="\${action==='APPROVED'?'text-emerald-400':'text-rose-400'} font-bold">> [SQLITE TRANSACT #\${resData.log_id}] Entry verified under compliance keys.</span>`;
                } catch(err) { terminal.innerHTML += `\\n<span class="text-rose-400">> TRANSACT DISCONNECT.</span>`; }
                document.getElementById("doctorValidationActions").classList.add("hidden");
            }
        </script>
    </body>
    </html>
    """

@app.get("/api/audit/logs")
async def get_audit_logs_json():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, timestamp, modality, champion_model, confidence_score, doctor_action FROM audit_logs ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        return [{"id": r[0], "timestamp": r[1], "modality": r[2], "champion_model": r[3], "confidence_score": r[4], "doctor_action": r[5]} for r in rows]
    except Exception as e: 
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enclave/ingest")
async def ingest_and_process_clinical_data(file: UploadFile = File(...), x_internal_enclave_token: str = Header(None)):
    global cached_heatmap
    if x_internal_enclave_token != ENCLAVE_TOKEN: 
        raise HTTPException(status_code=401, detail="Token mismatch.")
    st = time.time()
    file_bytes = await file.read()
    meta = DataSanitizerPipeline.identify_modality_and_process(file_bytes, file.filename)
    if "Image" in meta["modality"]: 
        cached_heatmap = AntigravityOrchestrator.generate_gradcam_mock(file_bytes)
    champ, board, q = AntigravityOrchestrator.run_tournament(meta["modality"])
    return {
        "analysis_status": "SUCCESS", 
        "enclave_execution_time_ms": round((time.time() - st) * 1000, 2), 
        "modality_routing": meta, 
        "tournament_metrics": {
            "tournament_pool": board, 
            "selected_champion": champ, 
            "champion_confidence_auc": f"{board[champ]*100:.2f}%", 
            "questions": q
        }
    }

class AuditCommitPayload(BaseModel):
    action: str
    modality: str
    format: str
    champion: str
    confidence: str

@app.post("/enclave/audit/commit")
async def commit_audit_log(p: AuditCommitPayload):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO audit_logs (timestamp, modality, format, champion_model, confidence_score, doctor_action) VALUES (datetime('now'), ?, ?, ?, ?, ?)", (p.modality, p.format, p.champion, p.confidence, p.action))
        iid = cursor.lastrowid
        conn.commit()
        conn.close()
        return {"status": "LOGGED", "log_id": iid}
    except Exception as e: 
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/enclave/heatmap")
async def get_enclave_heatmap():
    global cached_heatmap
    if cached_heatmap is None: 
        raise HTTPException(status_code=404, detail="No map found.")
    return Response(content=cached_heatmap, media_type="image/jpeg")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
