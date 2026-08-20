"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Search, Bell, Settings, LayoutDashboard, BarChart2, Box, Users, FlaskConical, 
  LogOut, Shield, ChevronDown, SlidersHorizontal, User, Menu, X
} from "lucide-react"

function getInitials(name: string) {
  if (!name) return "?"
  return name.trim().split(/\s+/).map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hospital_ai_session")
      if (raw) setSession(JSON.parse(raw))
    } catch {}
  }, [])

  const userName = session?.full_name || session?.hospital_name || "User"
  const userRole = session?.role === "hospital" ? "Hospital Admin" : "Doctor"
  const userInitials = getInitials(userName)

  const navLinks = [
    { href: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { href: "/analysis",    icon: BarChart2,        label: "Analysis" },
    { href: "/models",      icon: Box,              label: "Models" },
    { href: "/patients",    icon: Users,            label: "Patients" },
    { href: "/laboratory",  icon: FlaskConical,     label: "Laboratory & Imaging" },
    { href: "/profile",     icon: User,             label: "My Profile" },
    { href: "/settings",    icon: Settings,         label: "Settings" },
  ]

  const Sidebar = () => (
    <aside className="w-[260px] flex-shrink-0 bg-[#FCFDFE] border-r border-slate-200/60 flex flex-col justify-between h-full relative z-20">
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
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${
              pathname === href 
                ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-5 pb-6 space-y-6">
        {/* Secure Enclave Card */}
        <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at top right, #334155, transparent 60%)" }} />
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-3 relative z-10 shadow-sm">
            <Shield size={20} />
          </div>
          <h4 className="text-[14px] font-semibold text-slate-900 mb-1 relative z-10">Zero-Data-Leakage Architecture</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-4 relative z-10">All systems running within on-premise enclave</p>
          <div className="inline-flex items-center gap-2 bg-slate-200/60 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 relative z-10">
            Secure Enclave Active <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>

        {/* User Profile */}
        <div className="pt-2 border-t border-slate-200/60">
          <Link href="/profile" onClick={() => setSidebarOpen(false)} className="flex items-center justify-between mb-4 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {userInitials}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-900 truncate max-w-[130px]">{userName}</div>
                <div className="text-[11px] text-slate-500">{userRole}</div>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </Link>
          <div className="space-y-1">
            <button className="flex items-center gap-3 w-full px-2 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="relative">
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-800 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white">3</span>
              </div>
              Notifications
            </button>
            <button 
              onClick={() => { localStorage.removeItem('hospital_ai_session'); window.location.href = '/login' }}
              className="flex items-center gap-3 w-full px-2 py-2 text-[13px] font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex font-sans text-slate-900 overflow-hidden">
      
      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────────── */}
      <div className="hidden md:flex h-screen">
        <Sidebar />
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] shadow-2xl overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Header */}
        <header className="h-16 md:h-24 flex-shrink-0 flex items-center justify-between px-4 md:px-8 bg-transparent border-b border-slate-200/60 md:border-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-slate-900 tracking-tight">{title}</h1>
              <p className="hidden md:block text-[13px] text-slate-500 font-medium">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden lg:flex items-center">
              <Search size={16} className="absolute left-4 text-slate-400" />
              <input type="text" placeholder="Search patients, studies..." className="w-[280px] pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-[13px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 font-medium text-slate-700 transition-all" />
            </div>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center relative text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell size={17} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#F3F6FA]">3</span>
            </button>
            <Link href="/profile" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white relative">
              {userInitials}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
