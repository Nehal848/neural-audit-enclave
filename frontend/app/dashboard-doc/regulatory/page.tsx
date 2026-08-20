"use client"

import DocLayout from "@/components/doc-layout"
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegulatoryApprovalPage() {
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
      const res = await fetch(`/api/hospital/model/${jobId}/regulatory-approval`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ approved, reason: approved ? "" : reason })
      })
      const data = await res.json()
      if (res.ok) {
        setStatusMsg({ type: 'success', text: data.message })
        if (approved) {
          setTimeout(() => router.push("/dashboard-doc/marketplace"), 2000)
        } else {
          setShowRejectModal(false)
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
          <h1 className="text-2xl font-bold tracking-tight mb-2">CDSCO / Regulatory Approval</h1>
          <p className="text-sm text-slate-500 font-medium">Final sign-off for model deployment</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
          <div className="mb-6">
             <label className="block text-sm font-bold text-slate-700 mb-2">Target Model (Job ID)</label>
             <input 
               type="text" 
               placeholder="Enter Job ID..."
               value={jobId}
               onChange={e => setJobId(e.target.value)}
               className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
             />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Deployment Checklist
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
              <li>Confirm the model has crossed the RLHF accuracy threshold.</li>
              <li>Verify the evaluation period was successfully completed without time limit expiration.</li>
              <li>Ensure all CDSCO/FDA compliance checks are satisfied for production use.</li>
              <li>If approved, the model will be deployed to the active clinical environment.</li>
              <li>If rejected, the model returns to the RLHF stage for further refinement.</li>
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
              <CheckCircle2 size={18} /> Approve & Deploy
            </button>
            <button 
              onClick={() => setShowRejectModal(true)}
              disabled={!jobId}
              className="flex-1 bg-amber-500 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <XCircle size={18} /> Reject & Return to RLHF
            </button>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertTriangle size={28} />
              <h2 className="text-xl font-bold">Reject & Return to RLHF</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6 font-medium">Please provide feedback for the rejection. The model will be returned to the RLHF queue for further training.</p>
            
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Bias detected in diverse age groups."
              className="w-full h-24 border border-slate-200 rounded-xl p-3 text-sm focus:border-amber-500 outline-none mb-6 resize-none"
            ></textarea>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleAction(false)}
                className="w-full bg-slate-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors"
              >
                Submit & Return to RLHF
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
