"use client"

import React, { useState, useEffect } from "react"
import DocLayout from "@/components/doc-layout"
import { 
  CheckCircle2, XCircle, HelpCircle, Activity, 
  ShieldCheck, Loader2, AlertTriangle, ArrowRight,
  Database, UserCheck
} from "lucide-react"

export default function ReviewPanelPage() {
  const [queue, setQueue] = useState<any[]>([])
  const [queueSize, setQueueSize] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  
  // Job ID for threshold/approval testing
  const [testJobId, setTestJobId] = useState<string>("")
  const [thresholdStatus, setThresholdStatus] = useState<any>(null)

  const fetchQueue = () => {
    fetch("/api/hospital/rlhf/queue")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prediction_id: predId, label, score })
      })
      fetchQueue()
    } catch(e) {
      console.error(e)
    } finally {
      setSubmittingId(null)
    }
  }

  const handleCheckThreshold = async () => {
    if(!testJobId) return
    try {
      const res = await fetch(`/api/hospital/automl/job/${testJobId}/threshold-check`)
      const data = await res.json()
      setThresholdStatus(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleApprove = async () => {
    if(!testJobId) return
    try {
      const res = await fetch(`/api/hospital/automl/job/${testJobId}/governing-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true, reviewer_notes: "Approved via Review Panel" })
      })
      if(res.ok) alert("Model Approved & Deployed successfully!")
      else { const d = await res.json(); alert(d.detail) }
    } catch (e) { console.error(e) }
  }

  return (
    <DocLayout 
      title="Review Panel" 
      subtitle="Shadow Mode RLHF & Governing Body Approvals"
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
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Governing Body</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">Gate</div>
              <div className="text-[11px] font-medium text-slate-500">Threshold enforcement</div>
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

          {/* GOVERNING APPROVAL */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
            <div className="mb-6">
               <h3 className="text-[18px] font-bold text-slate-900 mb-1">Governing Body Approval</h3>
               <p className="text-[13px] font-medium text-slate-500">Check model thresholds and issue final deployment license</p>
            </div>

            <div className="mb-4">
               <input 
                 type="text" 
                 placeholder="Enter Job ID to evaluate..."
                 value={testJobId}
                 onChange={e => setTestJobId(e.target.value)}
                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[13px] focus:border-blue-500 outline-none mb-3"
               />
               <button 
                 onClick={handleCheckThreshold}
                 disabled={!testJobId}
                 className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-slate-900 transition-colors disabled:opacity-50"
               >
                 Run Threshold Check
               </button>
            </div>

            {thresholdStatus && (
              <div className={`mt-6 rounded-2xl p-5 border ${thresholdStatus.eligible_for_governing_body_approval ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {thresholdStatus.eligible_for_governing_body_approval ? (
                    <ShieldCheck size={24} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={24} className="text-rose-500" />
                  )}
                  <h4 className={`text-[14px] font-bold ${thresholdStatus.eligible_for_governing_body_approval ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {thresholdStatus.eligible_for_governing_body_approval ? "Eligible for Approval" : "Threshold Not Met"}
                  </h4>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-[12px] font-medium text-slate-600">
                    <span>Base Accuracy:</span>
                    <span className="font-bold text-slate-900">{(thresholdStatus.model_accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-[12px] font-medium text-slate-600">
                    <span>Target Threshold:</span>
                    <span className="font-bold text-slate-900">{(thresholdStatus.threshold * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-[12px] font-medium text-slate-600">
                    <span>Shadow Cases Reviewed:</span>
                    <span className="font-bold text-slate-900">{thresholdStatus.shadow_reviewed_cases} / {thresholdStatus.min_sample_size}</span>
                  </div>
                </div>

                {!thresholdStatus.eligible_for_governing_body_approval && (
                  <p className="text-[11px] text-rose-600 font-medium">{thresholdStatus.reason}</p>
                )}

                {thresholdStatus.eligible_for_governing_body_approval && (
                  <button 
                    onClick={handleApprove}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-emerald-700 transition-colors shadow-sm flex justify-center items-center gap-2"
                  >
                    <UserCheck size={16} /> Finalize CDSCO-Style Approval
                  </button>
                )}
              </div>
            )}
            
          </div>
        </div>

      </div>
    </DocLayout>
  )
}
