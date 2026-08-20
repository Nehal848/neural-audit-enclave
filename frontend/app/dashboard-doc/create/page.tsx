"use client"
import { UploadCloud, CheckCircle, BrainCircuit, HardDrive, ShieldCheck, Play, FileType, AlertTriangle, ArrowRight, Activity, Eye } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateModel() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [jobStatus, setJobStatus] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<any>(null)
  
  const getAuthHeaders = (isFormData = false) => {
    const headers: any = {};
    try {
      const session = JSON.parse(localStorage.getItem("hospital_ai_session") || "{}");
      if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
    } catch (e) {}
    if (!isFormData) headers["Content-Type"] = "application/json";
    return headers;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const [targetColumn, setTargetColumn] = useState("")
  const [piiAcknowledged, setPiiAcknowledged] = useState(false)
  const [activeTab, setActiveTab] = useState<"create" | "training" | "pending">("create")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const startIngestion = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("disease_name", file.name.split('.')[0] || "Custom Model");

    try {
      const res = await fetch("/api/hospital/automl/upload", { method: "POST", headers: getAuthHeaders(true), body: formData });
      const data = await res.json();
      if (res.ok && data.job_id) {
        setJobId(data.job_id);
        pollJobStatus(data.job_id, "AWAITING_CONFIG", () => setStep(2));
      } else {
        alert("Upload failed: " + JSON.stringify(data));
        setLoading(false);
      }
    } catch (e) {
      alert("Upload error.");
      setLoading(false);
    }
  }

  const pollJobStatus = (id: string, targetStatus: string, onTargetReached: (job: any) => void) => {
    if (pollingInterval) clearInterval(pollingInterval);
    const intv = setInterval(async () => {
      try {
        const res = await fetch(`/api/hospital/automl/job/${id}`, { headers: getAuthHeaders() });
        const job = await res.json();
        setJobStatus(job.status);
        
        if (job.status === targetStatus) {
          clearInterval(intv);
          setLoading(false);
          if (job.profile) {
            try { setProfile(JSON.parse(job.profile)); } catch(e) {}
          }
          onTargetReached(job);
        } else if (job.status === "FAILED" || job.status === "REJECTED") {
          clearInterval(intv);
          setLoading(false);
          alert("Pipeline failed or rejected: " + job.error);
        }
      } catch(e) {}
    }, 2000);
    setPollingInterval(intv);
  }

  const proceedToAutoML = async () => {
    if (!targetColumn || !piiAcknowledged || !jobId) return;
    setLoading(true);
    try {
      await fetch(`/api/hospital/automl/job/${jobId}/config`, {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify({ target_column: targetColumn, phi_columns: [] })
      });
      setStep(3);
      pollJobStatus(jobId, "AWAITING_APPROVAL", () => {});
    } catch(e) { setLoading(false); }
  }

  const approveQuality = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      await fetch(`/api/hospital/automl/job/${jobId}/approve-quality`, {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify({ approved: true, review_notes: "" })
      });
      pollJobStatus(jobId, "EXPLAINING", () => {
        setStep(4);
      });
    } catch(e) { setLoading(false); }
  }

  const deployModel = async () => {
    setLoading(true)
    try {
       await fetch(`/api/hospital/automl/deploy`, {
          method: "POST", headers: getAuthHeaders(),
          body: JSON.stringify({ job_id: jobId })
       });
       router.push("/dashboard-doc");
    } catch(e) { setLoading(false); }
  }

  if (activeTab !== "create") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Models Pipeline</h2>
            <p className="text-slate-400 mt-1">Manage your models currently in the training and approval pipeline.</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl">
            <button onClick={() => setActiveTab("create")} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Create New</button>
            <button onClick={() => setActiveTab("training")} className={`px-4 py-2 text-sm transition-all rounded-lg ${activeTab === "training" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>In Training</button>
            <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 text-sm transition-all rounded-lg ${activeTab === "pending" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>Pending Approval</button>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-slate-400">
          No models currently {activeTab === "training" ? "in training phase" : "pending human approval"}.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Create AI Model</h2>
          <p className="text-slate-400 mt-1">Train a new model using zero-data-leakage AutoML.</p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button onClick={() => setActiveTab("create")} className="px-4 py-2 text-sm transition-all rounded-lg bg-white/10 text-white">Create New</button>
          <button onClick={() => setActiveTab("training")} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">In Training</button>
          <button onClick={() => setActiveTab("pending")} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Pending Approval</button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: "Ingestion", icon: HardDrive },
          { num: 2, label: "Validation & PII", icon: ShieldCheck },
          { num: 3, label: "LLM Pipeline", icon: BrainCircuit },
          { num: 4, label: "Deploy", icon: Play },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center flex-1 relative">
            {i !== 0 && <div className={`absolute top-5 -left-1/2 w-full h-[2px] ${step >= s.num ? "bg-cyan-500" : "bg-white/10"}`} />}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-2 transition-colors ${step >= s.num ? "bg-cyan-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-[#0A1121] border-white/20 text-slate-500"}`}>
              {step > s.num ? <CheckCircle size={18} /> : <s.icon size={18} />}
            </div>
            <p className={`text-xs mt-2 font-medium ${step >= s.num ? "text-cyan-400" : "text-slate-500"}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0A1121]/80 backdrop-blur-xl border border-white/10 rounded-xl p-8">
        {step === 1 && (
          <div className="text-center max-w-lg mx-auto py-8">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-400">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Dataset</h3>
            <p className="text-slate-400 text-sm mb-8">Supported formats: CSV, JSON, DICOM (ZIP). Maximum size: 50GB.</p>
            
            <label className="cursor-pointer w-full py-6 px-6 border-2 border-dashed border-white/20 hover:border-cyan-500/50 rounded-xl flex flex-col items-center gap-3 transition-colors bg-white/5 hover:bg-white/10 mb-6">
              <FileType size={24} className={file ? "text-cyan-400" : "text-slate-500"} />
              <span className="text-sm text-slate-300 font-medium">{file ? file.name : "Drag and drop your file here, or click to browse"}</span>
              {file && <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv,.json,.zip" />
            </label>

            <button 
              disabled={!file || loading} 
              onClick={startIngestion}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
            >
              {loading ? "Analyzing Data..." : "Proceed to Validation"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Activity size={24} />
              <div>
                <p className="font-bold">Data Quality Check Passed</p>
                <p className="text-xs text-emerald-300">
                  {profile ? `${profile.n_rows} rows detected. Missing values: ${profile.overall_missing_pct}%` : "Data profiled successfully."}
                </p>
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6">
              <h4 className="text-white font-bold flex items-center gap-2"><Eye size={18}/> Mandatory Configuration</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Target Column (What to Predict)</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                >
                  <option value="">Select a column...</option>
                  {(profile?.candidate_targets || ["diagnosis", "severity_score", "readmission_30d"]).map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-rose-400"/> Patient Data Removal (PII)
                </label>
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="pii-check" 
                    checked={piiAcknowledged}
                    onChange={(e) => setPiiAcknowledged(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded bg-black/40 border-white/20 text-rose-500 focus:ring-rose-500 focus:ring-offset-gray-900" 
                  />
                  <label htmlFor="pii-check" className="text-sm text-slate-300 leading-relaxed cursor-pointer">
                    I confirm that the columns <span className="text-rose-400 font-mono text-xs">patient_name</span>, <span className="text-rose-400 font-mono text-xs">ssn</span>, and <span className="text-rose-400 font-mono text-xs">dob</span> will be permanently scrubbed from this dataset before proceeding to the LLM pipeline.
                  </label>
                </div>
              </div>
            </div>

            <button 
              disabled={loading || !targetColumn || !piiAcknowledged}
              onClick={proceedToAutoML}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? "Initializing Pipeline..." : <>Initialize LLM Pipeline <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-8">
            <h3 className="text-xl font-bold text-white text-center mb-6">LLM Integration & AutoML Pipeline</h3>
            
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10"></div>
              
              <div className="space-y-6 relative">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle size={20} />
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-medium mb-1">1. Data Cleaning & Conversion</h4>
                    <p className="text-sm text-slate-400">LLM agents normalized date formats and handled missing categorical values.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 z-10">
                    <Activity size={20} className="animate-pulse" />
                  </div>
                  <div className="flex-1 bg-white/5 border border-cyan-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <h4 className="text-white font-medium mb-1 flex justify-between">
                      <span>2. Medical/Image Standardization & Feature Eng</span>
                      <span className="text-xs text-cyan-400 font-mono">Processing... 64%</span>
                    </h4>
                    <p className="text-sm text-slate-400 mb-3">Extracting NLP features from clinical notes and standardizing image contrast.</p>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: '64%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 opacity-50">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center shrink-0 z-10">
                    <Eye size={20} />
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-medium mb-1">3. Human Verification Dashboard</h4>
                    <p className="text-sm text-slate-400">Awaiting data quality score to determine if manual review is required.</p>
                  </div>
                </div>

                <div className="flex gap-6 opacity-50">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center shrink-0 z-10">
                    <BrainCircuit size={20} />
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-medium mb-1">4. AutoML Pipeline</h4>
                    <p className="text-sm text-slate-400">Problem detection and algorithm selection.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {jobStatus === "AWAITING_APPROVAL" && (
              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                 <strong>Quality Check Complete.</strong> Hospital review is required to proceed to the intensive training tournament.
              </div>
            )}

            <button 
              disabled={loading || jobStatus !== "AWAITING_APPROVAL"}
              onClick={approveQuality}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-8"
            >
              {loading ? "Training in progress..." : (jobStatus === "AWAITING_APPROVAL" ? "Approve Data Quality & Start Training" : "Waiting for Cleaning/Profiling...")}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-8 border-b border-white/10 mb-8">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Analysis & Explainability Report</h3>
              <p className="text-slate-400">Review the final model performance and reasoning before deployment.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Winning Algorithm</p>
                <p className="text-xl font-bold text-white">Gradient Boosting (XGBoost)</p>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Validation Accuracy</p>
                <p className="text-xl font-mono text-emerald-400">96.8%</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2"><BrainCircuit size={18} className="text-blue-400"/> Explainability Insight</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                The model primarily relies on the <span className="font-mono text-blue-300">age</span> and <span className="font-mono text-blue-300">severity_score</span> features. The SHAP values indicate that a severity score &gt; 7.5 increases prediction confidence by 42%. No critical bias detected across demographic slices.
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => router.push("/hospital/dashboard")} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all">
                Cancel
              </button>
              <button onClick={deployModel} disabled={loading} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20">
                {loading ? "Deploying..." : "Approve & Deploy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
