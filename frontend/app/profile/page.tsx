"use client"

import React, { useEffect, useState } from "react"
import HospitalLayout from "@/components/hospital-layout"
import { User, Building2, Phone, Mail, MapPin, CalendarDays, Activity, BarChart2, Users, Brain, ClipboardCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null)
  const [patientCount, setPatientCount] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hospital_ai_session")
      if (raw) setSession(JSON.parse(raw))
    } catch {}
    fetch("/api/patients")
      .then(r => r.json())
      .then(d => setPatientCount(d.patients?.length ?? d.length ?? null))
      .catch(() => {})
  }, [])

  const isDoctor = session?.role === "doctor"
  const name = session?.full_name || session?.hospital_name || "—"
  const initials = name.trim().split(/\s+/).map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()

  const infoRows = isDoctor ? [
    { label: "Full Name",          value: session?.full_name || "—",       icon: User },
    { label: "License Number",     value: session?.license_no || "—",      icon: ClipboardCheck },
    { label: "Affiliated Hospital",value: session?.hospital_name || "—",   icon: Building2 },
    { label: "State / Region",     value: session?.state || "Not provided", icon: MapPin },
    { label: "Email Address",      value: session?.email || "Not provided", icon: Mail },
    { label: "Phone Number",       value: session?.phone || "Not provided", icon: Phone },
    { label: "Member Since",       value: session?.joined || "This session", icon: CalendarDays },
  ] : [
    { label: "Hospital Name",      value: session?.hospital_name || "—",    icon: Building2 },
    { label: "Registration No.",   value: session?.reg_no || "—",           icon: ClipboardCheck },
    { label: "Admin Name",         value: session?.admin_name || "Not provided", icon: User },
    { label: "Address",            value: session?.address || "Not provided", icon: MapPin },
    { label: "Email Address",      value: session?.email || "Not provided",  icon: Mail },
    { label: "Phone Number",       value: session?.phone || "Not provided",  icon: Phone },
    { label: "Member Since",       value: session?.joined || "This session", icon: CalendarDays },
  ]

  const stats = isDoctor
    ? [
        { label: "Patients Managed",  value: patientCount ?? "—", color: "text-blue-800",  bg: "bg-blue-50",   icon: Users },
        { label: "Active AI Models",  value: 6,                   color: "text-violet-700", bg: "bg-violet-50", icon: Brain },
        { label: "Reports Reviewed",  value: 142,                 color: "text-emerald-700",bg: "bg-emerald-50",icon: ClipboardCheck },
        { label: "Avg AI Agreement",  value: "94%",               color: "text-amber-700",  bg: "bg-amber-50",  icon: BarChart2 },
      ]
    : [
        { label: "Active Models",     value: 8,    color: "text-blue-800",   bg: "bg-blue-50",   icon: Brain },
        { label: "In Training",       value: 2,    color: "text-amber-700",  bg: "bg-amber-50",  icon: Activity },
        { label: "Integrations",      value: 7,    color: "text-violet-700", bg: "bg-violet-50", icon: BarChart2 },
        { label: "System Uptime",     value: "99.9%", color: "text-emerald-700", bg: "bg-emerald-50", icon: ClipboardCheck },
      ]

  const activity = isDoctor
    ? [
        { text: "Reviewed AI prediction for Rajeshwar Dutt",        time: "10 mins ago",  dot: "bg-emerald-500" },
        { text: "Signed off on Brain MRI (FLAIR) for Amit Kumar",   time: "2 hours ago",  dot: "bg-emerald-500" },
        { text: "Flagged Diabetic Retinopathy — Sunita Devi",       time: "45 mins ago",  dot: "bg-amber-500" },
        { text: "Submitted model feedback — Pneumonia Detection",    time: "Yesterday",    dot: "bg-emerald-500" },
      ]
    : [
        { text: "Deployed Hypertension Risk Model v1.0.0",          time: "Today",        dot: "bg-emerald-500" },
        { text: "Training in progress — Cardiac Arrest Predictor",  time: "2 hours ago",  dot: "bg-amber-500" },
        { text: "Approved model — Hepatitis Risk Predictor",        time: "Yesterday",    dot: "bg-emerald-500" },
        { text: "Integrated MRI Machine with Brain Tumor Detection", time: "3 days ago",  dot: "bg-emerald-500" },
      ]

  return (
    <HospitalLayout title="My Profile" subtitle="Your account information and activity summary">
      <div className="px-4 md:px-8 py-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* ── Hero Card ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-700 relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white, transparent 60%), radial-gradient(circle at 80% 50%, white, transparent 60%)" }} />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg flex-shrink-0">
                  {initials}
                </div>
                <div className="pb-1">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                      {isDoctor ? "🩺 Doctor" : "🏥 Hospital Admin"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                    {isDoctor && session?.license_no && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200">
                        {session.license_no}
                      </span>
                    )}
                    {!isDoctor && session?.reg_no && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200">
                        {session.reg_no}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link href="/settings" className="sm:mb-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors self-start sm:self-auto">
                Edit Settings <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 md:p-5 border border-slate-200/60`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={s.color} />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</span>
                </div>
                <div className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</div>
              </div>
            )
          })}
        </div>

        {/* ── Info + Activity grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Account Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
            <h3 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2">
              <User size={16} className="text-slate-500" />
              {isDoctor ? "Personal Information" : "Hospital Information"}
            </h3>
            <div className="space-y-4">
              {infoRows.map((row) => {
                const Icon = row.icon
                return (
                  <div key={row.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</div>
                      <div className="text-[13px] font-semibold text-slate-800 mt-0.5 break-all">{row.value}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
            <h3 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Activity size={16} className="text-slate-500" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${a.dot} flex-shrink-0 mt-1.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-slate-700 leading-snug">{a.text}</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </HospitalLayout>
  )
}
