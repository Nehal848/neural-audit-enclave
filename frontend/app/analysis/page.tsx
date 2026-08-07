"use client"

import React, { useState } from "react"
import HospitalLayout from "@/components/hospital-layout"
import { 
  Calendar, ChevronDown, Filter, Search, MoreHorizontal, ChevronRight, CheckSquare, Square,
  User, Activity, CheckCircle2, AlertCircle, FileText, Download, ShieldCheck, Crosshair, PenTool, Box,
  Loader2, Eye, EyeOff
} from "lucide-react"

const MOCK_PATIENTS = [
  { name: 'Priya Mehta', id: 'PT-78291', source: 'MRI System', sourceSub: 'Brain MRI', model: 'Brain Tumor Detection', ver: 'v2.1.0', status: 'Analysis Complete', state: 'success', time: '10:24 AM', date: '19 Aug 2025', img: 'https://i.pravatar.cc/150?u=priya', finding: 'abnormal mass in frontal lobe', confidence: '94.2%', evidence: ['hyperintensity on T2', 'midline shift'] },
  { name: 'Ramesh Verma', id: 'PT-78290', source: 'CT System', sourceSub: 'Chest CT', model: 'Lung Cancer Detection', ver: 'v3.0.1', status: 'Analysis Complete', state: 'success', time: '09:11 AM', date: '19 Aug 2025', img: 'https://i.pravatar.cc/150?u=ramesh', finding: 'pulmonary nodule in right upper lobe', confidence: '92.6%', evidence: ['irregular margins', 'spiculated appearance'] },
  { name: 'Alisha Khan', id: 'PT-78289', source: 'USG System', sourceSub: 'Thyroid USG', model: 'Thyroid Nodule Classifier', ver: 'v1.4.2', status: 'Analysis Complete', state: 'success', time: '08:35 AM', date: '19 Aug 2025', img: 'https://i.pravatar.cc/150?u=alisha', finding: 'hypoechoic nodule', confidence: '88.5%', evidence: ['microcalcifications', 'taller than wide'] },
]

