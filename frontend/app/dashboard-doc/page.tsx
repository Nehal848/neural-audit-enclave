"use client"

"use client"
import LoadingScreen from "@/components/loading-screen"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import DocLayout from "@/components/doc-layout"
import { 
  Wind, Brain, Heart, Activity, Bone, Star, Clock, 
  Target, Scan, Microscope, FlaskConical, Database, FileText,
  Box, Play, TrendingUp, BarChart2, CheckCircle2
} from "lucide-react"

export default function DocDashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [dashData, setDashData] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [customResult, setCustomResult] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const getAuthHeaders = (isFormData = false) => {
    const headers: any = {};
    try {
      const session = JSON.parse(localStorage.getItem("hospital_ai_session") || "{}");
      if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
    } catch (e) {}
    if (!isFormData) headers["Content-Type"] = "application/json";
    return headers;
  }

  const loadCustomModel = async (jobId: string) => {
    if (!jobId) {
      setModelInfo(null);
      setFormData({});
      setCustomResult(null);
      return;
    }
    try {
      const res = await fetch(`/api/models/custom/${jobId}/info`, { headers: getAuthHeaders() });
      const data = await res.json();
      setModelInfo(data);
      setFormData({});
      setCustomResult(null);
    } catch (e) {
      console.error(e);
    }
  };

  const runCustomInference = async () => {
    if (!modelInfo) return;
    setCustomLoading(true);
    setCustomResult(null);
    try {
      const res = await fetch(`/api/models/custom/${modelInfo.job_id}/predict`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setCustomResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/hospital/dashboard")
      .then(res => res.json())
      .then(data => setDashData(data))
      .catch(console.error)
      .finally(() => setIsLoaded(true));
      
    fetch("/api/audit/logs")
      .then(res => res.json())
      .then(data => setAuditLogs(Array.isArray(data) ? data : (data.logs || [])))
      .catch(console.error);

    // Connect to WebSocket for real-time training updates
    const ws = new WebSocket("ws://localhost:8000/api/ws/dashboard");
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.training_models) {
          setDashData((prev: any) => prev ? { ...prev, training_models: payload.training_models } : prev);
        }
      } catch (e) { console.error("WS Parse error", e) }
    };
    return () => ws.close();
  }, [])


  if (!isLoaded) return <LoadingScreen />

  return (
    <DocLayout 
      title="Good Morning, CityCare Admin" 
      subtitle="Here's your clinical intelligence overview"
    >
      <div className="flex-1 w-full overflow-y-auto px-4 md:px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* ── ACTIVE & IN USE MODELS ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <h2 className="text-[16px] font-bold text-slate-900">Active & In Use Models</h2>
             <Link href="/dashboard-doc/models" className="text-[12px] font-bold text-blue-600 hover:text-blue-700">View all models</Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {(dashData?.active_models || []).map((m: any, i: number) => {
              const icon = m.name.includes("Pneumonia") ? Wind : (m.name.includes("Cancer") ? Brain : (m.name.includes("Diabetes") ? Activity : Box));
              const IconComp = icon;
              const color = m.name.includes("Pneumonia") ? 'text-blue-600' : (m.name.includes("Cancer") ? 'text-purple-600' : 'text-emerald-600');
              const bg = m.name.includes("Pneumonia") ? 'bg-blue-50' : (m.name.includes("Cancer") ? 'bg-purple-50' : 'bg-emerald-50');
              const chart = m.name.includes("Pneumonia") ? 'text-blue-500' : (m.name.includes("Cancer") ? 'text-purple-500' : 'text-emerald-500');
              return (
              <div key={i} className="min-w-[280px] bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col shrink-0">
                <div className="flex gap-4 items-center mb-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color} shrink-0`}>
                    <IconComp size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">{m.name}</h3>
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">{m.version}</div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-5">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">Accuracy</div>
                    <div className="text-[22px] font-bold text-slate-900 leading-none">{m.accuracy}%</div>
                  </div>
                  <div className={`w-20 h-8 ${chart}`}>
                    <svg viewBox="0 0 100 30" fill="none" className="w-full h-full stroke-current" preserveAspectRatio="none">
                      <path d="M0,25 C20,20 40,30 50,15 C60,5 80,20 100,5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">Avg. Confidence</span>
                    <span className="font-bold text-slate-900">N/A</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">Version</span>
                    <span className="font-bold text-slate-900">{m.version}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">Status</span>
                    <span className="font-bold text-slate-900">{m.status}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* ── MIDDLE GRID (3 COLUMNS) ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6 flex-1">
          
          {/* Recent Feedback */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
               <h3 className="text-[14px] font-bold text-slate-900">Recent Feedback from Doctors</h3>
               <Link href="/dashboard-doc/models" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="space-y-5">
              {auditLogs && auditLogs.slice(0, 4).map((f: any, i: number) => {
                const log = {
                  action: f.doctor_action ? `Doctor ${f.doctor_action} Case` : 'Model Validation',
                  details: `Model: ${f.champion_model} | Score: ${f.confidence_score}`,
                  time: f.timestamp ? new Date(f.timestamp).toLocaleTimeString() : 'Recent'
                };
                return (
                <div key={i} className="flex gap-4 items-start border-b border-slate-50 pb-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-[12px] font-bold text-slate-900">{log.action}</div>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 leading-snug mb-1.5 font-mono">{log.details}</p>
                    <div className="text-[9px] font-semibold text-slate-400 text-right">{log.time}</div>
                  </div>
                </div>
              ); })}
            </div>
          </div>

          {/* Training (Ongoing) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
               <h3 className="text-[14px] font-bold text-slate-900">Training (Ongoing)</h3>
               <Link href="/dashboard-doc/integration" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="space-y-5">
              {(dashData?.training_models || []).map((t: any, i: number) => {
                const IconComp = Activity;
                return (
                <div key={i} className="flex gap-4 items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600`}>
                    <IconComp size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <div className="text-[12px] font-bold text-slate-900">{t.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">{t.stage}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-bold text-slate-900">{t.progress}%</div>
                        <div className="text-[9px] font-medium text-slate-500">{t.eta}</div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-blue-600 rounded-full`} style={{ width: `${t.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
               <h3 className="text-[14px] font-bold text-slate-900">Integration Status</h3>
               <Link href="/dashboard-doc/settings" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {(dashData?.lab_status || []).map((sys: any, i: number) => {
                const icon = sys.system.includes("MRI") ? Target : (sys.system.includes("CT") ? Scan : (sys.system.includes("X-Ray") ? Bone : Activity));
                const IconComp = icon;
                return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${sys.status === 'Active' ? 'border-emerald-200' : 'border-rose-200'} bg-white shadow-sm`}>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                    <IconComp size={14} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-900">{sys.system}</div>
                    <div className={`text-[10px] font-semibold ${sys.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>{sys.status === 'Active' ? 'Active Connection' : 'Disconnected'}</div>
                  </div>
                </div>
              )})}
            </div>
          </div>

        </div>

        {/* ── CUSTOM AI INFERENCE ENGINE ────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col mb-6">
           <div className="flex justify-between items-center mb-5">
              <h3 className="text-[14px] font-bold text-slate-900">Custom ML Inference Engine</h3>
           </div>
           <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
                 <div className="text-[12px] font-bold text-slate-700">Select Deployed Model</div>
                 <select 
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-blue-500"
                    onChange={e => loadCustomModel(e.target.value)}
                 >
                    <option value="">-- Select Model --</option>
                    {(dashData?.active_models || []).filter((m:any) => m.ownership === "Hospital").map((m: any, i: number) => (
                      <option key={i} value={m.id}>{m.name}</option>
                    ))}
                 </select>
                 {modelInfo && (
                   <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                      <div className="text-[11px] font-bold text-blue-800 mb-1">Model Details</div>
                      <div className="text-[10px] text-blue-600">Problem Type: {modelInfo.problem_type}</div>
                      <div className="text-[10px] text-blue-600 mt-1">Requires {modelInfo.feature_names.length} input features.</div>
                   </div>
                 )}
              </div>
              <div className="col-span-2">
                 {modelInfo ? (
                   <form onSubmit={e => { e.preventDefault(); runCustomInference(); }} className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                         {modelInfo.feature_names.map((feat: string, i: number) => (
                           <div key={i}>
                             <label className="block text-[10px] font-bold text-slate-600 mb-1">{feat}</label>
                             <input 
                               type="text" 
                               required 
                               className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] text-slate-700 outline-none focus:border-blue-500"
                               value={formData[feat] || ""}
                               onChange={e => setFormData({...formData, [feat]: e.target.value})}
                             />
                           </div>
                         ))}
                      </div>
                      <div className="flex gap-4 items-center pt-2">
                        <button type="submit" disabled={customLoading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50">
                           {customLoading ? "Running Inference..." : "Run ML Inference"}
                        </button>
                        {customResult && (
                          <div className="flex items-center gap-3 p-2 px-4 rounded-xl border border-emerald-200 bg-emerald-50">
                             <CheckCircle2 size={16} className="text-emerald-600" />
                             <div>
                               <div className="text-[10px] font-bold text-emerald-800">Prediction: {customResult.prediction}</div>
                               {customResult.confidence && <div className="text-[9px] font-medium text-emerald-600">Confidence: {customResult.confidence}%</div>}
                             </div>
                          </div>
                        )}
                        {customResult?.error && (
                           <div className="text-[10px] text-rose-500 font-bold">{customResult.error}</div>
                        )}
                      </div>
                   </form>
                 ) : (
                   <div className="h-full min-h-[150px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-[12px] font-semibold text-slate-400">
                     Select a custom model to generate inference form
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* ── BOTTOM METRICS ROW ──────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4">
          
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
               <Box size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Total Models</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">12</div>
               <div className="text-[10px] font-bold text-emerald-600">Active</div>
             </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
               <Play size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Models In Use</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">8</div>
               <div className="text-[10px] font-bold text-emerald-600">Running</div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
               <TrendingUp size={18} />
             </div>
             <div className="flex-1">
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Avg. Model Accuracy</div>
               <div className="flex justify-between items-end">
                 <div className="text-[16px] font-bold text-slate-900 leading-none">94.6%</div>
                 <div className="w-12 h-4 text-blue-500">
                    <svg viewBox="0 0 100 30" fill="none" className="w-full h-full stroke-current" preserveAspectRatio="none">
                      <path d="M0,25 L20,15 L40,20 L60,10 L80,15 L100,5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="flex-1">
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Total Predictions</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">18,562</div>
               <div className="flex justify-between items-center">
                 <div className="text-[10px] font-medium text-slate-500">This Week</div>
                 <div className="flex items-end gap-0.5 h-3">
                   {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                     <div key={i} className="w-[3px] bg-blue-500 rounded-sm" style={{ height: `${h}%` }}></div>
                   ))}
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
               <Clock size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Avg. Response Time</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none">2.4 sec</div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
               <CheckCircle2 size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">System Health</div>
               <div className="text-[11px] font-bold text-emerald-600 leading-tight">All Systems Operational</div>
             </div>
          </div>

        </div>

      </div>
    </DocLayout>
  )
}
