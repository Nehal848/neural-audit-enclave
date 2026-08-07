"use client"

import React, { useState, useEffect, useRef } from "react"
import DocLayout from "@/components/doc-layout"
import { 
  CloudUpload, RefreshCw, CheckCircle2, XCircle, 
  AlertTriangle, ChevronDown, MoreHorizontal, FileSpreadsheet,
  FileJson, Database, FileText, Loader2, Play
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateModelPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dynamic State
  const [jobId, setJobId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1) 
  const [jobStatus, setJobStatus] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qualityScore, setQualityScore] = useState<number>(0)
  
  // Step 3 state
  const [selectedTarget, setSelectedTarget] = useState<string>("")
  const [phiRemoved, setPhiRemoved] = useState<boolean>(false)
  
  // Step 9 state
  const [modelName, setModelName] = useState<string>("")

  // Polling for Native Speed Pipeline
  useEffect(() => {
    let interval: NodeJS.Timeout
    const activeStates = ["PROFILING", "CLEANING", "TRAINING", "AWAITING_CONFIG", "AWAITING_APPROVAL", "EXPLAINING", "REPORT_READY"]
    
    if (jobId && activeStates.includes(jobStatus || "")) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/hospital/automl/job/${jobId}`)
          if (res.ok) {
            const data = await res.json()
            setJobStatus(data.status)
            if (data.profile && typeof data.profile === "string") {
              setProfileData(JSON.parse(data.profile))
            } else if (data.profile) {
              setProfileData(data.profile)
            }
            if (data.report && typeof data.report === "string") {
              setReportData(JSON.parse(data.report))
            } else if (data.report) {
              setReportData(data.report)
            } else if (data.metrics) {
              setReportData(typeof data.metrics === "string" ? JSON.parse(data.metrics) : data.metrics)
            }
            if (data.quality_score) {
              setQualityScore(data.quality_score)
            }
            
            // Advance wizard steps based on the exact 9-step flow
            if (data.status === "PROFILING") setCurrentStep(2)
            if (data.status === "AWAITING_CONFIG") setCurrentStep(3)
            if (data.status === "CLEANING") setCurrentStep(4)
            if (data.status === "AWAITING_APPROVAL") setCurrentStep(5)
            if (data.status === "TRAINING") setCurrentStep(7) // 6 & 7 grouped
            if (data.status === "EXPLAINING") setCurrentStep(8)
            if (data.status === "REPORT_READY") setCurrentStep(9)
            if (data.status === "DEPLOYED") setCurrentStep(9)
            if (data.status === "FAILED" || data.status === "REJECTED") setError(data.error || "Job failed or was rejected")
          }
        } catch (e) {
          console.error("Polling error", e)
        }
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [jobId, jobStatus])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("file", file)
    formData.append("disease_name", "Specific Disease Dataset")
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/hospital/automl/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        setJobId(data.job_id); setJobStatus("PROFILING"); setCurrentStep(2);
      } else setError(data.detail)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleConfigSubmit = async () => {
    if (!selectedTarget) { setError("Please select a target column"); return }
    if (!phiRemoved) { setError("You must confirm PHI has been removed."); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/hospital/automl/job/${jobId}/config`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_column: selectedTarget, phi_removed: true, phi_columns: [] })
      })
      if (res.ok) { setJobStatus("CLEANING"); setCurrentStep(4); setError(null) }
      else { const data = await res.json(); setError(data.detail) }
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleApproveQuality = async (approved: boolean) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hospital/automl/job/${jobId}/approve-quality`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      })
      if (res.ok) { 
        if (approved) {
           setJobStatus("TRAINING"); setCurrentStep(7); setError(null) 
        } else {
           setJobStatus("REJECTED"); setError("Data rejected. Please re-upload a clean dataset.")
        }
      }
      else { const data = await res.json(); setError(data.detail || data.reason) }
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleDeploy = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hospital/automl/deploy`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, name: modelName || "New Clinical Model" })
      })
      if (res.ok) { setJobStatus("DEPLOYED"); router.push("/dashboard-doc/models") }
      else { const data = await res.json(); setError(data.detail) }
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  // Step 5: Derive metrics
  const overallQuality = qualityScore > 0 ? Math.round(qualityScore) : (profileData ? Math.max(0, 100 - (profileData.overall_missing_pct || 0)) : 0);

  return (
    <DocLayout 
      title="Create New Model" 
      subtitle="Complete the 9-step pipeline to build and deploy your proprietary AI model natively."
      searchPlaceholder="Search datasets, models, reports..."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* ── CREATE MODEL PIPELINE STEPPER ──────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
          <div className="mb-6">
            <h2 className="text-[20px] font-bold text-slate-900 mb-1">Create Model Pipeline (9 Steps)</h2>
            <p className="text-[13px] font-medium text-slate-500">Secure enclosure building your custom clinical AI model</p>
          </div>
          
          <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pb-2">
            {[
              { num: 1, title: 'Upload', sub: 'Data Upload', active: currentStep >= 1 },
              { num: 2, title: 'Validation', sub: 'Data Profiling', active: currentStep >= 2 },
              { num: 3, title: 'Manual Input', sub: 'Target & PHI', active: currentStep >= 3 },
              { num: 4, title: 'Cleaning', sub: 'LLM Standardization', active: currentStep >= 4 },
              { num: 5, title: 'Verification', sub: 'Human Approval', active: currentStep >= 5 },
              { num: 6, title: 'Detection', sub: 'Problem Type', active: currentStep >= 6 },
              { num: 7, title: 'AutoML', sub: 'Tournament', active: currentStep >= 7 },
              { num: 8, title: 'Report', sub: 'Explainability', active: currentStep >= 8 },
              { num: 9, title: 'Approval', sub: 'Final Deploy', active: currentStep >= 9 },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center justify-center min-w-[80px] group ${step.active ? '' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold mb-2 transition-all ${step.active ? (currentStep === step.num && jobStatus !== "DEPLOYED" ? 'bg-blue-600 text-white shadow-md shadow-blue-200 animate-pulse' : 'bg-blue-600 text-white shadow-md') : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {currentStep > step.num || jobStatus === "DEPLOYED" ? <CheckCircle2 size={18} /> : step.num}
                  </div>
                  <div className={`text-[11px] font-bold text-center leading-tight mb-0.5 ${step.active ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className={`shrink-0 w-8 h-px mb-6 ${currentStep > step.num ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-100 font-bold text-sm flex items-center gap-3">
            <XCircle size={18} /> {error}
          </div>
        )}

        {/* ── DYNAMIC TWO COLUMN LAYOUT ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-6 items-start">
          
          {/* LEFT COLUMN: Data Ingestion (Always shows the source of data upload initially) */}
          <div className="flex flex-col gap-6">
            
            {/* Step 1 Header */}
            <div>
              <h3 className="text-[18px] font-bold text-slate-900 mb-1">1. Data Upload</h3>
              <p className="text-[13px] font-medium text-slate-500">Upload data for a single specific disease (any format)</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden">
              <div 
                onClick={() => !loading && currentStep === 1 && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center mb-8 relative z-10 transition-colors ${loading || currentStep > 1 ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer'}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv,.zip" />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  {loading && currentStep === 1 ? <Loader2 size={32} className="animate-spin text-blue-600" /> : (currentStep > 1 ? <CheckCircle2 size={32} className="text-emerald-500" /> : <CloudUpload size={32} strokeWidth={1.5} className="text-blue-600" />)}
                </div>
                <div className="text-[15px] font-bold text-slate-700 mb-2">
                  {currentStep > 1 ? "Dataset Securely Uploaded" : "Drag & drop your dataset here"}
                </div>
                <div className="text-[12px] font-semibold text-slate-400 mb-4">Must contain records for one specific disease (e.g. Brain Tumor MRI logs)</div>
              </div>

              {jobId && (
                 <div className="mt-8 border-t border-slate-100 pt-6">
                   <h4 className="text-[13px] font-bold text-slate-900 mb-4">Secure Enclave Status</h4>
                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-[11px] font-bold text-slate-500">JOB ID: {jobId.substring(0,8)}</span>
                       <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{jobStatus}</span>
                     </div>
                   </div>
                 </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Dynamic Contextual Steps */}
          <div className="flex flex-col gap-6">
            
            {/* Contextual Header */}
            <div>
              <h3 className="text-[18px] font-bold text-slate-900 mb-1">
                {currentStep === 1 && "Waiting for Upload..."}
                {currentStep === 2 && "2. Data Profiling & Validation"}
                {currentStep === 3 && "3. Mandatory Manual Input"}
                {currentStep === 4 && "4. Data Cleaning & Conversion"}
                {currentStep === 5 && "5. Human Verification"}
                {currentStep >= 6 && currentStep <= 7 && "6 & 7. Problem Detection & AutoML"}
                {currentStep === 8 && "8. Explainability Report"}
                {currentStep === 9 && "9. Final Approval"}
              </h3>
              <p className="text-[13px] font-medium text-slate-500">
                {currentStep === 2 && "Checking volume & missing values automatically"}
                {currentStep === 3 && "Hospital must verify target and remove PHI"}
                {currentStep === 4 && "LLM-powered standardisation and feature engineering"}
                {currentStep === 5 && "Review data quality score before proceeding"}
                {currentStep >= 6 && currentStep <= 7 && "Detecting problem type and running algorithms natively"}
                {currentStep === 8 && "Reviewing the \"why\" behind the selected champion model"}
                {currentStep === 9 && "Final human-in-the-loop sign-off to deploy"}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[400px] flex flex-col justify-center">
              
              {currentStep < 2 && (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <Database size={48} className="mb-4 opacity-50" />
                  <p className="font-bold">Awaiting Dataset</p>
                </div>
              )}

              {/* Step 2: Validation Loading */}
              {(currentStep === 2) && (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                  <div className="text-[16px] font-bold text-slate-900 mb-2">Validating Dataset Requirements...</div>
                  <div className="text-[12px] text-slate-500 text-center max-w-sm">
                    Checking if dataset volume meets &gt;50 rows for train/test split. <br/>
                    Checking if missing values are &lt;75%.
                  </div>
                </div>
              )}

              {/* Step 3: Mandatory Manual Input */}
              {currentStep === 3 && jobStatus === "AWAITING_CONFIG" && profileData && profileData.candidate_targets && (
                <div className="w-full">
                  <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                     <h4 className="text-[14px] font-bold text-slate-900 mb-1">Target Column</h4>
                     <p className="text-[11px] text-slate-600 mb-3">Select the column the AI should learn to predict.</p>
                     <select 
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                      >
                        <option value="">-- Choose Target to Predict --</option>
                        {profileData.candidate_targets.map((c: string) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                     </select>
                  </div>
                  
                  <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <h4 className="text-[14px] font-bold text-amber-900 mb-1 flex items-center gap-2">
                      <AlertTriangle size={16} /> Regulatory Compliance: PHI Removal
                    </h4>
                    <p className="text-[11px] text-amber-700 mb-3">
                      The platform is strictly against providing any patient data to an AI model. You must confirm that all patient identifying data (names, IDs, etc) has been stripped from this dataset.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={phiRemoved}
                        onChange={(e) => setPhiRemoved(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-[13px] font-bold text-amber-900">
                        I confirm that any and all patient-identifying data (PHI) has been removed from this dataset.
                      </span>
                    </label>
                  </div>

                  <button 
                    onClick={handleConfigSubmit}
                    disabled={loading || !selectedTarget || !phiRemoved}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Confirm & Proceed to Cleaning Pipeline
                  </button>
                </div>
              )}

              {/* Step 4: Data Cleaning */}
              {currentStep === 4 && (
                <div className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-8 text-white h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                  <Loader2 size={40} className="text-blue-400 animate-spin mb-4 relative z-10" />
                  <div className="text-[16px] font-bold mb-2 relative z-10">LLM-Driven Cleaning & Conversion</div>
                  <div className="text-[12px] text-slate-400 text-center max-w-sm mb-6 relative z-10 font-mono">
                    &gt; Standardizing units (e.g. mg/dL → mmol/L)<br/>
                    &gt; Feature Engineering (e.g. Height+Weight → BMI)<br/>
                    &gt; Normalizing medical image formats natively
                  </div>
                  <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden relative z-10">
                    <div className="bg-blue-500 h-1.5 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
                  </div>
                </div>
              )}

              {/* Step 5: Human Verification */}
              {currentStep === 5 && (
                <div className="w-full flex flex-col h-full">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="stroke-slate-100" fill="none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={`${overallQuality >= 50 ? 'stroke-emerald-500' : 'stroke-rose-500'} transition-all duration-1000 ease-out`} fill="none" strokeWidth="3" strokeDasharray={`${overallQuality}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className={`absolute inset-0 flex flex-col items-center justify-center`}>
                        <span className={`text-[24px] font-bold ${overallQuality >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>{overallQuality}%</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center leading-tight">Data Quality<br/>Score</span>
                      </div>
                    </div>
                  </div>
                  
                  {overallQuality < 50 ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-auto">
                      <h4 className="text-[14px] font-bold text-rose-900 mb-1 flex items-center gap-2">
                        <AlertTriangle size={16} /> Quality Threshold Failed
                      </h4>
                      <p className="text-[12px] text-rose-700 font-medium">
                        Even after LLM cleaning and feature engineering, the data quality score remains below the 50% threshold. The platform will not waste resources training on this dataset. Please re-upload better data.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-auto">
                      <h4 className="text-[14px] font-bold text-emerald-900 mb-1 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Verification Passed
                      </h4>
                      <p className="text-[12px] text-emerald-700 font-medium">
                        Data cleaning successful. The resulting dataset has a strong quality score. You may proceed to AutoML training.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    {overallQuality < 50 ? (
                       <button 
                         onClick={() => handleApproveQuality(false)}
                         disabled={loading}
                         className="flex-1 bg-rose-600 text-white py-3 rounded-xl text-[13px] font-bold hover:bg-rose-700 transition-colors"
                       >
                         Acknowledge & Reject
                       </button>
                    ) : (
                       <>
                         <button 
                           onClick={() => handleApproveQuality(false)}
                           disabled={loading}
                           className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors"
                         >
                           Reject Data
                         </button>
                         <button 
                           onClick={() => handleApproveQuality(true)}
                           disabled={loading}
                           className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition-colors"
                         >
                           Approve & Start Training
                         </button>
                       </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 6 & 7: Problem Detection & Training */}
              {(currentStep >= 6 && currentStep <= 7) && (
                <div className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-8 text-white h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                  <Play size={40} className="text-purple-400 animate-pulse mb-4 relative z-10" />
                  <div className="text-[16px] font-bold mb-2 relative z-10">Running AutoML Tournament...</div>
                  <div className="text-[12px] text-slate-400 text-center max-w-sm mb-6 relative z-10 font-mono">
                    &gt; Detecting problem type: {profileData?.problem_type || "Classification"}<br/>
                    &gt; Performing Train/Test Split (80/20)<br/>
                    &gt; Applying Scalarization<br/>
                    &gt; Training algorithms (XGBoost, RandomForest...) natively
                  </div>
                  <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden relative z-10">
                    <div className="bg-purple-500 h-1.5 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
                  </div>
                </div>
              )}

              {/* Step 8 & 9: Explainability & Final Approval */}
              {(currentStep >= 8) && (
                <div className="w-full h-full flex flex-col">
                  {currentStep === 8 && (
                    <div className="flex items-center gap-3 mb-6 p-4 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl font-bold text-[13px]">
                      <Loader2 size={18} className="animate-spin" /> Generating Explainability Report...
                    </div>
                  )}

                  {reportData ? (
                    <>
                      <div className="mb-6 relative z-10 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <h4 className="text-[15px] font-bold text-slate-900 mb-1">Champion Model: {reportData.champion_algorithm || reportData.algorithm}</h4>
                        <p className="text-[11px] text-slate-600 mb-4">{reportData.explanation}</p>
                        
                        <div className="flex gap-4 mb-4">
                          <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex-1">
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Accuracy</div>
                            <div className="text-[18px] font-bold text-blue-600">{(((reportData.metrics?.accuracy || reportData.accuracy || 0) * 100).toFixed(1))}%</div>
                          </div>
                          <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex-1">
                            <div className="text-[10px] text-slate-500 font-bold uppercase">F1 Score</div>
                            <div className="text-[18px] font-bold text-slate-800">{(((reportData.metrics?.f1 || reportData.f1_score || 0) * 100).toFixed(1))}%</div>
                          </div>
                        </div>
                        
                        <div className="mt-6 border-t border-blue-100 pt-5">
                          <h4 className="text-[13px] font-bold text-slate-900 mb-3">9. Final Human Approval</h4>
                          <input 
                             type="text" 
                             placeholder="Provide a Name for this Model (e.g. Cardio V1)"
                             value={modelName}
                             onChange={(e) => setModelName(e.target.value)}
                             className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:border-blue-500 outline-none mb-3"
                           />
                          <button 
                             onClick={handleDeploy}
                             disabled={loading || !modelName || currentStep < 9}
                             className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {loading ? "Deploying..." : "Approve Model & Deploy to Enclave"}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                      <FileText size={48} className="mb-4 opacity-50" />
                      <p className="font-bold">Awaiting Report Generation</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DocLayout>
  )
}
