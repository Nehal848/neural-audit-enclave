"use client"

import React from "react"
import DocLayout from "@/components/doc-layout"
import { 
  Link as LinkIcon, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ListFilter, MoreVertical, Wind, Brain,
  Bone, Target, Heart, Activity, Scan, CircleDot
} from "lucide-react"

export default function IntegrationsPage() {
  return (
    <DocLayout 
      title="Integrations" 
      subtitle="View and manage all model-system integrations across your healthcare ecosystem."
      searchPlaceholder="Search models, systems, health types..."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* ── TOP METRICS ROW ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <LinkIcon size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Total Integrations</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">24</div>
              <div className="text-[11px] font-medium text-slate-500">Across all systems</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Healthy</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">20</div>
              <div className="text-[11px] font-medium text-slate-500">83.3% of total</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
              <AlertTriangle size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Warning</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">3</div>
              <div className="text-[11px] font-medium text-slate-500">12.5% of total</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
              <XCircle size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Error</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">1</div>
              <div className="text-[11px] font-medium text-slate-500">4.2% of total</div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT (TABLE) ────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex-1 flex flex-col">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[16px] font-bold text-slate-900">All Integrations</h3>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-6 text-[12px] font-bold text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                All Health Types <ChevronDown size={14} className="text-slate-400" />
              </button>
              <button className="flex items-center gap-6 text-[12px] font-bold text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                All Status <ChevronDown size={14} className="text-slate-400" />
              </button>
              <button className="flex items-center gap-6 text-[12px] font-bold text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                Newest First <ChevronDown size={14} className="text-slate-400" />
              </button>
              <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                <ListFilter size={16} />
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 text-[12px] font-bold text-slate-900 mb-3 px-2 border-b border-slate-50 pb-3">
            <div className="col-span-3">Model Name</div>
            <div className="col-span-2">System</div>
            <div className="col-span-2">Health Type</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Last Sync</div>
            <div className="col-span-1">Health</div>
            <div className="col-span-1 text-right pr-2">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 space-y-1">
            {[
              { 
                name: 'PneumoNet v2.1', desc: 'Pneumonia Detection', icon: Wind, iconColor: 'text-blue-600', bg: 'bg-blue-50',
                sys: 'GE Healthcare PACS', sysDesc: 'PACS System',
                type: 'CT Scan', typeIcon: Target, typeColor: 'text-purple-600', typeBg: 'bg-purple-50',
                status: 'Connected', statColor: 'text-emerald-600', dot: 'bg-emerald-500',
                sync: '12 May 2025, 10:30 AM', health: 'Healthy'
              },
              { 
                name: 'Brain Tumor Classifier', desc: 'MRI Classification', icon: Brain, iconColor: 'text-purple-600', bg: 'bg-purple-50',
                sys: 'Siemens Syngo', sysDesc: 'PACS System',
                type: 'MRI Scan', typeIcon: Target, typeColor: 'text-blue-600', typeBg: 'bg-blue-50',
                status: 'Connected', statColor: 'text-emerald-600', dot: 'bg-emerald-500',
                sync: '12 May 2025, 09:15 AM', health: 'Healthy'
              },
              { 
                name: 'BoneXpert AI', desc: 'Fracture Detection', icon: Bone, iconColor: 'text-orange-500', bg: 'bg-orange-50',
                sys: 'Carestream Vue', sysDesc: 'PACS System',
                type: 'X-Ray', typeIcon: Bone, typeColor: 'text-orange-500', typeBg: 'bg-orange-50',
                status: 'Connected', statColor: 'text-emerald-600', dot: 'bg-emerald-500',
                sync: '12 May 2025, 08:40 AM', health: 'Warning'
              },
              { 
                name: 'Lung Nodule Detector', desc: 'Nodule Detection', icon: CircleDot, iconColor: 'text-emerald-600', bg: 'bg-emerald-50',
                sys: 'Philips IntelliSpace', sysDesc: 'PACS System',
                type: 'CT Scan', typeIcon: Target, typeColor: 'text-purple-600', typeBg: 'bg-purple-50',
                status: 'Connected', statColor: 'text-emerald-600', dot: 'bg-emerald-500',
                sync: '12 May 2025, 08:05 AM', health: 'Healthy'
              },
              { 
                name: 'CardioRisk AI', desc: 'Cardiac Risk Prediction', icon: Heart, iconColor: 'text-rose-500', bg: 'bg-rose-50',
                sys: 'GE Cardio PACS', sysDesc: 'PACS System',
                type: 'CT Scan', typeIcon: Target, typeColor: 'text-purple-600', typeBg: 'bg-purple-50',
                status: 'Connected', statColor: 'text-emerald-600', dot: 'bg-emerald-500',
                sync: '12 May 2025, 07:50 AM', health: 'Healthy'
              },
              { 
                name: 'LiverScan AI', desc: 'Liver Analysis', icon: Activity, iconColor: 'text-indigo-600', bg: 'bg-indigo-50',
                sys: 'Merge Healthcare', sysDesc: 'PACS System',
                type: 'MRI Scan', typeIcon: Target, typeColor: 'text-blue-600', typeBg: 'bg-blue-50',
                status: 'Connected', statColor: 'text-emerald-600', dot: 'bg-emerald-500',
                sync: '12 May 2025, 07:20 AM', health: 'Warning'
              },
              { 
                name: 'SkinLesionNet', desc: 'Skin Lesion Detection', icon: Scan, iconColor: 'text-orange-500', bg: 'bg-orange-50',
                sys: 'Sectra PACS', sysDesc: 'PACS System',
                type: 'X-Ray', typeIcon: Bone, typeColor: 'text-orange-500', typeBg: 'bg-orange-50',
                status: 'Error', statColor: 'text-rose-600', dot: 'bg-rose-500',
                sync: '12 May 2025, 06:45 AM', health: 'Unhealthy'
              },
              { 
                name: 'ThyroidAI', desc: 'Thyroid Nodule Detection', icon: Activity, iconColor: 'text-purple-600', bg: 'bg-purple-50',
                sys: 'Agfa HealthCare', sysDesc: 'PACS System',
                type: 'Ultrasound', typeIcon: Target, typeColor: 'text-emerald-600', typeBg: 'bg-emerald-50',
                status: 'Connected', statColor: 'text-emerald-600', dot: 'bg-emerald-500',
                sync: '12 May 2025, 06:10 AM', health: 'Healthy'
              },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 items-center px-2 py-4 rounded-2xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                <div className="col-span-3 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${row.bg} ${row.iconColor} flex items-center justify-center shrink-0`}>
                    <row.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 leading-tight mb-0.5">{row.name}</div>
                    <div className="text-[11px] font-medium text-slate-500">{row.desc}</div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="text-[13px] font-bold text-slate-900 leading-tight mb-0.5">{row.sys}</div>
                  <div className="text-[11px] font-medium text-slate-500">{row.sysDesc}</div>
                </div>
                
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${row.typeBg} ${row.typeColor} text-[10px] font-bold`}>
                    <row.typeIcon size={12} strokeWidth={2} /> {row.type}
                  </span>
                </div>
                
                <div className="col-span-1 flex items-center gap-1.5">
                  <span className={`text-[12px] font-bold ${row.statColor}`}>{row.status}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`}></span>
                </div>
                
                <div className="col-span-2 text-[12px] font-medium text-slate-600">
                  {row.sync}
                </div>
                
                <div className="col-span-1">
                  {row.health === 'Healthy' && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-md text-[11px] font-bold">
                      <CheckCircle2 size={12} strokeWidth={2.5} /> Healthy
                    </div>
                  )}
                  {row.health === 'Warning' && (
                    <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 border border-orange-100 px-2.5 py-1 rounded-md text-[11px] font-bold">
                      <AlertTriangle size={12} strokeWidth={2.5} /> Warning
                    </div>
                  )}
                  {row.health === 'Unhealthy' && (
                    <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-md text-[11px] font-bold">
                      <XCircle size={12} strokeWidth={2.5} /> Unhealthy
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 flex justify-end pr-2">
                  <button className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 mt-2 border-t border-slate-50">
            <div className="text-[12px] font-medium text-slate-500">Showing 1 to 8 of 24 integrations</div>
            <div className="flex items-center gap-1 text-[13px] font-bold">
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">1</button>
              <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">3</button>
              <span className="text-slate-400 mx-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">6</button>
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&gt;</button>
            </div>
          </div>

        </div>
      </div>
    </DocLayout>
  )
}
