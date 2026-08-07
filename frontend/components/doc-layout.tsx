import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, Box, ShoppingBag, PlusCircle, Layers, Link as LinkIcon, Settings, 
  Shield, Bell, LogOut, ChevronDown, Search 
} from "lucide-react"

export default function DocLayout({ 
  children, 
  title, 
  subtitle,
  searchPlaceholder
}: { 
  children: React.ReactNode, 
  title?: string, 
  subtitle?: string,
  searchPlaceholder?: string
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <div className="hidden md:flex w-[280px] bg-[#FCFDFE] border-r border-slate-100 flex-col h-full shrink-0 shadow-[2px_0_15px_rgba(0,0,0,0.02)]">
        
        {/* Logo */}
        <div className="p-8">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3L35 11.6603V28.9808L20 37.641L5 28.9808V11.6603L20 3Z" fill="#334155" />
              <path d="M20 3L35 11.6603L20 20.3205L5 11.6603L20 3Z" fill="#94A3B8" />
              <path d="M5 11.6603L20 20.3205V37.641L5 28.9808V11.6603Z" fill="#64748B" />
              <path d="M35 11.6603L20 20.3205V37.641L35 28.9808V11.6603Z" fill="#1E293B" />
              <circle cx="20" cy="20.3205" r="5" fill="#FCFDFE" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold tracking-tight text-slate-900 leading-none mb-1">ELVON</span>
              <span className="text-[9px] tracking-wider text-slate-500 font-bold uppercase leading-none">Clinical Intelligence</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          <nav className="space-y-1.5 flex flex-col">
            <Link href="/dashboard-doc" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
              pathname === "/dashboard-doc" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-md shadow-slate-300/30" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <Home size={18} strokeWidth={pathname === "/dashboard-doc" ? 2.5 : 2} /> Dashboard
            </Link>
            
            <Link href="/dashboard-doc/models" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
              pathname === "/dashboard-doc/models" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-md shadow-slate-300/30" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <Box size={18} strokeWidth={pathname === "/dashboard-doc/models" ? 2.5 : 2} /> My Models
            </Link>

            <Link href="/dashboard-doc/marketplace" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
              pathname === "/dashboard-doc/marketplace" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-md shadow-slate-300/30" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <ShoppingBag size={18} strokeWidth={pathname === "/dashboard-doc/marketplace" ? 2.5 : 2} /> Model Market Place
            </Link>
            
            <Link href="/dashboard-doc/create" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
              pathname === "/dashboard-doc/create" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-md shadow-slate-300/30" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <PlusCircle size={18} strokeWidth={pathname === "/dashboard-doc/create" ? 2.5 : 2} /> Create Model
            </Link>
            
            <Link href="/dashboard-doc/version" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
              pathname === "/dashboard-doc/version" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-md shadow-slate-300/30" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <Layers size={18} strokeWidth={pathname === "/dashboard-doc/version" ? 2.5 : 2} /> Version
            </Link>
            
            <Link href="/dashboard-doc/integration" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
              pathname === "/dashboard-doc/integration" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-md shadow-slate-300/30" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <LinkIcon size={18} strokeWidth={pathname === "/dashboard-doc/integration" ? 2.5 : 2} /> Integration
            </Link>

            <Link href="/dashboard-doc/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all ${
              pathname === "/dashboard-doc/settings" 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-md shadow-slate-300/30" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <Settings size={18} strokeWidth={pathname === "/dashboard-doc/settings" ? 2.5 : 2} /> Setting
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-slate-100 flex flex-col gap-6 bg-slate-50/50">
          
          {/* Zero Data Leakage Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
             {/* decorative lines */}
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.03] pointer-events-none">
               <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M0 50C20 20 80 20 100 50" stroke="black" strokeWidth="2"/>
                 <path d="M0 60C20 30 80 30 100 60" stroke="black" strokeWidth="2"/>
                 <path d="M0 70C20 40 80 40 100 70" stroke="black" strokeWidth="2"/>
               </svg>
             </div>
             
             <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-4 shadow-md relative z-10">
               <Shield size={20} />
             </div>
             <h4 className="text-[14px] font-bold text-slate-900 leading-snug mb-2 relative z-10">Zero-Data-Leakage<br/>Architecture</h4>
             <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-4 relative z-10">
               All systems running within on-premise enclave
             </p>
             <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 relative z-10">
               Secure Enclave Active <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse"></span>
             </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?u=admin2" alt="Hospital Admin" className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" />
              <div>
                <div className="text-[12px] font-bold text-slate-900">CityCare Hospital</div>
                <div className="text-[10px] font-semibold text-slate-500">Admin & Compliance</div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <ChevronDown size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[13px] font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors">
            <div className="relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 border-2 border-[#FCFDFE] rounded-full text-[8px] flex items-center justify-center text-white font-bold">3</span>
            </div>
            Notifications
          </div>

          <button 
            onClick={() => { localStorage.removeItem('hospital_ai_session'); window.location.href = '/' }}
            className="flex items-center gap-3 text-[13px] font-bold text-slate-700 hover:text-rose-600 transition-colors"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
        {/* Header */}
        <header className="h-[100px] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900 leading-tight mb-1">{title || "Dashboard"}</h1>
            {subtitle && <p className="text-[14px] font-medium text-slate-500">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={searchPlaceholder || "Search patients, studies, reports..."} 
                className="w-[320px] bg-white border border-slate-200 rounded-full pl-11 pr-11 py-3 text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>
              </button>
            </div>
            
            <button className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative">
              <Bell size={18} strokeWidth={2} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 border-2 border-white rounded-full text-[9px] flex items-center justify-center text-white font-bold">3</span>
            </button>

            <div className="relative">
               <img src="https://i.pravatar.cc/150?u=admin2" alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] object-cover cursor-pointer" />
               <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
