"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Search, Bell, Settings, LayoutDashboard, BarChart2, Box, Users, FlaskConical, 
  LogOut, Shield, ChevronDown, SlidersHorizontal
} from "lucide-react"

export default function HospitalLayout({ 
  children, 
  title, 
  subtitle 
}: { 
  children: React.ReactNode, 
  title: string, 
  subtitle: string 
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex font-sans text-slate-900 overflow-hidden">
      
      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="w-[260px] flex-shrink-0 bg-[#FCFDFE] border-r border-slate-200/60 flex flex-col justify-between h-screen relative z-20">
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
            <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${
              pathname === "/dashboard" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/analysis" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${
              pathname === "/analysis" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <BarChart2 size={18} /> Analysis
            </Link>
            <Link href="/models" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${
              pathname === "/models" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <Box size={18} /> Models
            </Link>
            <Link href="/patients" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${
              pathname === "/patients" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <Users size={18} /> Patients
            </Link>
            <Link href="/laboratory" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${
              pathname === "/laboratory" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <FlaskConical size={18} /> Laboratory & Imaging
            </Link>
            <Link href="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${
              pathname === "/settings" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
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
              <button 
                onClick={() => { localStorage.removeItem('hospital_ai_session'); window.location.href = '/' }}
                className="flex items-center gap-3 w-full px-2 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
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
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">{title}</h1>
            <p className="text-[13px] text-slate-500 font-medium">{subtitle}</p>
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
        <div className="flex-1 overflow-hidden flex flex-col pb-8">
           {children}
        </div>
      </main>

    </div>
  )
}
