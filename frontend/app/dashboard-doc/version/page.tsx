"use client"

import React from "react"
import DocLayout from "@/components/doc-layout"
import { 
  Box, Layers, ShieldCheck, History, LineChart, Plus,
  Search, ChevronDown, MoreHorizontal, ArrowUpRight,
  ArrowDownRight, Minus, GitCompare, ArrowUpCircle, 
  RotateCcw, Archive, ChevronRight
} from "lucide-react"

export default function VersionPage() {
  return (
    <DocLayout 
      title="Good Morning, Dr. Ananya" 
      subtitle="Manage and control all model versions"
      searchPlaceholder="Search models, versions, tags..."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* ── TOP HEADER / MANAGEMENT ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 mb-1">Model Version Management</h2>
              <p className="text-[13px] font-medium text-slate-500">Track, compare and control versions of all your machine learning models</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={16} strokeWidth={2.5} /> Register New Version
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Box size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-none mb-1">24</div>
                <div className="text-[11px] font-bold text-slate-600 mb-0.5">Total Models</div>
                <div className="text-[10px] font-medium text-slate-400">12 Active</div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-none mb-1">86</div>
                <div className="text-[11px] font-bold text-slate-600 mb-0.5">Total Versions</div>
                <div className="text-[10px] font-medium text-slate-400">18 Production</div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-none mb-1">7</div>
                <div className="text-[11px] font-bold text-slate-600 mb-0.5">Staging Versions</div>
                <div className="text-[10px] font-medium text-slate-400">Under Review</div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <History size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-none mb-1">12</div>
                <div className="text-[11px] font-bold text-slate-600 mb-0.5">Archived Versions</div>
                <div className="text-[10px] font-medium text-slate-400">Not Deployed</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <LineChart size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-none mb-1">98.7%</div>
                <div className="text-[11px] font-bold text-slate-600 mb-0.5">Overall Success Rate</div>
                <div className="text-[10px] font-bold text-emerald-500">+2.4% <span className="text-slate-400 font-medium">vs last month</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT ───────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT: All Model Versions & Comparison */}
          <div className="col-span-8 flex flex-col gap-6">
            
            {/* Table Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-bold text-slate-900">All Model Versions</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search versions..." className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-[12px] font-medium outline-none focus:border-blue-500 w-[160px]" />
                  </div>
                  <button className="flex items-center gap-4 bg-white border border-slate-200 px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-50">
                    All Models <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  <button className="flex items-center gap-4 bg-white border border-slate-200 px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-50">
                    All Status <ChevronDown size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 mb-3 px-2 border-b border-slate-50 pb-3">
                <div className="col-span-3">Model Name</div>
                <div className="col-span-2">Version</div>
                <div className="col-span-2">Stage</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Performance (AUC)</div>
                <div className="col-span-2 text-right pr-4">Created On</div>
              </div>

              {/* Table Body */}
              <div className="space-y-1 mb-4">
                {[
                  { name: 'PneumoNet', ver: 'v2.4.1', stage: 'Production', stColor: 'text-emerald-600 bg-emerald-50', status: 'Active', statColor: 'text-emerald-600', dot: 'bg-emerald-500', auc: '95.6%', trend: 'up', date: '12 May 2025, 10:30 AM', iconColor: 'text-blue-500' },
                  { name: 'BrainTumor AI', ver: 'v1.8.0', stage: 'Production', stColor: 'text-emerald-600 bg-emerald-50', status: 'Active', statColor: 'text-emerald-600', dot: 'bg-emerald-500', auc: '96.2%', trend: 'up', date: '10 May 2025, 09:15 AM', iconColor: 'text-purple-500' },
                  { name: 'CardioRisk', ver: 'v3.1.0', stage: 'Staging', stColor: 'text-blue-600 bg-blue-50', status: 'Under Review', statColor: 'text-slate-600', dot: 'bg-blue-500', auc: '93.7%', trend: 'flat', date: '08 May 2025, 04:20 PM', iconColor: 'text-rose-500' },
                  { name: 'DiabetesAI', ver: 'v2.2.3', stage: 'Production', stColor: 'text-emerald-600 bg-emerald-50', status: 'Active', statColor: 'text-emerald-600', dot: 'bg-emerald-500', auc: '94.8%', trend: 'up', date: '07 May 2025, 11:05 AM', iconColor: 'text-emerald-500' },
                  { name: 'BoneXpert', ver: 'v1.5.2', stage: 'Archived', stColor: 'text-slate-500 bg-slate-100', status: 'Archived', statColor: 'text-slate-500', dot: 'bg-slate-400', auc: '92.5%', trend: 'down', date: '06 May 2025, 02:40 PM', iconColor: 'text-amber-500' },
                  { name: 'LiverScan', ver: 'v1.2.0', stage: 'Staging', stColor: 'text-blue-600 bg-blue-50', status: 'Under Review', statColor: 'text-slate-600', dot: 'bg-blue-500', auc: '91.3%', trend: 'up', date: '05 May 2025, 01:10 PM', iconColor: 'text-indigo-500' },
                  { name: 'SkinLesionNet', ver: 'v3.0.1', stage: 'Production', stColor: 'text-emerald-600 bg-emerald-50', status: 'Active', statColor: 'text-emerald-600', dot: 'bg-emerald-500', auc: '97.1%', trend: 'up', date: '04 May 2025, 09:30 AM', iconColor: 'text-emerald-400' },
                  { name: 'ThyroidAI', ver: 'v1.1.0', stage: 'Archived', stColor: 'text-slate-500 bg-slate-100', status: 'Archived', statColor: 'text-slate-500', dot: 'bg-slate-400', auc: '89.4%', trend: 'down', date: '03 May 2025, 03:25 PM', iconColor: 'text-purple-600' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-12 items-center px-2 py-3 rounded-2xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ${row.iconColor}`}>
                        <Box size={14} />
                      </div>
                      <span className="text-[12px] font-bold text-slate-900">{row.name}</span>
                    </div>
                    <div className="col-span-2 text-[12px] font-semibold text-slate-600">{row.ver}</div>
                    <div className="col-span-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${row.stColor}`}>{row.stage}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`}></span>
                      <span className={`text-[11px] font-bold ${row.statColor}`}>{row.status}</span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                      {row.auc} 
                      {row.trend === 'up' && <ArrowUpRight size={12} className="text-emerald-500" strokeWidth={3} />}
                      {row.trend === 'down' && <ArrowDownRight size={12} className="text-rose-500" strokeWidth={3} />}
                      {row.trend === 'flat' && <Minus size={12} className="text-amber-500" strokeWidth={3} />}
                    </div>
                    <div className="col-span-2 text-right pr-4 text-[11px] font-medium text-slate-500">{row.date}</div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100">
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                    </div>
                    {/* Actually, it's not absolutely positioned in the mockup, it's just on the right */}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="text-[12px] font-medium text-slate-500">Showing 1 to 8 of 86 versions</div>
                <div className="flex items-center gap-1 text-[13px] font-bold">
                  <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&lt;</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">1</button>
                  <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">2</button>
                  <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">3</button>
                  <span className="text-slate-400 mx-1">...</span>
                  <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">11</button>
                  <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&gt;</button>
                </div>
              </div>

            </div>

            {/* Version Comparison Section */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <h3 className="text-[16px] font-bold text-slate-900 mb-6">Version Comparison</h3>
              
              <div className="flex items-center gap-8">
                
                {/* Selectors */}
                <div className="w-[300px] shrink-0">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">Select Versions to Compare</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border border-slate-200 rounded-xl p-2.5 relative">
                      <div className="text-[12px] font-bold text-slate-900">PneumoNet v2.4.1</div>
                      <div className="text-[10px] text-slate-500">(Production)</div>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">VS</div>
                    <div className="flex-1 border border-slate-200 rounded-xl p-2.5 relative">
                      <div className="text-[12px] font-bold text-slate-900">PneumoNet v2.4.0</div>
                      <div className="text-[10px] text-slate-500">(Staging)</div>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex gap-8 flex-1">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">AUC Score</div>
                    <div className="text-[18px] font-bold text-slate-900 leading-none mb-1">95.6%</div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><ArrowUpRight size={12} strokeWidth={3} /> 1.2%</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Accuracy</div>
                    <div className="text-[18px] font-bold text-slate-900 leading-none mb-1">94.2%</div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><ArrowUpRight size={12} strokeWidth={3} /> 1.5%</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Precision</div>
                    <div className="text-[18px] font-bold text-slate-900 leading-none mb-1">93.1%</div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><ArrowUpRight size={12} strokeWidth={3} /> 0.8%</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Recall</div>
                    <div className="text-[18px] font-bold text-slate-900 leading-none mb-1">92.8%</div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><ArrowUpRight size={12} strokeWidth={3} /> 1.1%</div>
                  </div>
                </div>

                {/* Chart placeholder */}
                <div className="w-[180px] shrink-0">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-semibold text-slate-500">Performance Trend</span>
                     <div className="flex gap-2">
                       <span className="flex items-center gap-1 text-[9px] font-bold text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> v2.4.1</span>
                       <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span> v2.4.0</span>
                     </div>
                   </div>
                   <div className="h-[40px] relative">
                     {/* SVG to mimic two wave lines */}
                     <svg className="w-full h-full stroke-current" viewBox="0 0 100 40" preserveAspectRatio="none">
                       <path d="M0 30 Q 20 10, 40 25 T 80 15 T 100 20" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                       <path d="M0 35 Q 20 20, 40 30 T 80 25 T 100 28" fill="none" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" />
                     </svg>
                   </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT: Controls & Timeline */}
          <div className="col-span-4 flex flex-col gap-6">
            
            {/* Version Control Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <h3 className="text-[16px] font-bold text-slate-900 mb-4">Version Control</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <GitCompare size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-slate-900">Compare Versions</div>
                      <div className="text-[10px] font-medium text-slate-500">Compare performance & metrics</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <ArrowUpCircle size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-slate-900">Promote Version</div>
                      <div className="text-[10px] font-medium text-slate-500">Promote to staging or production</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <RotateCcw size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-slate-900">Rollback Version</div>
                      <div className="text-[10px] font-medium text-slate-500">Revert to a previous version</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Archive size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-slate-900">Archive Version</div>
                      <div className="text-[10px] font-medium text-slate-500">Archive or deprecate version</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Version Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <h3 className="text-[16px] font-bold text-slate-900 mb-6">Version Timeline</h3>
              
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                
                {/* Timeline Item 1 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[13px] font-bold text-slate-900">v2.4.1 (Current)</div>
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">Production</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mb-0.5">Deployed by Dr. Ananya Sharma</div>
                  <div className="text-[10px] font-semibold text-slate-400">12 May 2025, 10:30 AM</div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[13px] font-bold text-slate-900">v2.4.0</div>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Staging</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mb-0.5">Deployed by Dr. Arjun Patel</div>
                  <div className="text-[10px] font-semibold text-slate-400">10 May 2025, 02:15 PM</div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[13px] font-bold text-slate-900">v2.3.0</div>
                    <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">Archived</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mb-0.5">Archived by System</div>
                  <div className="text-[10px] font-semibold text-slate-400">02 May 2025, 11:20 AM</div>
                </div>

                {/* Timeline Item 4 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[13px] font-bold text-slate-900">v2.2.0</div>
                    <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">Archived</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mb-0.5">Archived by System</div>
                  <div className="text-[10px] font-semibold text-slate-400">25 Apr 2025, 09:45 AM</div>
                </div>

              </div>

              <div className="mt-6 text-center">
                <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">View full history</button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </DocLayout>
  )
}
