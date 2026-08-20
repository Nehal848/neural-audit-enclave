"use client"

import DocLayout from "@/components/doc-layout"
import { ShieldCheck, XCircle, UserCheck, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClinicalGovernancePage() {
  const router = useRouter()
  const [jobId, setJobId] = useState("")
  const [reason, setReason] = useState("")
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const getAuthHeaders = () => {
    const headers: any = { "Content-Type": "application/json" };
    try {
      const session = JSON.parse(localStorage.getItem("hospital_ai_session") || "{}");
      if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
    } catch (e) {}
    return headers;
  }

  const handleAction = async (approved: boolean) => {
    try {
      const res = await fetch(`/api/hospital/model/${jobId}/clinical-governance`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ approved, reason: approved ? "" : reason })
      })
      const data = await res.json()
      if (res.ok) {
        setStatusMsg({ type: 'success', text: data.message })
        if (approved) {
          setTimeout(() => router.push("/dashboard-doc/review"), 2000)
        } else {
          setShowRejectModal(true)
        }
      } else {
        setStatusMsg({ type: 'error', text: data.detail || "Error processing request" })
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message })
    }
  }

  return (
    <DocLayout>
      <div className="p-8 max-w-4xl mx-auto font-sans text-slate-900">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Clinical Governance Gate</h1>
          <p className="text-sm text-slate-500 font-medium">Hospital In-charge / HOD Review before RLHF</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
          <div className="mb-6">
             <label className="block text-sm font-bold text-slate-700 mb-2">Target Model (Job ID)</label>
             <input 
               type="text" 
               placeholder="Enter Job ID..."
               value={jobId}
               onChange={e => setJobId(e.target.value)}
               className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
             />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              Evaluation Guidelines
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
              <li>Verify the model's leaderboard accuracy meets clinical safety standards.</li>
              <li>Ensure the dataset used for training complies with hospital data guidelines.</li>
              <li>If approved, the model will proceed to the RLHF (Human Feedback) stage.</li>
              <li>If rejected due to low accuracy, you must mandate dataset modification.</li>
            </ul>
          </div>

          {statusMsg && !showRejectModal && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {statusMsg.text}
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => handleAction(true)}
              disabled={!jobId}
              className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={18} /> Approve for RLHF
            </button>
            <button 
              onClick={() => setShowRejectModal(true)}
              disabled={!jobId}
              className="flex-1 bg-rose-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <XCircle size={18} /> Reject Model
            </button>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <AlertTriangle size={28} />
              <h2 className="text-xl font-bold">Reject Model</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6 font-medium">Please provide a reason for rejecting this model. It will be returned or discarded.</p>
            
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Model accuracy too low, hence rejected."
              className="w-full h-24 border border-slate-200 rounded-xl p-3 text-sm focus:border-rose-500 outline-none mb-6 resize-none"
            ></textarea>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  handleAction(false);
                  setTimeout(() => router.push("/dashboard-doc/create"), 1000);
                }}
                className="w-full bg-slate-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors"
              >
                Modify Dataset (Re-train)
              </button>
              <button 
                onClick={() => {
                  handleAction(false);
                  setTimeout(() => router.push("/dashboard-doc"), 1000);
                }}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Exit & Discard
              </button>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="w-full text-slate-400 py-2 text-xs font-bold hover:text-slate-600 transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DocLayout>
  )
}
