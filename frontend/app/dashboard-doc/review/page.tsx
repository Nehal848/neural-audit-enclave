"use client"

import React, { useState, useEffect } from "react"
import DocLayout from "@/components/doc-layout"
import { 
  CheckCircle2, XCircle, HelpCircle, Activity, 
  ShieldCheck, Loader2, AlertTriangle, Clock, FastForward
} from "lucide-react"

export default function ReviewPanelPage() {
  const [queue, setQueue] = useState<any[]>([])
  const [queueSize, setQueueSize] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  
  // Job ID for threshold/approval testing
  const [testJobId, setTestJobId] = useState<string>("")
  const [rlhfStatus, setRlhfStatus] = useState<any>(null)
  const [isPromoting, setIsPromoting] = useState(false)

  const getAuthHeaders = () => {
    const headers: any = { "Content-Type": "application/json" };
    try {
      const session = JSON.parse(localStorage.getItem("hospital_ai_session") || "{}");
      if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
    } catch (e) {}
    return headers;
  }

  const fetchQueue = () => {
    fetch("/api/hospital/rlhf/queue", { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setQueue(data.queue)
        setQueueSize(data.queue_size)
        setLoading(false)
      })
      .catch(e => { console.error(e); setLoading(false) })
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  const handleLabel = async (predId: string, label: string, score: number) => {
    setSubmittingId(predId)
    try {
      await fetch("/api/hospital/rlhf/label", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ prediction_id: predId, label, score })
      })
      fetchQueue()
      // If we're tracking a specific job, refresh its status
      if (testJobId) {
        handleCheckStatus()
      }
    } catch(e) {
      console.error(e)
    } finally {
      setSubmittingId(null)
    }
  }

  const handleCheckStatus = async () => {
    if(!testJobId) return
    try {
      const res = await fetch(`/api/hospital/model/${testJobId}/rlhf-status`, { headers: getAuthHeaders() })
      const data = await res.json()
      setRlhfStatus(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handlePromote = async () => {
    if(!testJobId) return
    setIsPromoting(true)
    try {
      const res = await fetch(`/api/hospital/model/${testJobId}/rlhf-progress`, {
        method: "POST", headers: getAuthHeaders()
      })
      const data = await res.json()
      if(res.ok) alert("Model Promoted to Regulatory Review successfully!")
      else alert(data.detail || "Failed to promote model")
      handleCheckStatus()
    } catch (e) { 
      console.error(e) 
    } finally {
      setIsPromoting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <DocLayout 
      title="Review Panel (RLHF)" 
      subtitle="Shadow Mode RLHF & Threshold Tracking"
      searchPlaceholder="Search predictions..."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* TOP CARDS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Activity size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">RLHF Queue</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{loading ? "..." : queueSize}</div>
              <div className="text-[11px] font-medium text-slate-500">Pending reviews</div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Threshold Tracking</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">Active</div>
              <div className="text-[11px] font-medium text-slate-500">Monitor model progress</div>
            </div>
          </div>
        </div>

        {/* TWO COLUMN */}
        <div className="grid grid-cols-2 gap-6 items-start">
          
          {/* RLHF QUEUE */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[400px]">
            <div className="mb-6">
               <h3 className="text-[18px] font-bold text-slate-900 mb-1">Shadow Predictions</h3>
               <p className="text-[13px] font-medium text-slate-500">Review background predictions to refine candidate models</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-[200px]"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-bold">Queue is empty!</p>
                <p className="text-xs">All shadow predictions reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map(q => (
                  <div key={q.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Job: {q.job_id.substring(0,8)}</div>
                        <div className="text-[14px] font-bold text-slate-900">Pred: {q.prediction}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Confidence</div>
                        <div className="text-[14px] font-bold text-slate-700">{(q.confidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <button 
                        disabled={submittingId === q.id}
                        onClick={() => handleLabel(q.id, "Correct", 1)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={18} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Correct</span>
                      </button>
                      <button 
                        disabled={submittingId === q.id}
                        onClick={() => handleLabel(q.id, "Uncertain", -1)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                      >
                        <HelpCircle size={18} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Uncertain</span>
                      </button>
                      <button 
                        disabled={submittingId === q.id}
                        onClick={() => handleLabel(q.id, "Incorrect", 0)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={18} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Incorrect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RLHF STATUS & TIMER */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
            <div className="mb-6">
               <h3 className="text-[18px] font-bold text-slate-900 mb-1">RLHF Progress Tracking</h3>
               <p className="text-[13px] font-medium text-slate-500">Monitor time limit and accuracy threshold</p>
            </div>

            <div className="mb-4">
               <input 
                 type="text" 
                 placeholder="Enter Job ID to track..."
                 value={testJobId}
                 onChange={e => setTestJobId(e.target.value)}
                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:border-blue-500 outline-none mb-3"
               />
               <button 
                 onClick={handleCheckStatus}
                 disabled={!testJobId}
                 className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-slate-900 transition-colors disabled:opacity-50"
               >
                 Check RLHF Status
               </button>
            </div>

            {rlhfStatus && (
              <div className={`mt-6 rounded-2xl p-5 border ${rlhfStatus.threshold_met ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                
                {rlhfStatus.status === 'REJECTED_CLINICAL' ? (
                  <div className="flex flex-col items-center justify-center p-4">
                     <AlertTriangle size={32} className="text-rose-500 mb-3" />
                     <h4 className="text-[15px] font-bold text-rose-800 text-center">RLHF Failed</h4>
                     <p className="text-[12px] text-rose-600 font-medium text-center mt-2">The evaluation period expired before the threshold was met. Model rejected.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <Clock size={24} className={rlhfStatus.time_remaining_seconds < 120 ? "text-rose-500 animate-pulse" : "text-blue-600"} />
                      <div>
                        <h4 className={`text-[15px] font-bold ${rlhfStatus.time_remaining_seconds < 120 ? "text-rose-600" : "text-blue-800"}`}>
                          Time Remaining
                        </h4>
                        <div className={`text-2xl font-black font-mono ${rlhfStatus.time_remaining_seconds < 120 ? "text-rose-600" : "text-blue-700"}`}>
                          {formatTime(rlhfStatus.time_remaining_seconds)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex justify-between text-[12px] font-bold text-slate-700 mb-2">
                          <span>RLHF Accuracy Target (95%)</span>
                          <span>{(rlhfStatus.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 border border-slate-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${rlhfStatus.threshold_met ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(100, (rlhfStatus.accuracy / 0.95) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {rlhfStatus.threshold_met && rlhfStatus.status === 'IN_RLHF' ? (
                      <button 
                        onClick={handlePromote}
                        disabled={isPromoting}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition-colors shadow-sm flex justify-center items-center gap-2"
                      >
                        {isPromoting ? <Loader2 size={18} className="animate-spin" /> : <FastForward size={18} />}
                        Promote to Regulatory Review
                      </button>
                    ) : rlhfStatus.status === 'REGULATORY_REVIEW' ? (
                      <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200">
                        <CheckCircle2 size={16} /> Already Promoted to CDSCO Gate
                      </div>
                    ) : (
                      <div className="bg-white/50 text-slate-500 p-3 rounded-xl text-center text-xs font-semibold border border-slate-200">
                        Threshold not yet met. Continue RLHF labels.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
          </div>
        </div>

      </div>
    </DocLayout>
  )
}
