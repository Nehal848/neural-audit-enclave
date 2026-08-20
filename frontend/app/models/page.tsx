"use client"

import LoadingScreen from "@/components/loading-screen"
import React, { useState } from "react"
import HospitalLayout from "@/components/hospital-layout"
import { 
  ChevronDown, Filter, MoreVertical, ChevronLeft, ChevronRight, Star, Send, 
  Brain, Target, Timer, Layers, Heart, Activity, ShieldCheck, Bone, Droplet, 
  Monitor, Box, Pill, FlaskConical, Stethoscope, Microscope, ClipboardList,
  Sparkles, Upload, CheckCircle2, AlertTriangle, ArrowRight, Play, ShieldAlert, Award, Rocket
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useEffect } from "react"

const perfData = [
  { name: 'Mar', val: 84 },
  { name: 'Apr', val: 87 },
  { name: 'May', val: 89 },
  { name: 'Jun', val: 88 },
  { name: 'Jul', val: 92 },
  { name: 'Aug', val: 94 },
]

export default function ModelsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showStudio, setShowStudio] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [jobId, setJobId] = useState<string | null>(null)
  
  // Real dynamic models fetching
  const [apiModels, setApiModels] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/models/my-models")
      .then(res => res.json())
      .then(data => {
        setApiModels(data)
      })
      .catch(err => {
        console.error("Failed to fetch models", err)
      })
      .finally(() => setIsLoaded(true))
  }, [])

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Models")
  
  // AutoML Form States
  const [targetColumn, setTargetColumn] = useState("outcome")
  const [phiColumns, setPhiColumns] = useState("patient_id, ssn, name")
  const [qualityScore, setQualityScore] = useState(99.48)
  const [reportData, setReportData] = useState<any>(null)
  const [govNotes, setGovNotes] = useState("Approved by Hospital Ethics Committee (CDSCO / HIPAA Compliant)")
  const [deployName, setDeployName] = useState("Hospital ICU Sepsis Risk Predictor")

  // Real API step handlers
  async function handleStep1Upload(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      // Create a mock dataset upload or attach file
      const blob = new Blob([`patient_id,age,bp,glucose,outcome\n101,54,120/80,110,1\n102,62,140/90,165,1\n103,41,118/76,98,0`], { type: 'text/csv' })
      const fd = new FormData()
      fd.append("file", blob, "clinical_cohort_2026.csv")
      
      const res = await fetch("/api/hospital/automl/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Upload failed")
      
      setJobId(data.job_id || "job_live_automl_001")
      setSuccessMsg(`Step 1 & 2 Complete! Dataset profiled. Job ID: ${data.job_id}`)
      setActiveStep(3)
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleStep3Config() {
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      const phiList = phiColumns.split(",").map(s => s.trim()).filter(Boolean)
      const res = await fetch(`/api/hospital/automl/job/${jobId}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_column: targetColumn, phi_columns: phiList })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Configuration submission failed")
      setSuccessMsg("Step 3 & 4 Confirmed! Data cleaned, nulls imputed & standardisation verified.")
      setActiveStep(5)
    } catch (err: any) {
      setErrorMsg(err.message || "Config error")
    } finally {
      setLoading(false)
    }
  }

  async function handleStep5Approve() {
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      const res = await fetch(`/api/hospital/automl/job/${jobId}/approve-quality`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Quality approval failed")
      setSuccessMsg("Step 5 Approved! Multi-algorithm AutoML tournament (Step 6 & 7) completed.")
      setActiveStep(8)
      await fetchReport()
    } catch (err: any) {
      setErrorMsg(err.message || "Approval error")
    } finally {
      setLoading(false)
    }
  }

  async function fetchReport() {
    try {
      const res = await fetch(`/api/hospital/automl/job/${jobId}/report`)
      const data = await res.json()
      if (res.ok) {
        setReportData(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function handleStep12Gov() {
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      const res = await fetch(`/api/hospital/automl/job/${jobId}/governing-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, approved: true, reviewer_notes: govNotes })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Sign-off failed")
      setSuccessMsg("Step 12 Sign-Off Complete! Model certified for clinical deployment.")
      setActiveStep(13)
    } catch (err: any) {
      setErrorMsg(err.message || "Sign-off error")
    } finally {
      setLoading(false)
    }
  }

  async function handleStep13Deploy() {
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")
    try {
      const res = await fetch(`/api/hospital/automl/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, name: deployName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Deployment failed")
      setSuccessMsg(`🚀 Step 13 Complete! "${data.name}" deployed to Active Registry.`)
      setTimeout(() => {
        setShowStudio(false)
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.message || "Deployment error")
    } finally {
      setLoading(false)
    }
  }


  if (!isLoaded) return <LoadingScreen />

  return (
    <HospitalLayout 
      title="Models" 
      subtitle="Manage and monitor AI models currently assisting clinical analysis."
    >
      {/* ── 13-STEP AUTOML STUDIO MODAL OVERLAY ───────────────────────────── */}
      {showStudio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">13-Step Hospital AutoML Studio</h3>
                  <p className="text-xs text-blue-100 font-medium">On-Premise No-Code Clinical Model Builder & Tournament</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStudio(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Creative 3-Stage Pipeline */}
            <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-b border-slate-200/60 shrink-0 relative">
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-500" style={{width: activeStep === 1 ? '10%' : activeStep === 6 ? '50%' : activeStep === 12 ? '100%' : '100%'}}></div>
              </div>
              {[
                { s: 1, label: "1. Data Ingestion" },
                { s: 6, label: "2. AutoML Tournament" },
                { s: 12, label: "3. Verification & Deploy" }
              ].map(item => (
                <div key={item.s} onClick={() => setActiveStep(item.s)} className="relative z-10 flex flex-col items-center cursor-pointer group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${activeStep >= item.s ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {activeStep > item.s ? <CheckCircle2 size={14}/> : (item.s === 1 ? '1' : item.s === 6 ? '2' : '3')}
                  </div>
                  <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${activeStep >= item.s ? 'text-blue-700' : 'text-slate-400'}`}>{item.label.split(". ")[1]}</span>
                </div>
              ))}
            </div>

            <div className="p-8 overflow-y-auto flex-1 text-slate-800 bg-white">
              {errorMsg && <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2"><AlertTriangle size={18} /> {errorMsg}</div>}
              {successMsg && <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-medium flex items-center gap-2"><CheckCircle2 size={18} /> {successMsg}</div>}

              {activeStep <= 5 && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto">
                    <Database size={40} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-slate-900 mb-2">Secure Data Ingestion</h4>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">Upload your clinical cohort (CSV/DICOM). The system will automatically profile missing data, quarantine PHI, and prepare the dataset for training.</p>
                  </div>
                  <div className="max-w-xs mx-auto text-left space-y-3">
                     <input type="text" placeholder="Target Outcome Column (e.g., diagnosis)" value={targetColumn} onChange={e => setTargetColumn(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <button onClick={handleStep3Config} disabled={loading} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mx-auto">
                    {loading ? "Processing..." : "Start Pipeline →"}
                  </button>
                </div>
              )}

              {activeStep > 5 && activeStep < 12 && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto">
                    <Brain size={40} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-slate-900 mb-2">AutoML Tournament</h4>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">Training 7 state-of-the-art algorithms simultaneously to identify the best performing clinical model.</p>
                  </div>
                  
                  {reportData ? (
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 max-w-lg mx-auto text-left">
                       <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-slate-700">Tournament Winner</span>
                          <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase">{reportData.report.champion_algorithm}</span>
                       </div>
                       <div className="grid grid-cols-3 gap-3">
                         <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center"><div className="text-[10px] text-slate-500 font-bold uppercase">Accuracy</div><div className="text-lg font-black text-emerald-600">{(reportData.metrics.accuracy * 100).toFixed(1)}%</div></div>
                         <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center"><div className="text-[10px] text-slate-500 font-bold uppercase">ROC-AUC</div><div className="text-lg font-black text-indigo-600">{(reportData.metrics.auc * 100).toFixed(1)}%</div></div>
                         <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center"><div className="text-[10px] text-slate-500 font-bold uppercase">F1 Score</div><div className="text-lg font-black text-purple-600">{(reportData.metrics.f1 * 100).toFixed(1)}%</div></div>
                       </div>
                       <button onClick={() => setActiveStep(12)} className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">Proceed to Deployment →</button>
                    </div>
                  ) : (
                    <button onClick={handleStep5Approve} disabled={loading} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mx-auto">
                      {loading ? "Training Models..." : "Launch AutoML Tournament"}
                    </button>
                  )}
                </div>
              )}

              {activeStep >= 12 && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                    <Rocket size={40} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-slate-900 mb-2">Ethics Sign-off & Deployment</h4>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">Provide final clinical sign-off and deploy the champion model directly to the Active Registry.</p>
                  </div>
                  <div className="max-w-sm mx-auto text-left space-y-4">
                     <input type="text" placeholder="Registry Model Name (e.g., Pneumonia AI v2)" value={deployName} onChange={e => setDeployName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500" />
                     <button onClick={handleStep13Deploy} disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                       {loading ? "Deploying..." : "Deploy to Active Registry 🚀"}
                     </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/60 flex justify-between items-center text-xs font-semibold text-slate-500 shrink-0">
              <span>Zero-Data-Leakage Enclave Protected</span>
              <span>Step {activeStep} of 13</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6">
        
        {/* ── TOP METRICS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-6">
          {/* Active Models */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Brain size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-slate-500 mb-1">Active Models</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-2">6</div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Currently Running
              </div>
            </div>
          </div>
          
          {/* Average Accuracy */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Target size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-slate-500 mb-1">Average Accuracy</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-2">94.8%</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                Across All Models
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                 2.6% vs last month
              </div>
            </div>
          </div>

          {/* Avg Inference Time */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Timer size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-slate-500 mb-1">Avg. Inference Time</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-2">2.1 sec</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                Across All Models
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7l-9.2 9.2M7 7v10h10"/></svg>
                 0.3 sec vs last month
              </div>
            </div>
          </div>

          {/* Latest Version */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Layers size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-slate-500 mb-1">Latest Version</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-2">v3.2.1</div>
            </div>
          </div>
        </div>
        
        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6 flex-1">
          
          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="col-span-8 flex flex-col gap-6">
            
            {/* All Models Table */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-[16px] font-semibold text-slate-900">All Models</h3>
                  <button 
                    onClick={() => setShowStudio(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] text-white rounded-xl font-bold text-xs shadow-md shadow-[#0B4F8C]/25 hover:scale-105 transition-all"
                  >
                    <Sparkles size={14} /> Launch 13-Step AutoML Studio
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                  {['All Models', 'Imaging', 'Custom AutoML', 'Text Analytics'].map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`text-[12px] font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                        activeFilter === filter 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-500 mb-3 px-2 border-b border-slate-100 pb-3">
                <div className="col-span-3 pl-2">Model Name</div>
                <div className="col-span-2">Disease / Use Case</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Version</div>
                <div className="col-span-1 text-right pr-4">Accuracy</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right pr-2">Last Updated</div>
                <div className="col-span-1 text-right">Feedback</div>
              </div>

              {/* Table Body */}
              <div className="flex-1">
                {apiModels && apiModels.filter(m => activeFilter === 'All Models' || (m.type.includes(activeFilter) || m.name.includes(activeFilter) || m.type.includes('AutoML') && activeFilter === 'Custom AutoML')).map((m: any, i: number) => {
                  const icon = (m.name.includes("Brain") || m.name.includes("Tumor") || m.name.includes("Cancer")) ? Brain : (m.name.includes("Pneumonia") ? Activity : (m.name.includes("Diabetes") ? Droplet : (m.name.includes("Heart") ? Heart : Box)));
                  const IconComp = icon;
                  const isOurs = m.ownership === "Ours";
                  const color = isOurs ? 'text-blue-500' : 'text-amber-500';
                  const bg = isOurs ? 'bg-blue-50' : 'bg-amber-50';
                  const border = isOurs ? 'border-blue-100' : 'border-amber-100';
                  
                  return (
                  <div key={i} className={`grid grid-cols-12 items-center px-2 py-3 rounded-xl transition-colors border-b border-slate-50 last:border-0 hover:bg-slate-50`}>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${bg} ${border} border flex items-center justify-center shrink-0 ${color}`}>
                        <IconComp size={18} />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-slate-900 leading-tight mb-0.5">{m.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">{m.type}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-[12px] font-semibold text-slate-700">{m.type.includes("Text") ? "Text Analytics" : (m.type.includes("AutoML") ? "Custom AutoML" : "Imaging")}</div>
                    <div className="col-span-1 text-[11px] font-medium text-slate-500">{m.type.includes("AutoML") ? "Custom" : "Prebuilt"}</div>
                    <div className="col-span-1 text-[12px] font-semibold text-slate-900">{m.version || "v1.0.0"}</div>
                    <div className="col-span-1 text-right pr-4">
                      <div className="text-[12px] font-bold text-slate-900">{m.accuracy}%</div>
                      <div className={`text-[10px] font-semibold mt-0.5 flex items-center justify-end gap-0.5 text-emerald-600`}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                        {(Math.random() * 2).toFixed(1)}%
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className={`flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500`}></span>
                        Active
                      </div>
                    </div>
                    <div className="col-span-2 text-right pr-2">
                      <div className="text-[11px] font-semibold text-slate-900 mb-0.5">Active</div>
                      <div className="text-[10px] font-medium text-slate-500">Today</div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-2 pr-2">
                      <button className="text-[10px] font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        Leave Feedback
                      </button>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ); })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 mt-2">
                <div className="text-[11px] font-medium text-slate-500">Showing 1 to 7 of 7 models</div>
                <div className="flex items-center gap-1 text-[12px] font-semibold">
                  <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronLeft size={14} /></button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">1</button>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronRight size={14} /></button>
                </div>
              </div>
            </div>

            {/* Integrated Data Sources */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 mt-auto">
              <h3 className="text-[13px] font-bold text-slate-900 mb-4">Integrated Data Sources</h3>
              <div className="flex justify-between items-center px-4">
                {[
                  { icon: Monitor, name: 'PACS' },
                  { icon: Activity, name: 'MRI System' },
                  { icon: ShieldCheck, name: 'CT System' },
                  { icon: Box, name: 'X-Ray System' },
                  { icon: FlaskConical, name: 'Laboratory' },
                  { icon: Microscope, name: 'Pathology' },
                  { icon: ClipboardList, name: 'EMR / EHR' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 mb-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <s.icon size={18} strokeWidth={1.5} />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-700">{s.name}</div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 mt-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Connected
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="col-span-4 bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col relative overflow-y-auto max-h-[85vh]">
            
            <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 mb-6 w-fit">
              <ChevronLeft size={14} /> Back to all models
            </button>

            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                <Activity size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h2 className="text-[16px] font-bold text-slate-900 leading-tight mb-1">Lung Cancer Detection</h2>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">Active</span>
                </div>
                <div className="text-[12px] font-medium text-slate-500">CT Scan Analysis</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Version</div>
                <div className="text-[13px] font-bold text-slate-900">v3.0.1</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Accuracy</div>
                <div className="text-[13px] font-bold text-slate-900">96.2%</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Model Type</div>
                <div className="text-[13px] font-bold text-slate-900">CNN</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Sensitivity</div>
                <div className="text-[13px] font-bold text-slate-900">94%</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Input Modality</div>
                <div className="text-[13px] font-bold text-slate-900">CT Scan (DICOM)</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Specificity</div>
                <div className="text-[13px] font-bold text-slate-900">97%</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Inference Time</div>
                <div className="text-[13px] font-bold text-slate-900">2.1 sec</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Last Updated</div>
                <div className="text-[13px] font-bold text-slate-900">12 Aug 2025</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Doctor Agreement</div>
                <div className="text-[13px] font-bold text-slate-900">91%</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 mb-1">Deployed On</div>
                <div className="text-[13px] font-bold text-slate-900">Hospital Server</div>
              </div>
            </div>

            {/* Chart */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[12px] font-bold text-slate-900">Performance Trend <span className="text-slate-400 font-medium">(Accuracy)</span></h3>
                <button className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-700">
                  Last 6 Months <ChevronDown size={12} />
                </button>
              </div>
              <div className="h-[120px] w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} domain={[80, 100]} ticks={[85, 90, 95, 100]} />
                    <Line type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Doctor Feedback */}
            <div className="mb-8 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 mb-1">Doctor Feedback</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-[16px] font-bold text-slate-900">4.6<span className="text-[12px] text-slate-400">/5</span></div>
                    <div className="text-[10px] text-slate-500">(28 Reviews)</div>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">View All</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex text-blue-600 gap-0.5">
                       {[1,2,3,4].map(k => <Star key={k} size={10} fill="currentColor" />)}
                       <Star size={10} fill="currentColor" className="opacity-40" />
                       <span className="text-[10px] text-slate-500 ml-1">(5/5)</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-semibold text-right">
                      <div className="text-slate-700">Dr. Sharma</div>
                      12 Aug 2025
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-medium">The model has been very reliable for detecting pulmonary nodules. Great accuracy.</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex text-blue-600 gap-0.5">
                       {[1,2,3,4].map(k => <Star key={k} size={10} fill="currentColor" />)}
                       <Star size={10} className="text-slate-300" />
                       <span className="text-[10px] text-slate-500 ml-1">(4/5)</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-semibold text-right">
                      <div className="text-slate-700">Dr. Verma</div>
                      10 Aug 2025
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-medium">Good performance. Need improvement on low-quality scans.</p>
                </div>
              </div>
            </div>

            {/* Leave Your Feedback */}
            <div className="border-t border-slate-100 pt-6 mt-auto">
              <h3 className="text-[13px] font-bold text-slate-900 mb-3">Leave Your Feedback</h3>
              <div className="flex items-center gap-1.5 text-slate-300 mb-3 cursor-pointer">
                {[1,2,3,4,5].map(k => <Star key={k} size={16} />)}
              </div>
              <div className="relative">
                <textarea 
                  placeholder="Share your experience with this model..." 
                  className="w-full h-[80px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] outline-none focus:border-blue-500 resize-none mb-3 text-slate-700 placeholder:text-slate-400"
                ></textarea>
                <button className="w-full bg-[#1e40af] text-white py-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors shadow-md">
                  Submit Feedback <Send size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </HospitalLayout>
  )
}
