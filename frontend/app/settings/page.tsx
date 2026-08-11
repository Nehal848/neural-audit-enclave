"use client"

import React, { useState, useEffect } from "react"
import HospitalLayout from "@/components/hospital-layout"
import { 
  User, Edit2, Lock, ChevronRight, Clock, Brain, Bell, 
  Link as LinkIcon, ShieldCheck, Info, Headphones, LogOut,
  Target, Scan, Bone, FlaskConical, Microscope, Activity, CheckCircle2
} from "lucide-react"

// A simple toggle switch component
const ToggleSwitch = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${active ? 'bg-blue-800' : 'bg-slate-300'}`}
  >
    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
)

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/settings/integrations")
      .then(res => res.json())
      .then(data => setIntegrations(data.integrations || []))
      .catch(console.error)
  }, [])
  const [toggles, setToggles] = useState({
    aiConfidence: true,
    aiExplanation: true,
    highRiskAlerts: true,
    analysisComplete: true,
    highRiskPatient: true,
    newReportGenerated: true
  })

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <HospitalLayout 
      title="Settings" 
      subtitle="Manage your account and preferences"
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6">
        
        <div className="grid grid-cols-2 gap-6">
          
          {/* 1. Profile */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                  <User size={18} strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">1. Profile</h3>
              </div>
              <button className="flex items-center gap-2 text-[11px] font-bold text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                <Edit2 size={12} /> Edit
              </button>
            </div>
            <div className="space-y-5 flex-1 pt-2">
              <div className="flex justify-between items-center border-b border-slate-50 pb-5">
                <div className="text-[12px] font-medium text-slate-500">Full Name</div>
                <div className="text-[12px] font-semibold text-slate-900">Dr. Ananya Sharma</div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-5">
                <div className="text-[12px] font-medium text-slate-500">Medical Registration No.</div>
                <div className="text-[12px] font-semibold text-slate-900">MCI-OD-567891</div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-5">
                <div className="text-[12px] font-medium text-slate-500">Hospital</div>
                <div className="text-[12px] font-semibold text-slate-900">AIIMS Bhubaneswar</div>
              </div>
              <div className="flex justify-between items-center pb-2">
                <div className="text-[12px] font-medium text-slate-500">Email</div>
                <div className="text-[12px] font-semibold text-slate-900">ananya.sharma@aiims.edu</div>
              </div>
            </div>
          </div>

          {/* 2. Security */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <Lock size={18} strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">2. Security</h3>
            </div>
            <div className="space-y-2 flex-1 pt-2">
              <button className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4 text-[12px] font-semibold text-slate-700">
                  <Lock size={16} className="text-slate-400" /> Change Password
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700" />
              </button>
              <button className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4 text-[12px] font-semibold text-slate-700">
                  <ShieldCheck size={16} className="text-slate-400" /> Two-Factor Authentication
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">Enabled</span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700" />
                </div>
              </button>
              <div className="w-full flex justify-between items-center p-4 rounded-xl border border-transparent">
                <div className="flex items-center gap-4 text-[12px] font-semibold text-slate-700">
                  <Clock size={16} className="text-slate-400" /> Last Login
                </div>
                <div className="text-[11px] font-medium text-slate-500">18 Jul 2025, 02:14 AM</div>
              </div>
            </div>
          </div>

          {/* 3. AI Preferences */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <Brain size={18} strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">3. AI Preferences</h3>
            </div>
            <div className="space-y-6 flex-1 pt-2">
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 mb-0.5">Show AI Confidence</div>
                  <div className="text-[11px] font-medium text-slate-500">Display confidence score in reports</div>
                </div>
                <ToggleSwitch active={toggles.aiConfidence} onClick={() => toggle('aiConfidence')} />
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 mb-0.5">Show AI Explanation</div>
                  <div className="text-[11px] font-medium text-slate-500">Display AI reasoning and explanation</div>
                </div>
                <ToggleSwitch active={toggles.aiExplanation} onClick={() => toggle('aiExplanation')} />
              </div>
              <div className="flex justify-between items-center pb-2">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 mb-0.5">High Risk Alerts</div>
                  <div className="text-[11px] font-medium text-slate-500">Get alerts for high-risk patients</div>
                </div>
                <ToggleSwitch active={toggles.highRiskAlerts} onClick={() => toggle('highRiskAlerts')} />
              </div>
            </div>
          </div>

          {/* 4. Notifications */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <Bell size={18} strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">4. Notifications</h3>
            </div>
            <div className="space-y-6 flex-1 pt-2">
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 mb-0.5">Analysis Complete</div>
                  <div className="text-[11px] font-medium text-slate-500">Notify when analysis is completed</div>
                </div>
                <ToggleSwitch active={toggles.analysisComplete} onClick={() => toggle('analysisComplete')} />
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 mb-0.5">High Risk Patient</div>
                  <div className="text-[11px] font-medium text-slate-500">Notify for high-risk patient alerts</div>
                </div>
                <ToggleSwitch active={toggles.highRiskPatient} onClick={() => toggle('highRiskPatient')} />
              </div>
              <div className="flex justify-between items-center pb-2">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900 mb-0.5">New Report Generated</div>
                  <div className="text-[11px] font-medium text-slate-500">Notify when new report is generated</div>
                </div>
                <ToggleSwitch active={toggles.newReportGenerated} onClick={() => toggle('newReportGenerated')} />
              </div>
            </div>
          </div>

          {/* 5. Connected Systems */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <LinkIcon size={18} strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">5. Connected Systems</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-2">
               {integrations.slice(0,6).map((s: any, i: number) => {
                 const IconComp = s.system.includes('MRI') ? Target : (s.system.includes('CT') ? Scan : (s.system.includes('X-Ray') ? Bone : (s.system.includes('Lab') ? FlaskConical : (s.system.includes('Pathology') ? Microscope : Activity))));
                 return (

                 <div key={i} className="flex justify-between items-center">
                   <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-700">
                     <IconComp size={16} strokeWidth={1.5} className="text-slate-600" /> {s.system}
                   </div>
                   <div className={`flex items-center gap-1.5 text-[10px] font-bold ${s.status === 'Active' || s.status === 'In Use' ? 'text-emerald-600' : 'text-rose-600'}`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' || s.status === 'In Use' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span> {s.status}
                   </div>
                 </div>
               )})}
            </div>
          </div>

          {/* 6. Privacy & Security */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col bg-slate-50/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">6. Privacy & Security</h3>
            </div>
            <div className="space-y-5 pt-2">
               {[
                 { title: 'Zero Data Leakage', sub: 'All AI models run within hospital premises' },
                 { title: 'On-Premise Secure', sub: 'Your data never leaves your infrastructure' },
                 { title: 'Secure Enclave Active', sub: 'End-to-end encryption and access control' },
               ].map((p, i) => (
                 <div key={i} className="flex items-start gap-4">
                   <div className="mt-0.5 text-emerald-600">
                     <CheckCircle2 size={16} strokeWidth={2.5} />
                   </div>
                   <div>
                     <div className="text-[12px] font-bold text-slate-900 mb-0.5">{p.title}</div>
                     <div className="text-[11px] font-medium text-slate-500">{p.sub}</div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex justify-between items-center mt-2">
           <div className="flex gap-12">
             <div className="flex items-center gap-4 border-r border-slate-100 pr-12">
               <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                 <Info size={16} />
               </div>
               <div>
                 <div className="text-[11px] font-semibold text-slate-500 mb-0.5">About Platform</div>
                 <div className="text-[13px] font-bold text-slate-900">v3.2.1</div>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                 <Headphones size={16} />
               </div>
               <div>
                 <div className="text-[11px] font-semibold text-slate-500 mb-0.5">Support</div>
                 <div className="text-[13px] font-bold text-blue-700">support@elvon.ai</div>
               </div>
             </div>
           </div>
           
           <button className="flex items-center gap-3 text-[13px] font-bold text-rose-600 border border-rose-100 bg-rose-50 px-5 py-2.5 rounded-xl hover:bg-rose-100 transition-colors">
             <LogOut size={16} /> Log Out
           </button>
        </div>

      </div>
    </HospitalLayout>
  )
}