export default function AnalysisPage() {
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[1])
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [showDeid, setShowDeid] = useState(false)

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/analyze/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          finding: selectedPatient.finding,
          confidence: selectedPatient.confidence,
          model_name: selectedPatient.model,
          model_version: selectedPatient.ver,
          evidence_points: selectedPatient.evidence
        })
      })
      const data = await res.json()
      setReport(data)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <HospitalLayout 
      title="Analysis & Reports" 
      subtitle="Detailed AI-powered analysis and reports for your patients"
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        <div className="grid grid-cols-12 gap-6 flex-1">
          
          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Recent Analyses & Reports */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-semibold text-slate-900">Recent Analyses & Reports</h3>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <Calendar size={14} className="text-slate-400" /> 12 Aug 2025 - 19 Aug 2025 <Calendar size={14} className="text-slate-400 ml-1" />
                  </button>
                  <button className="flex items-center gap-2 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    All Modality <ChevronDown size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-500 mb-3 px-2">
                <div className="col-span-3 pl-2">Patient Name</div>
                <div className="col-span-2">Data Source</div>
                <div className="col-span-3">AI Model Run</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Action</div>
              </div>

              {/* Table Body */}
              <div className="space-y-2 flex-1">
                {MOCK_PATIENTS.map((row, i) => (
                  <div key={i} onClick={() => { setSelectedPatient(row); setReport(null); setShowDeid(false) }} className={`grid grid-cols-12 items-center px-2 py-3 rounded-xl transition-colors cursor-pointer ${selectedPatient.id === row.id ? 'bg-blue-50/50 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <div className="col-span-3 flex items-center gap-3">
                      <img src={row.img} alt={row.name} className="w-8 h-8 rounded-full border border-slate-200 shrink-0 object-cover" />
                      <div>
                        <div className="text-[13px] font-semibold text-slate-900 leading-tight mb-0.5">{row.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">PID: {row.id}</div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-start gap-2">
                      <div className="mt-0.5 text-slate-400"><Box size={12} /></div>
                      <div>
                        <div className="text-[12px] font-semibold text-slate-900 leading-tight mb-0.5">{row.source}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{row.sourceSub}</div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-[12px] font-semibold text-slate-900 leading-tight mb-0.5">{row.model}</div>
                      <div className="text-[10px] font-medium text-blue-500">{row.ver}</div>
                    </div>
                    <div className="col-span-2">
                      <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${row.state === 'success' ? 'text-emerald-700' : 'text-amber-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${row.state === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {row.status}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[11px] font-bold text-blue-600 hover:underline">Select</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Report */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 relative">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-[16px] font-semibold text-slate-900">Selected Report</h3>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200/60 tracking-wide uppercase">Report ID: REP-{selectedPatient.id}</span>
                
                {!report && !generating && (
                  <button onClick={handleGenerateReport} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                    <Activity size={14} /> Generate LLM Analysis
                  </button>
                )}
                {generating && (
                  <button disabled className="ml-auto bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[12px] font-bold flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-500" /> Generating...
                  </button>
                )}
                {report && (
                   <button onClick={() => setShowDeid(!showDeid)} className={`ml-auto px-4 py-2 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-colors border ${showDeid ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                     {showDeid ? <EyeOff size={14} /> : <Eye size={14} />} {showDeid ? "Hide De-ID Demo" : "Show De-ID Demo"}
                   </button>
                )}
              </div>

              {/* Patient Detail Bar */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
                  <img src={selectedPatient.img} alt={selectedPatient.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                  <div>
                    <div className="text-[14px] font-bold text-slate-900 mb-0.5">{selectedPatient.name}</div>
                    <div className="text-[11px] font-medium text-slate-500">PID: {selectedPatient.id}</div>
                  </div>
                </div>
                <div className="px-6 border-r border-slate-100 flex-1">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Data Source</div>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                    <Activity size={14} className="text-blue-500" /> {selectedPatient.source}
                  </div>
                </div>
                <div className="px-6 border-r border-slate-100 flex-1">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">AI Model Run</div>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                    <Box size={14} className="text-blue-500" /> {selectedPatient.model}
                  </div>
                </div>
                <div className="pl-6 pr-2">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Status</div>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-blue-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> {report ? "Report Generated" : selectedPatient.status}
                  </div>
                </div>
              </div>

              {/* De-identification Demo View */}
              {showDeid && report && (
                <div className="mb-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-300">
                  <div className="flex items-center gap-2 mb-4 text-purple-400">
                    <ShieldCheck size={18} />
                    <h4 className="text-[13px] font-bold">Privacy Layer (Demo View)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Original Payload (Internal)</div>
                      <pre className="text-[11px] font-mono whitespace-pre-wrap text-emerald-400">
{JSON.stringify(report.deidentification_log.original_payload, null, 2)}
                      </pre>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative">
                      <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-slate-600"><ArrowRight size={20} /></div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sanitized Payload (Sent to Gemini API)</div>
                      <pre className="text-[11px] font-mono whitespace-pre-wrap text-blue-400">
{JSON.stringify(report.deidentification_log.sanitized_payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-4 text-[11px] bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <strong className="text-slate-400">Stripped Fields:</strong> {report.deidentification_log.stripped_fields.join(", ")}
                  </div>
                </div>
              )}

              {/* Sub-cards */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Report Summary */}
                <div className="col-span-12 lg:col-span-7 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex">
                   {/* Circle Score */}
                   <div className="flex flex-col items-center justify-center shrink-0 w-32 border-r border-slate-200/60 pr-5 mr-5">
                      <div className="text-[12px] font-semibold text-slate-900 mb-4 self-start">Report Summary</div>
                      <div className="relative mb-3 flex items-center justify-center w-24 h-24">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="48" cy="48" r="44" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                          <circle cx="48" cy="48" r="44" stroke="#1e3a8a" strokeWidth="6" fill="none" strokeDasharray="276" strokeDashoffset="20" strokeLinecap="round" />
                        </svg>
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <span className="text-[20px] font-bold text-slate-900 leading-none mb-1">{selectedPatient.confidence}</span>
                          <span className="text-[9px] font-medium text-slate-500 text-center leading-tight">Confidence<br/>Score</span>
                        </div>
                      </div>
                      <div className="bg-slate-200/50 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm mt-2">
                        High Confidence
                      </div>
                   </div>

                   {/* Key Findings Text */}
                   <div className="flex-1 flex flex-col justify-center">
                     {report ? (
                       <>
                         <div className="mb-4">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600"><Activity size={14} /></div>
                             <h4 className="text-[13px] font-bold text-slate-900">Key Finding (WHY)</h4>
                           </div>
                           <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                             {report.report_sections.why}
                           </p>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600"><ShieldCheck size={14} /></div>
                             <h4 className="text-[13px] font-bold text-slate-900">AI Reasoning (HOW)</h4>
                           </div>
                           <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                             {report.report_sections.how}
                           </p>
                         </div>
                       </>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-100 rounded-xl p-4">
                         <FileText size={32} className="mb-2 opacity-50 text-blue-300" />
                         <p className="text-[12px] font-bold">Analysis Not Started</p>
                         <p className="text-[10px] text-center mt-1">Click "Generate LLM Analysis" to run the mock Gemini pipeline.</p>
                       </div>
                     )}
                   </div>
                </div>

                {/* Report Details */}
                <div className="col-span-12 lg:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
                   <h4 className="text-[13px] font-bold text-slate-900 mb-4">Report Details</h4>
                   <div className="space-y-3">
                     {[
                       { label: 'Model Type', val: selectedPatient.model },
                       { label: 'Input Modality', val: selectedPatient.sourceSub },
                       { label: 'AI Model Version', val: selectedPatient.ver },
                       { label: 'Report Generated By', val: report ? `Gemini API (${report.generation_mode})` : 'ELVON Intelligence' },
                       { label: 'De-ID Pipeline', val: report ? 'Active & Verifed' : 'Standby' },
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-[11px]">
                         <span className="font-semibold text-slate-500">{item.label}</span>
                         <span className="font-bold text-slate-900">{item.val}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Notice */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <ShieldCheck size={14} className="text-emerald-500" />
              This report is AI-generated and intended for clinical decision support only. Final diagnosis rests with the treating physician.
            </div>

          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[400px]">
              <h3 className="text-[16px] font-semibold text-slate-900 mb-6">Original Data Sources</h3>
              <div className="flex items-center justify-center h-48 bg-slate-100 rounded-2xl border border-slate-200 mb-4 text-slate-400">
                [ {selectedPatient.sourceSub} viewer mock ]
              </div>
              <div className="text-[12px] font-bold text-slate-700">Identified Markers:</div>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {selectedPatient.evidence.map(ev => (
                  <li key={ev} className="text-[11px] text-slate-600 font-medium">{ev}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </HospitalLayout>
  )
}
