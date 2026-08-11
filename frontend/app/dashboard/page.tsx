"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Search, Bell, Settings, LayoutDashboard, BarChart2, Box, Users, FlaskConical, 
  LogOut, Shield, ChevronDown, SlidersHorizontal, ArrowUpRight, ArrowDownRight,
  Database, Share2, Trophy, Cloud, FileText, CheckCircle2, Activity, HardDrive, Server
} from "lucide-react"
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line
} from "recharts"

const radarData = [
  { subject: 'Accuracy', A: 92.6, fullMark: 100 },
  { subject: 'Speed', A: 85, fullMark: 100 },
  { subject: 'Reliability', A: 89.1, fullMark: 100 },
]

const sparklineData1 = [{ v: 40 }, { v: 45 }, { v: 42 }, { v: 50 }, { v: 48 }, { v: 55 }, { v: 52 }, { v: 60 }]
const sparklineData2 = [{ v: 30 }, { v: 25 }, { v: 35 }, { v: 30 }, { v: 40 }, { v: 45 }, { v: 50 }, { v: 65 }]
const sparklineData3 = [{ v: 60 }, { v: 55 }, { v: 58 }, { v: 52 }, { v: 48 }, { v: 50 }, { v: 55 }, { v: 60 }]

export default function DashboardPage() {
  const [uploadTab, setUploadTab] = useState<"Laboratory" | "Imaging">("Laboratory")
  const [dashData, setDashData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/doctor/dashboard")
      .then(res => res.json())
      .then(data => setDashData(data))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-transparent flex font-sans text-slate-900 overflow-hidden">
      
      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="w-[260px] flex-shrink-0 bg-[#FCFDFE] border-r border-slate-200/60 hidden md:flex flex-col justify-between h-screen relative z-20">
        <div>
          {/* Logo */}
          <div className="pt-8 pb-8 px-6 flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3L35 11.6603V28.9808L20 37.641L5 28.9808V11.6603L20 3Z" fill="#334155" />
              <path d="M20 3L35 11.6603L20 20.3205L5 11.6603L20 3Z" fill="#94A3B8" />
              <path d="M5 11.6603L20 20.3205V37.641L5 28.9808V11.6603Z" fill="#64748B" />
              <path d="M35 11.6603L20 20.3205V37.641L35 28.9808V11.6603Z" fill="#1E293B" />
              <circle cx="20" cy="20.3205" r="5" fill="#FCFDFE" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[19px] font-semibold tracking-tight text-[#0f172a] leading-none mb-1">ELVON</span>
              <span className="text-[9px] tracking-wide text-slate-500 font-semibold uppercase leading-none">Clinical Intelligence</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm font-medium text-[15px]">
              <LayoutDashboard size={18} /> Dashboard
            </a>
            <Link href="/analysis" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-[15px]">
              <BarChart2 size={18} /> Analysis
            </Link>
            <Link href="/models" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-[15px]">
              <Box size={18} /> Models
            </Link>
            <Link href="/patients" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-[15px]">
              <Users size={18} /> Patients
            </Link>
            <Link href="/laboratory" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-[15px]">
              <FlaskConical size={18} /> Laboratory & Imaging
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-[15px]">
              <Settings size={18} /> Settings
            </Link>
          </nav>
        </div>

        <div className="px-5 pb-6 space-y-6">
          {/* Architecture Card */}
          <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at top right, #334155, transparent 60%)" }} />
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-3 relative z-10 shadow-sm">
              <Shield size={20} />
            </div>
            <h4 className="text-[14px] font-semibold text-slate-900 mb-1 relative z-10">Zero-Data-Leakage Architecture</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4 relative z-10">All systems running within on-premise enclave</p>
            <div className="inline-flex items-center gap-2 bg-slate-200/60 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 relative z-10">
              Secure Enclave Active <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          {/* User Profile */}
          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?u=ananya" alt="Dr. Ananya" className="w-10 h-10 rounded-full border border-slate-200" />
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">Dr. Ananya Sharma</div>
                  <div className="text-[11px] text-slate-500">Radiologist</div>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            <div className="space-y-1">
              <button className="flex items-center gap-3 w-full px-2 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="relative">
                  <Bell size={16} />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-800 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white">3</span>
                </div>
                Notifications
              </button>
              <button className="flex items-center gap-3 w-full px-2 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-24 flex-shrink-0 flex items-center justify-between px-8 bg-transparent">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Good Morning, Dr. Ananya</h1>
            <p className="text-[13px] text-slate-500 font-medium">Here's your clinical intelligence overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-4 text-slate-400" />
              <input type="text" placeholder="Search patients, studies, reports..." className="w-[340px] pl-10 pr-10 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-[13px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 font-medium text-slate-700 transition-all" />
              <SlidersHorizontal size={14} className="absolute right-4 text-slate-400 cursor-pointer" />
            </div>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center relative text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#F3F6FA]">3</span>
            </button>
            <div className="relative">
               <img src="https://i.pravatar.cc/150?u=ananya" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 flex gap-6">
          
          {/* Middle Column (Metrics + Pipeline + Split) */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Top Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              {/* Metric 1 */}
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col relative overflow-hidden h-[160px]">
                <div className="flex items-start gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 shadow-inner">
                    <Users size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-[22px] font-semibold text-slate-900 leading-tight">{dashData ? dashData.alerts.length : "..."}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Active Alerts</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    <ArrowUpRight size={12} strokeWidth={3} /> 12.5%
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none opacity-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData1}>
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col relative overflow-hidden h-[160px]">
                <div className="flex items-start gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 shadow-inner border border-slate-100">
                    <BarChart2 size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-[22px] font-semibold text-slate-900 leading-tight">84</div>
                    <div className="text-[11px] text-slate-500 font-medium">Analysis Today</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    <ArrowUpRight size={12} strokeWidth={3} /> 8.4%
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">vs yesterday</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none opacity-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData2}>
                      <Line type="monotone" dataKey="v" stroke="#64748b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col relative overflow-hidden h-[160px]">
                <div className="flex items-start gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 shadow-inner border border-slate-100">
                    <FileText size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-[22px] font-semibold text-slate-900 leading-tight">64</div>
                    <div className="text-[11px] text-slate-500 font-medium">Reports Generated</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    <ArrowUpRight size={12} strokeWidth={3} /> 15.3%
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">vs this week</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none opacity-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData3}>
                      <Line type="monotone" dataKey="v" stroke="#64748b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-[160px]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                    <Activity size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-[22px] font-semibold text-slate-900 leading-tight">{dashData ? dashData.active_models.length : "..."}</div>
                    <div className="text-[11px] text-slate-500 font-medium">AI Models Active</div>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-[12px] font-semibold text-emerald-800">All systems operational</span>
                </div>
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 relative">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[15px] font-semibold text-slate-900">AI Pipeline Status</h3>
                <button className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                  View Pipeline
                </button>
              </div>

              <div className="flex items-center justify-between px-8 relative">
                {/* Connecting Lines */}
                <div className="absolute left-[10%] right-[10%] top-[30px] h-px border-t-2 border-dashed border-slate-200 z-0"></div>
                
                {/* Stage 1 */}
                <div className="flex flex-col items-center relative z-10 w-32">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-600 mb-3 shadow-sm bg-white">
                    <Database size={20} />
                  </div>
                  <div className="text-[15px] font-bold text-slate-900 mb-1">01</div>
                  <div className="text-[11px] text-slate-600 font-medium text-center leading-tight mb-2 h-6">Data Ingestion<br/>& Sanitization</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex flex-col items-center relative z-10 w-32">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-600 mb-3 shadow-sm bg-white">
                    <Share2 size={20} />
                  </div>
                  <div className="text-[15px] font-bold text-slate-900 mb-1">02</div>
                  <div className="text-[11px] text-slate-600 font-medium text-center leading-tight mb-2 h-6">Feature<br/>Engineering</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
                  </div>
                </div>

                {/* Stage 3 (Active) */}
                <div className="flex flex-col items-center relative z-10 w-40">
                  <div className="relative mb-3">
                    {/* Active Ring */}
                    <svg className="absolute -inset-3 w-[80px] h-[80px] -rotate-90">
                      <circle cx="40" cy="40" r="38" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                      <circle cx="40" cy="40" r="38" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="238" strokeDashoffset="60" strokeLinecap="round" />
                    </svg>
                    <div className="w-14 h-14 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-blue-600 relative z-10">
                      <Trophy size={22} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-[15px] font-bold text-slate-900 mb-1">03</div>
                  <div className="text-[11px] text-slate-900 font-semibold text-center leading-tight mb-2 h-6">Model Tournament<br/>Arena</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Live
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="flex flex-col items-center relative z-10 w-32">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-600 mb-3 shadow-sm bg-white">
                    <Cloud size={20} />
                  </div>
                  <div className="text-[15px] font-bold text-slate-900 mb-1">04</div>
                  <div className="text-[11px] text-slate-600 font-medium text-center leading-tight mb-2 h-6">Local API<br/>Deployment</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Split: Recent Patients & AI Performance */}
            <div className="grid grid-cols-2 gap-6 flex-1 min-h-[300px]">
              
              {/* Recent Patients */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[15px] font-semibold text-slate-900">Recent Patients & Analysis</h3>
                  <button className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    View all
                  </button>
                </div>
                
                <div className="grid grid-cols-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                  <div className="col-span-1">Patient</div>
                  <div className="col-span-1 text-center">Study</div>
                  <div className="col-span-1 text-center">Time</div>
                  <div className="col-span-1 text-right">Status</div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {dashData && dashData.alerts ? dashData.alerts.map((a: any, i: number) => {
                    const p = {
                      name: a.name || a.patient_name || a.patient_id,
                      id: a.patient_id,
                      study: a.disease || a.model || 'Unknown',
                      time: 'Recent',
                      status: a.severity === 'critical' ? 'Critical Alert' : (a.probability ? a.probability + '% Match' : 'Pending'),
                      state: (a.severity === 'critical' || a.severity === 'high') ? 'warning' : 'success',
                      img: `https://i.pravatar.cc/150?u=${a.patient_id}`
                    };
                    return (

                    <div key={i} className="grid grid-cols-4 items-center px-2 py-1 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="col-span-1 flex items-center gap-3">
                        <img src={p.img} alt={p.name} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                        <div>
                          <div className="text-[12px] font-semibold text-slate-900">{p.name}</div>
                          <div className="text-[9px] font-medium text-slate-400">PID: {p.id}</div>
                        </div>
                      </div>
                      <div className="col-span-1 text-center text-[11px] font-medium text-slate-600">{p.study}</div>
                      <div className="col-span-1 text-center text-[11px] font-medium text-slate-600">{p.time}</div>
                      <div className="col-span-1 flex justify-end">
                        <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${p.state === 'success' ? 'text-emerald-700' : 'text-amber-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.state === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {p.status}
                        </div>
                      </div>
                    </div>
                  ); }) : null}
                </div>
              </div>

              {/* AI Performance Overview */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[15px] font-semibold text-slate-900">AI Performance Overview</h3>
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-transparent px-2 py-1 rounded hover:bg-slate-50 transition-colors">
                    This Week <ChevronDown size={14} />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col justify-center relative -mt-4">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={false} axisLine={false} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Performance" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} isAnimationActive={false} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Overlay Labels */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[10px] font-medium text-slate-500">Confidence (Avg)</span>
                    <span className="text-[14px] font-bold text-slate-900">92.6%</span>
                  </div>
                  <div className="absolute bottom-16 left-6 flex flex-col items-center">
                    <span className="text-[10px] font-medium text-slate-500">Doctor Agreement</span>
                    <span className="text-[14px] font-bold text-slate-900">89.1%</span>
                  </div>
                  <div className="absolute bottom-16 right-6 flex flex-col items-center">
                    <span className="text-[10px] font-medium text-slate-500">Avg. Analysis Time</span>
                    <span className="text-[14px] font-bold text-slate-900">2.4 min</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[12px] font-bold text-slate-700 mb-0.5">
                      <ArrowUpRight size={14} className="text-slate-400" /> 2.4%
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">vs last week</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[12px] font-bold text-slate-700 mb-0.5">
                      <ArrowUpRight size={14} className="text-slate-400" /> 3.7%
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">vs last week</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[12px] font-bold text-slate-700 mb-0.5">
                      <ArrowDownRight size={14} className="text-slate-400" /> 0.6 min
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">vs last week</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[320px] flex-shrink-0 flex flex-col gap-6">
            
            {/* AI Models In Use */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-semibold text-slate-900">AI Models In Use</h3>
                <button className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  View all
                </button>
              </div>
              <div className="space-y-5">
                {dashData && dashData.active_models ? dashData.active_models.map((am: any, i: number) => {
                  const m = {
                    name: am.name || am.id,
                    ver: am.version || 'v1.0',
                    state: am.status || 'Active',
                    icon: Box,
                    color: 'text-blue-500',
                    isTraining: am.status === 'Training'
                  };
                  return (

                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                        <m.icon size={16} className={m.color} />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-slate-900 leading-tight mb-0.5">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{m.ver}</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${m.isTraining ? 'text-blue-600' : 'text-emerald-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.isTraining ? 'bg-blue-500' : 'bg-emerald-500'}`}></span> {m.state}
                    </div>
                  </div>
                ); }) : null}
              </div>
              <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Manage Models
              </button>
            </div>

            {/* New Uploads */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-semibold text-slate-900">New Uploads</h3>
                <button className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  View all
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-100 mb-5 relative">
                <button 
                  onClick={() => setUploadTab("Laboratory")}
                  className={`pb-3 text-[12px] font-semibold transition-colors ${uploadTab === "Laboratory" ? "text-slate-900 border-b-2 border-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Laboratory
                </button>
                <button 
                  onClick={() => setUploadTab("Imaging")}
                  className={`pb-3 text-[12px] font-semibold transition-colors ${uploadTab === "Imaging" ? "text-slate-900 border-b-2 border-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Imaging
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {[
                  { name: 'Complete Blood Count', desc: '5 new reports', time: '2m ago', icon: FlaskConical, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { name: 'Lipid Profile', desc: '3 new reports', time: '15m ago', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { name: 'Liver Function Test', desc: '4 new reports', time: '32m ago', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { name: 'Thyroid Panel', desc: '2 new reports', time: '1h ago', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                ].map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl -mx-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${u.bg} flex items-center justify-center shrink-0`}>
                        <u.icon size={18} className={u.color} />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-slate-900 leading-tight mb-0.5">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{u.desc}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">{u.time}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Status Bar */}
        <footer className="h-[72px] flex-shrink-0 bg-[#FCFDFE] border-t border-slate-200/60 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <Activity size={14} />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Active Pipelines</div>
                <div className="text-[13px] font-bold text-slate-900 leading-none">12 <span className="inline-block w-12 h-3 ml-2 border-b-2 border-dashed border-slate-300"></span></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <Box size={14} />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Models Deployed</div>
                <div className="text-[13px] font-bold text-slate-900 leading-none">6 <span className="inline-block w-12 h-3 ml-2 border-b-2 border-dashed border-slate-300"></span></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 text-white rounded-xl px-5 py-2 flex items-center gap-3 shadow-md border border-slate-600">
            <Shield size={16} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest leading-tight opacity-90">ON-PREMISE</span>
              <span className="text-[10px] font-bold tracking-widest leading-tight">SECURE</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <Server size={14} />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">API Endpoint</div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">127.0.0.1:8000</div>
                <div className="text-[10px] font-semibold text-emerald-600 leading-tight">Healthy</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <HardDrive size={14} />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Last Backup</div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">12 Aug 2025, 02:15 AM</div>
                <div className="text-[10px] font-semibold text-emerald-600 leading-tight">Successful</div>
              </div>
            </div>
          </div>
        </footer>
      </main>

    </div>
  )
}
