"use client"

import React, { useState, useEffect } from "react"
import DocLayout from "@/components/doc-layout"
import { 
  Wallet, Plus, Search, ChevronDown, Filter, 
  Wind, Heart, Brain, Bone, Droplet, Activity,
  ShoppingCart, ArrowUpRight, ShieldCheck, TrendingUp, 
  FileText, Puzzle, Headphones, Loader2
} from "lucide-react"

export default function MarketplacePage() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/marketplace")
      .then(res => res.json())
      .then(data => {
        setModels(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch marketplace", err)
        setLoading(false)
      })
  }, [])

  const handlePurchase = async (model: any) => {
    setPurchasing(model.id)
    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_name: model.name })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`Successfully purchased ${model.name}. It is now available in My Models.`)
      } else {
        setMessage(data.detail || "Purchase failed")
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setPurchasing(null)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const getIconAndStyle = (name: string) => {
    if (name.includes("Pneumonia") || name.includes("TB") || name.includes("Lung")) return { icon: Wind, color: 'text-purple-500', bg: 'bg-purple-50' };
    if (name.includes("Cardio") || name.includes("Heart")) return { icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (name.includes("Brain") || name.includes("Tumor")) return { icon: Brain, color: 'text-amber-500', bg: 'bg-amber-50' };
    if (name.includes("Bone")) return { icon: Bone, color: 'text-blue-500', bg: 'bg-blue-50' };
    if (name.includes("Diabetes")) return { icon: Droplet, color: 'text-rose-500', bg: 'bg-rose-50' };
    return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' };
  }

  return (
    <DocLayout 
      title="Good Morning, Dr. Ananya" 
      subtitle="Discover and purchase licensed AI models for your use"
      searchPlaceholder="Search models, keywords, categories..."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar relative">
        
        {message && (
          <div className="absolute top-0 left-8 right-8 z-50 bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-2xl shadow-md font-bold flex items-center justify-between">
            {message}
            <button onClick={() => setMessage(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* ── TOP HEADER / WALLET ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900 mb-1">My Model Market Place</h2>
            <p className="text-[13px] font-medium text-slate-500">Browse and purchase licensed models to accelerate your AI/ML projects</p>
          </div>
          <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 pr-4">
             <div className="flex items-center gap-3 pl-2">
               <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                 <Wallet size={20} strokeWidth={2} />
               </div>
               <div>
                 <div className="text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide">Wallet Balance</div>
                 <div className="text-[16px] font-bold text-slate-900 leading-none">₹ 24,750.00</div>
               </div>
             </div>
             <button className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-blue-100 transition-colors">
               <Plus size={14} strokeWidth={2.5} /> Add Funds
             </button>
          </div>
        </div>

        {/* ── FILTERS BAR ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-[280px]">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search models..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[12px] font-medium outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-1 items-center gap-3">
             {[
               "All Categories", "All Use Cases", "All Formats", "All Prices"
             ].map((filter, i) => (
               <button key={i} className="flex-1 flex justify-between items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                 {filter} <ChevronDown size={14} className="text-slate-400" />
               </button>
             ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
             <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-slate-700">
               <span className="text-slate-400 font-medium">Sort by</span> Most Relevant <ChevronDown size={14} className="text-slate-400" />
             </div>
             <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[12px] font-bold text-blue-600 hover:bg-slate-50 transition-colors">
               <Filter size={14} /> Filter
             </button>
          </div>
        </div>

        {/* ── MODELS LIST ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex-1 flex flex-col min-h-[500px]">
          
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-[16px] font-bold text-slate-900">New Models (Licensed)</h3>
            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold">{models.length} Available</span>
          </div>

          <div className="flex-1 space-y-4 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            )}
            {models.map((m, i) => {
              const { icon: Icon, color, bg } = getIconAndStyle(m.name);
              return (
                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all bg-white group">
                  
                  {/* Left: Info */}
                  <div className="flex items-center gap-4 w-[340px] shrink-0">
                    <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[14px] font-bold text-slate-900">{m.name}</h4>
                        {m.vendor_id && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Scope-Gated</span>}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-snug pr-4 line-clamp-2" title={m.description}>{m.description}</p>
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div className="w-[100px] shrink-0">
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">Accuracy</div>
                    <div className="text-[16px] font-bold text-slate-900 leading-none mb-1.5">{m.accuracy}%</div>
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                      <ArrowUpRight size={12} strokeWidth={3} /> {Math.max(1.1, Math.random() * 3).toFixed(1)}%
                    </div>
                  </div>

                  {/* Version */}
                  <div className="w-[100px] shrink-0">
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">Version</div>
                    <div className="text-[13px] font-bold text-slate-900 leading-none mb-1.5">{m.version}</div>
                    <div className="text-[9px] font-medium text-slate-400 leading-snug">Type<br/>{m.type}</div>
                  </div>

                  {/* Formats */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[10px] font-semibold text-slate-500 mb-2">Formats & Inputs</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.formats.slice(0, 3).map((fmt: string, j: number) => (
                        <span key={`f-${j}`} className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold">
                          {fmt}
                        </span>
                      ))}
                      {m.input_types.slice(0, 2).map((inp: string, j: number) => (
                        <span key={`i-${j}`} className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded text-[10px] font-bold">
                          {inp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center gap-6 shrink-0 pl-4 border-l border-slate-100">
                    <div className="w-[80px]">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1">Price</div>
                      <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">{m.price}</div>
                      <div className="text-[9px] font-medium text-slate-400">One-time</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 text-[12px] font-bold hover:bg-blue-50 transition-colors bg-white">
                        View Details
                      </button>
                      <button 
                        onClick={() => handlePurchase(m)}
                        disabled={purchasing === m.id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {purchasing === m.id ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />} 
                        {purchasing === m.id ? "Processing..." : "Purchase"}
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-50">
            <div className="text-[12px] font-medium text-slate-500">Showing 1 to {models.length} of {models.length} models</div>
            <div className="flex items-center gap-1 text-[13px] font-bold">
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">1</button>
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">&gt;</button>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-700">
              <span className="text-slate-500">Models per page</span>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                10 <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM FEATURES ROW ─────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-6 pt-2">
           {[
             { title: 'Licensed & Secure', desc: 'All models are licensed and enterprise-ready', icon: ShieldCheck },
             { title: 'High Performance', desc: 'Pre-trained and validated for accurate results', icon: TrendingUp },
             { title: 'Multiple Formats', desc: 'Choose from various deployment formats', icon: FileText },
             { title: 'Easy Integration', desc: 'Seamless integration with your existing systems', icon: Puzzle },
             { title: 'Support Included', desc: 'Get access to docs, updates and expert support', icon: Headphones },
           ].map((f, i) => (
             <div key={i} className="flex gap-3 items-start">
               <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                 <f.icon size={16} />
               </div>
               <div>
                 <h5 className="text-[11px] font-bold text-slate-900 mb-1">{f.title}</h5>
                 <p className="text-[10px] font-medium text-slate-500 leading-snug">{f.desc}</p>
               </div>
             </div>
           ))}
        </div>

      </div>
    </DocLayout>
  )
}
