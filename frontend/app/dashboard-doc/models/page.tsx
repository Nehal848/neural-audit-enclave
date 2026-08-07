"use client"

import React, { useState, useEffect } from "react"
import DocLayout from "@/components/doc-layout"
import { 
  Database, Box, Building2, User, ChevronDown, ListFilter,
  Wind, Brain, Activity, Target, FlaskConical, Microscope,
  Star, MoreVertical, Plus, ArrowUpRight, ArrowDownRight,
  Loader2
} from "lucide-react"
import Link from "next/link"

export default function MyModelsPage() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/models/my-models")
      .then(res => res.json())
      .then(data => {
        setModels(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch models", err)
        setLoading(false)
      })
  }, [])

  // Helper to map backend data to UI styles
  const mapModelToUI = (m: any) => {
    // Default styles for Custom AutoML
    let icon = Activity;
    let iconColor = 'text-amber-500';
    let bg = 'bg-amber-50';
    let typeColor = 'emerald';
    let creatorSubColor = 'text-amber-500';
    
    if (m.ownership === "Ours") {
      creatorSubColor = 'text-blue-600';
      if (m.name.includes("Pneumonia")) { icon = Wind; iconColor = 'text-blue-600'; bg = 'bg-blue-50'; typeColor = 'blue'; }
      if (m.name.includes("Tumor") || m.name.includes("Cancer")) { icon = Brain; iconColor = 'text-purple-600'; bg = 'bg-purple-50'; typeColor = 'purple'; }
      if (m.name.includes("Diabetes")) { icon = FlaskConical; iconColor = 'text-amber-500'; bg = 'bg-amber-50'; typeColor = 'amber'; }
    } else {
      typeColor = 'rose';
    }

    return {
      name: m.name,
      desc: m.type,
      type: m.type.includes("Text") ? "Text" : (m.type.includes("AutoML") ? "Custom" : "Image"),
      typeColor: typeColor,
      creator: m.ownership === "Ours" ? "ELVON" : "CityCare Hospital",
      creatorSub: m.ownership === "Ours" ? "Our Model" : "My Model",
      creatorSubColor: creatorSubColor,
      ver: m.version,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      acc: m.accuracy + "%",
      trend: m.ownership === "Ours" ? 1.2 : 3.1,
      stars: 4.5 + Math.random() * 0.5,
      revs: m.feedback_count || Math.floor(Math.random() * 100),
      icon: icon,
      iconColor: iconColor,
      bg: bg
    }
  }

  const uiModels = models.map(mapModelToUI)

  const totalModels = uiModels.length
  const ourModels = uiModels.filter(m => m.creatorSub === "Our Model").length
  const myModels = uiModels.filter(m => m.creatorSub === "My Model").length

  return (
    <DocLayout 
      title="My Models" 
      subtitle="View and manage all AI models developed by you, hospitals and our team."
      searchPlaceholder="Search models, type, hospital..."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* ── TOP METRICS ROW ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Database size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">All Models</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{loading ? "..." : totalModels}</div>
              <div className="text-[11px] font-medium text-slate-500">Total Models</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Box size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Our Models</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{loading ? "..." : ourModels}</div>
              <div className="text-[11px] font-medium text-slate-500">Developed by ELVON</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Building2 size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">Hospital Models</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{loading ? "..." : 0}</div>
              <div className="text-[11px] font-medium text-slate-500">Developed by Hospitals</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <User size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-0.5">My Models</div>
              <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{loading ? "..." : myModels}</div>
              <div className="text-[11px] font-medium text-slate-500">Developed by You</div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex-1 flex flex-col min-h-[500px]">
          
          {/* Tabs and Filters */}
          <div className="flex justify-between items-center border-b border-slate-100 mb-5">
            <div className="flex gap-8">
              <button className="pb-4 text-[13px] font-bold text-blue-600 border-b-2 border-blue-600">All Models</button>
              <button className="pb-4 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">Our Models</button>
              <button className="pb-4 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">Hospital Models</button>
              <button className="pb-4 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">My Models</button>
            </div>
            <div className="flex items-center gap-4 pb-2">
              <button className="flex items-center gap-6 text-[12px] font-bold text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                All Types <ChevronDown size={14} className="text-slate-400" />
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
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Created By</div>
            <div className="col-span-2">Version</div>
            <div className="col-span-1">Accuracy</div>
            <div className="col-span-1">Feedback</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right pr-2">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 space-y-1 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            )}
            
            {uiModels.map((row, i) => (
              <div key={i} className="grid grid-cols-12 items-center px-2 py-4 rounded-2xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <div className="col-span-3 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full ${row.bg} ${row.iconColor} flex items-center justify-center shrink-0`}>
                    <row.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 leading-tight mb-0.5">{row.name}</div>
                    <div className="text-[11px] font-medium text-slate-500">{row.desc}</div>
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded bg-${row.typeColor}-50 text-${row.typeColor}-600 text-[10px] font-bold`}>
                    {row.type}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="text-[12px] font-bold text-slate-900 leading-tight mb-0.5">{row.creator}</div>
                  <div className={`text-[11px] font-semibold ${row.creatorSubColor}`}>{row.creatorSub}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[12px] font-bold text-slate-900 leading-tight mb-0.5">{row.ver}</div>
                  <div className="text-[11px] font-medium text-slate-500">{row.date}</div>
                </div>
                <div className="col-span-1">
                  <div className="text-[13px] font-bold text-slate-900 leading-tight mb-1">{row.acc}</div>
                  <div className={`text-[11px] font-bold flex items-center gap-0.5 ${row.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.trend > 0 ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />} {Math.abs(row.trend)}%
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex text-amber-400 mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= Math.floor(row.stars) ? 'currentColor' : 'transparent'} strokeWidth={2} className={s > Math.floor(row.stars) && row.stars % 1 !== 0 ? 'opacity-50 fill-current' : ''} />)}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    {row.stars.toFixed(1)} <span className="text-slate-400 font-medium">({row.revs})</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    Active <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
                <div className="col-span-1 flex justify-end pr-2">
                  <button className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination and Create Button */}
          <div className="flex items-center justify-between pt-6 mt-2 border-t border-slate-50">
            <div className="text-[12px] font-medium text-slate-500">Showing 1 to {uiModels.length} of {totalModels} models</div>
            <div className="flex items-center gap-1 text-[13px] font-bold">
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">1</button>
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&gt;</button>
            </div>
            <Link href="/dashboard-doc/create" className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-blue-100 hover:border-blue-200 transition-colors">
              <Plus size={16} strokeWidth={2.5} /> Create New Model
            </Link>
          </div>

        </div>
      </div>
    </DocLayout>
  )
}
