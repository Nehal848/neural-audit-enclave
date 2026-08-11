"use client"

import React, { useState, useEffect } from "react"
import HospitalLayout from "@/components/hospital-layout"
import { 
  Users, UserPlus, Clock, FileText, Search, ChevronDown, Calendar, Filter, 
  Target, Box, Image as ImageIcon, MoreVertical, Star, Upload, Inbox, Share,
  X, CheckSquare, ShieldCheck, Activity, Brain, Microscope, HeartPulse, Heart
} from "lucide-react"

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  useEffect(() => {
    fetch("/api/patients")
      .then(res => res.json())
      .then(data => {
        const patientList = Array.isArray(data) ? data : (data.patients || []);
        setPatients(patientList)
        if (patientList.length > 0) {
          setSelectedPatient(patientList[0])
        }
      })
      .catch(console.error)
  }, [])

  return (
    <HospitalLayout 
      title="Patients" 
      subtitle="Search, view and manage patient records, reports and AI analysis."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6">
        
        <div className="grid grid-cols-12 gap-6 flex-1">
          
          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="col-span-8 flex flex-col gap-6">
            
            {/* Top Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                  <Users size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Total Patients</div>
                  <div className="text-[20px] font-bold text-slate-900 leading-none mb-1.5">1,248</div>
                  <div className="text-[10px] font-medium text-emerald-600">+ 12 new this week</div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
                  <UserPlus size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">New Patients</div>
                  <div className="text-[20px] font-bold text-slate-900 leading-none mb-1.5">18</div>
                  <div className="text-[10px] font-medium text-slate-400">Added in last 7 days</div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                  <Clock size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Recent Patients</div>
                  <div className="text-[20px] font-bold text-slate-900 leading-none mb-1.5">56</div>
                  <div className="text-[10px] font-medium text-slate-400">Seen in last 30 days</div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                  <FileText size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Reports Generated</div>
                  <div className="text-[20px] font-bold text-slate-900 leading-none mb-1.5">64</div>
                  <div className="text-[10px] font-medium text-slate-400">In last 7 days</div>
                </div>
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex-1 flex flex-col">
              
              {/* Tabs */}
              <div className="flex gap-6 border-b border-slate-100 mb-5 relative">
                <button className="pb-3 text-[13px] font-bold text-slate-900 border-b-2 border-blue-600">All Patients</button>
                <button className="pb-3 text-[13px] font-semibold text-slate-400 hover:text-slate-600">New Patients</button>
                <button className="pb-3 text-[13px] font-semibold text-slate-400 hover:text-slate-600">Recent Patients</button>
              </div>

              {/* Filters */}
              <div className="flex justify-between items-center mb-5">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search patients..." className="w-[280px] pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-[12px] outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">
                    All Status <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 p-2 rounded-xl hover:bg-slate-50">
                    <Calendar size={16} />
                  </button>
                  <button className="flex items-center gap-2 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">
                    More Filters <ChevronDown size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 mb-3 px-2">
                <div className="col-span-3 pl-8">Patient</div>
                <div className="col-span-2">Patient ID / MRN</div>
                <div className="col-span-2">Age / Gender</div>
                <div className="col-span-2">Last Visit</div>
                <div className="col-span-2 text-center">Available Data</div>
                <div className="col-span-1 text-right pr-2">Reports & Analysis</div>
              </div>

              {/* Table List */}
              <div className="flex-1 space-y-2">
                {patients.map((pt: any, i: number) => {
                  const p = {
                    name: pt.name || pt.id,
                    id: pt.id,
                    age: pt.age ? `${pt.age} Yrs` : 'N/A',
                    gender: pt.gender || 'Unknown',
                    phone: pt.contact || '+91 00000 00000',
                    date: 'Recent',
                    time: '--:--',
                    img: `https://i.pravatar.cc/150?u=${pt.id}`,
                    badge: '+1',
                    active: selectedPatient?.id === pt.id
                  };
                  return (

                  <div key={i} onClick={() => setSelectedPatient(pt)} className={`cursor-pointer grid grid-cols-12 items-center px-2 py-3 rounded-xl transition-colors ${p.active ? 'bg-blue-50/50 shadow-[0_0_0_1px_rgba(37,99,235,0.1)]' : 'hover:bg-slate-50'}`}>
                    <div className="col-span-3 flex items-center gap-3">
                      {p.active ? (
                        <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
                           <CheckSquare size={14} className="opacity-0 absolute" />
                           <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-slate-300 bg-white shrink-0"></div>
                      )}
                      <img src={p.img} alt={p.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0" />
                      <div>
                        <div className="text-[12px] font-bold text-slate-900 leading-tight mb-0.5">{p.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">{p.phone}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-[11px] font-semibold text-slate-700">{p.id}</div>
                    <div className="col-span-2">
                      <div className="text-[11px] font-bold text-slate-700 leading-tight mb-0.5">{p.age}</div>
                      <div className="text-[10px] font-medium text-slate-500">{p.gender}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[11px] font-bold text-slate-700 leading-tight mb-0.5">{p.date}</div>
                      <div className="text-[10px] font-medium text-slate-500">{p.time}</div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-1.5 text-slate-500">
                       <Target size={14} className="hover:text-slate-800" />
                       <Box size={14} className="hover:text-slate-800" />
                       <FileText size={14} className="hover:text-slate-800" />
                       <ImageIcon size={14} className="hover:text-slate-800" />
                       <div className="bg-slate-100 text-[9px] font-bold text-slate-600 px-1.5 py-0.5 rounded">{p.badge}</div>
                    </div>
                    <div className="col-span-1 text-right">
                      <button className="text-[10px] font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors bg-white">
                        View Details
                      </button>
                    </div>
                  </div>
                ); })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 mt-2">
                <div className="text-[11px] font-medium text-slate-500">Showing 1 to 7 of 1,248 patients</div>
                <div className="flex items-center gap-1 text-[12px] font-bold">
                  <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&lt;</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">1</button>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">2</button>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">3</button>
                  <span className="text-slate-400 mx-1">...</span>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">178</button>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&gt;</button>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
               
               {/* Quick Actions */}
               <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                 <h3 className="text-[14px] font-bold text-slate-900 mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-4 gap-3">
                   <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                     <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700">
                       <Star size={14} />
                     </div>
                     <div className="text-center">
                       <div className="text-[10px] font-bold text-slate-900">Add New Patient</div>
                       <div className="text-[9px] text-slate-500">Register new patient</div>
                     </div>
                   </button>
                   <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                     <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700">
                       <Upload size={14} />
                     </div>
                     <div className="text-center">
                       <div className="text-[10px] font-bold text-slate-900">Upload Data</div>
                       <div className="text-[9px] text-slate-500">Upload reports / scans</div>
                     </div>
                   </button>
                   <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                     <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700">
                       <Inbox size={14} />
                     </div>
                     <div className="text-center">
                       <div className="text-[10px] font-bold text-slate-900">Request Data</div>
                       <div className="text-[9px] text-slate-500">From lab / imaging</div>
                     </div>
                   </button>
                   <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                     <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700">
                       <Share size={14} />
                     </div>
                     <div className="text-center">
                       <div className="text-[10px] font-bold text-slate-900">Export Patient Data</div>
                       <div className="text-[9px] text-slate-500">Download records</div>
                     </div>
                   </button>
                 </div>
               </div>

               {/* Recent Activity */}
               <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                 <div className="flex justify-between items-center mb-5">
                   <h3 className="text-[14px] font-bold text-slate-900">Recent Activity</h3>
                   <button className="text-[10px] font-bold text-blue-600">View All</button>
                 </div>
                 <div className="space-y-4">
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                       <span className="text-[11px] font-semibold text-slate-700">CT Scan uploaded for Priya Mehta</span>
                     </div>
                     <div className="text-[9px] font-medium text-slate-400 shrink-0">19 Aug 2025 • 10:24 AM</div>
                   </div>
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                       <span className="text-[11px] font-semibold text-slate-700">Lab report received for Ramesh Verma</span>
                     </div>
                     <div className="text-[9px] font-medium text-slate-400 shrink-0">19 Aug 2025 • 09:12 AM</div>
                   </div>
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                       <span className="text-[11px] font-semibold text-slate-700">AI analysis completed for Alisha Khan</span>
                     </div>
                     <div className="text-[9px] font-medium text-slate-400 shrink-0">19 Aug 2025 • 08:36 AM</div>
                   </div>
                 </div>
               </div>

            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="col-span-4 bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col relative overflow-y-auto max-h-[85vh]">
            {selectedPatient && (<>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <img src={`https://i.pravatar.cc/150?u=${selectedPatient.id}`} alt="Patient" className="w-14 h-14 rounded-full border border-slate-200 object-cover" />
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[16px] font-bold text-slate-900 leading-none">{selectedPatient.name}</h2>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-bold leading-none">Active</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mb-1">
                    {selectedPatient.id} • {selectedPatient.age} Yrs • {selectedPatient.gender}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">
                    {selectedPatient.contact || "+91 00000 00000"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-100 mb-6">
              <button className="pb-3 text-[11px] font-bold text-blue-600 border-b-2 border-blue-600">Overview</button>
              <button className="pb-3 text-[11px] font-bold text-slate-500 hover:text-slate-700">Data & Reports</button>
              <button className="pb-3 text-[11px] font-bold text-slate-500 hover:text-slate-700">AI Analysis</button>
              <button className="pb-3 text-[11px] font-bold text-slate-500 hover:text-slate-700">Timeline</button>
            </div>

            {/* Patient Overview */}
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Patient Overview</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-8">
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Date of Birth</div>
                <div className="text-[12px] font-bold text-slate-800">{selectedPatient.dob || "Unknown"}</div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Blood Group</div>
                <div className="text-[12px] font-bold text-slate-800">B+</div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Last Visit</div>
                <div className="text-[12px] font-bold text-slate-800 flex flex-wrap gap-1">Recent <span className="text-slate-500"></span></div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Referring Doctor</div>
                <div className="text-[12px] font-bold text-blue-700">Dr. Ananya Sharma</div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Primary Diagnosis</div>
                <div className="text-[12px] font-bold text-slate-800">{selectedPatient.symptoms || "None"}</div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Allergies</div>
                <div className="text-[12px] font-bold text-slate-800">None</div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Status</div>
                <div className="text-[12px] font-bold text-slate-800">Active</div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-500 mb-1">Notes</div>
                <div className="text-[12px] font-bold text-slate-800">Follow-up in 2 weeks</div>
              </div>
            </div>

            {/* Available Data */}
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-[13px] font-bold text-slate-900">Available Data (6)</h3>
               <button className="text-[10px] font-bold text-blue-600 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'CT Scan', date: '19 Aug 2025', icon: Target },
                { label: 'X-Ray', date: '18 Aug 2025', icon: Box },
                { label: 'Lab Report', date: '19 Aug 2025', icon: FileText },
                { label: 'Pathology', date: '17 Aug 2025', icon: Microscope },
                { label: 'ECG', date: '18 Aug 2025', icon: Activity },
                { label: 'Vitals', date: '19 Aug 2025', icon: Heart },
              ].map((d, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-3 flex flex-col hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 mb-2">
                    <d.icon size={14} />
                  </div>
                  <div className="text-[10px] font-bold text-slate-900">{d.label}</div>
                  <div className="text-[9px] font-medium text-slate-500">{d.date}</div>
                </div>
              ))}
            </div>

            {/* Reports & Analysis */}
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-[13px] font-bold text-slate-900">Reports & Analysis (3)</h3>
               <button className="text-[10px] font-bold text-blue-600 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50">View All</button>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 text-blue-500"><FileText size={16} /></div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 mb-0.5">Lung Cancer Detection Report</div>
                    <div className="text-[9px] font-medium text-slate-500">19 Aug 2025 • 10:24 AM</div>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded text-[9px] font-bold">High Confidence</div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 text-blue-500"><FileText size={16} /></div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 mb-0.5">Nodule Risk Assessment</div>
                    <div className="text-[9px] font-medium text-slate-500">19 Aug 2025 • 09:24 AM</div>
                  </div>
                </div>
                <div className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded text-[9px] font-bold">Medium Risk</div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 text-blue-500"><FileText size={16} /></div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 mb-0.5">CT Scan Summary</div>
                    <div className="text-[9px] font-medium text-slate-500">18 Aug 2025 • 09:15 AM</div>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded text-[9px] font-bold">Completed</div>
              </div>
            </div>

            {/* Bottom Button */}
            <button className="w-full mt-auto py-3.5 rounded-xl border border-slate-200 text-[12px] font-bold text-blue-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
              View All Reports & Analysis <span>→</span>
            </button>
            </>)}
          </div>

        </div>
      </div>
    </HospitalLayout>
  )
}
