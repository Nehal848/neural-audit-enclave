"use client"

import React from "react"
import HospitalLayout from "@/components/hospital-layout"
import { 
  Search, ChevronDown, Calendar, Filter, MoreVertical, Eye, Target, 
  Activity, Microscope, FlaskConical, Bone, Database, Scan, FileText,
  CloudUpload, UploadCloud, CheckCircle2, Clock, BarChart2, RefreshCw
} from "lucide-react"

export default function LaboratoryPage() {
  return (
    <HospitalLayout 
      title="Laboratory & Imaging" 
      subtitle="Manage and monitor all laboratory tests and imaging studies."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6">
        
        {/* ── TOP METRICS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: 'MRI', val: '24', icon: Target },
            { label: 'CT-Scan', val: '31', icon: Scan },
            { label: 'X-ray', val: '42', icon: Bone },
            { label: 'Blood Report', val: '67', icon: FlaskConical },
            { label: 'Pathology Report', val: '38', icon: Microscope },
            { label: 'ECG', val: '19', icon: Activity },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 mb-3 shadow-sm">
                 <m.icon size={20} strokeWidth={1.5} />
               </div>
               <div className="text-[12px] font-semibold text-slate-600 mb-0.5">{m.label}</div>
               <div className="text-[24px] font-bold text-slate-900 leading-none mb-1.5">{m.val}</div>
               <div className="text-[10px] font-bold text-blue-700">New uploads</div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6 flex-1">
          
          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="col-span-8 flex flex-col gap-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex-1 flex flex-col">
              
              {/* Tabs */}
              <div className="flex gap-6 border-b border-slate-100 mb-5">
                <button className="pb-3 text-[13px] font-bold text-blue-600 border-b-2 border-blue-600">All Uploads</button>
                <button className="pb-3 text-[13px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">New Uploads</button>
                <button className="pb-3 text-[13px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">Recent Uploads</button>
              </div>

              {/* Filters */}
              <div className="flex justify-between items-center mb-5">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search by patient name or ID..." className="w-[280px] pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-[12px] outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-8 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    All Test Types <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  <button className="flex items-center gap-8 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    All Status <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  <button className="flex items-center gap-3 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    18 May 2025 - 18 Jul 2025 <Calendar size={14} className="text-slate-400" />
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <Filter size={16} />
                  </button>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 mb-3 px-2 border-b border-slate-50 pb-3">
                <div className="col-span-3 pl-8">Patient</div>
                <div className="col-span-2">Test Type</div>
                <div className="col-span-3">Report/Study</div>
                <div className="col-span-2">Upload Date & Time</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right pr-4">Actions</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 space-y-1">
                {[
                  { name: 'Priya Mehta', id: 'MRN-78291', type: 'MRI', icon: Target, report: 'Brain MRI', detail: 'DICOM • 32 images', date: '18 Jul 2025', time: '10:24 AM', img: 'https://i.pravatar.cc/150?u=priya' },
                  { name: 'Ramesh Verma', id: 'MRN-78290', type: 'CT-Scan', icon: Scan, report: 'Chest CT Scan', detail: 'DICOM • 156 images', date: '18 Jul 2025', time: '09:58 AM', img: 'https://i.pravatar.cc/150?u=ramesh' },
                  { name: 'Alisha Khan', id: 'MRN-78289', type: 'X-ray', icon: Bone, report: 'Chest X-Ray', detail: 'DICOM • 2 images', date: '18 Jul 2025', time: '09:35 AM', img: 'https://i.pravatar.cc/150?u=alisha' },
                  { name: 'Arjun Patel', id: 'MRN-78288', type: 'Blood Report', icon: FlaskConical, report: 'Complete Blood Count', detail: 'PDF • 2 pages', date: '18 Jul 2025', time: '08:47 AM', img: 'https://i.pravatar.cc/150?u=arjun' },
                  { name: 'Neha Singh', id: 'MRN-78287', type: 'Pathology Report', icon: Microscope, report: 'Liver Function Test', detail: 'PDF • 3 pages', date: '18 Jul 2025', time: '08:22 AM', img: 'https://i.pravatar.cc/150?u=neha' },
                  { name: 'Sanjay Rao', id: 'MRN-78286', type: 'ECG', icon: Activity, report: '12 Lead ECG', detail: 'PDF • 1 page', date: '18 Jul 2025', time: '07:59 AM', img: 'https://i.pravatar.cc/150?u=sanjay' },
                  { name: 'Meera Iyer', id: 'MRN-78285', type: 'Blood Report', icon: FlaskConical, report: 'Lipid Profile', detail: 'PDF • 2 pages', date: '18 Jul 2025', time: '07:32 AM', img: 'https://i.pravatar.cc/150?u=meera' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-12 items-center px-2 py-3 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <div className="col-span-3 flex items-center gap-3">
                      <img src={row.img} alt={row.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0" />
                      <div>
                        <div className="text-[12px] font-bold text-slate-900 leading-tight mb-0.5">{row.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">{row.id}</div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                       <div className="w-7 h-7 rounded bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                         <row.icon size={14} />
                       </div>
                       <span className="text-[11px] font-bold text-slate-700">{row.type}</span>
                    </div>
                    <div className="col-span-3">
                      <div className="text-[12px] font-bold text-slate-900 leading-tight mb-0.5">{row.report}</div>
                      <div className="text-[10px] font-medium text-slate-500">{row.detail}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[11px] font-bold text-slate-900 leading-tight mb-0.5">{row.date}</div>
                      <div className="text-[10px] font-medium text-slate-500">{row.time}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                        Connected <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]"></span>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1.5 pr-4">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 mt-2">
                <div className="text-[11px] font-medium text-slate-500">Showing 1 to 7 of 251 uploads</div>
                <div className="flex items-center gap-1 text-[12px] font-bold">
                  <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&lt;</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">1</button>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">2</button>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">3</button>
                  <span className="text-slate-400 mx-1">...</span>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">36</button>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&gt;</button>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="col-span-4 flex flex-col gap-6">
            
            {/* Connection Status */}
            <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-6">
              <h3 className="text-[13px] font-bold text-slate-900 mb-2">Connection Status</h3>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-6 pb-6 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]"></span> All systems operational
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { name: 'MRI System', icon: Target },
                  { name: 'CT-Scan System', icon: Scan },
                  { name: 'X-Ray System', icon: Bone },
                  { name: 'LIS (Laboratory Info. System)', icon: Database },
                  { name: 'Pathology System', icon: Microscope },
                  { name: 'ECG System', icon: Activity },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-3 font-semibold text-slate-700">
                       <s.icon size={16} strokeWidth={1.5} className="text-slate-400" /> {s.name}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      Connected <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]"></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 pt-4 border-t border-slate-50">
                Last checked: 18 Jul 2025, 10:30 AM
                <button className="hover:text-slate-600 transition-colors"><RefreshCw size={12} /></button>
              </div>
            </div>

            {/* Upload Summary */}
            <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[13px] font-bold text-slate-900">Upload Summary</h3>
                <button className="flex items-center gap-2 text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">
                  This Week <ChevronDown size={12} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Total Uploads</div>
                    <div className="text-[20px] font-bold text-slate-900 leading-none">221</div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-600">
                    <CloudUpload size={18} />
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">New Uploads</div>
                    <div className="text-[20px] font-bold text-slate-900 leading-none">221</div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-600">
                    <UploadCloud size={18} />
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Completed</div>
                    <div className="text-[20px] font-bold text-slate-900 leading-none">221</div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-emerald-100 bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Pending</div>
                    <div className="text-[20px] font-bold text-slate-900 leading-none">0</div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-amber-100 bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock size={18} />
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold text-blue-700 flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                View Upload Analytics <BarChart2 size={14} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </HospitalLayout>
  )
}
