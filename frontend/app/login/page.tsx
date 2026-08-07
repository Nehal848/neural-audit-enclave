"use client"

import React, { useState } from "react"
import Link from "next/link"
import { User, BadgeInfo, Lock, EyeOff, Building2, ArrowRight, HelpCircle, Mail, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const [accountType, setAccountType] = useState<"individual" | "hospital">("individual")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [hospitalName, setHospitalName] = useState("")
  const [email, setEmail] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const endpoint = accountType === "individual" ? "/api/doctor/login" : "/api/hospital/login"
      const payload = accountType === "individual"
        ? { license_no: identifier || "MED-98765-IN", password: password || "doctor" }
        : { reg_no: identifier || "HOSP-MH-001", password: password || "admin" }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Authentication failed")
      if (data.token) {
        localStorage.setItem("hospital_ai_session", JSON.stringify(data))
        window.location.href = accountType === "individual" ? "/dashboard" : "/dashboard-doc"
      }
    } catch (err: any) {
      setError(err.message || "Sign in failed")
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-transparent flex font-sans text-slate-900 relative">
      
      {/* ── LEFT PANE ──────────────────────────────────────────────────────── */}
      <div className="w-full md:w-[440px] flex-shrink-0 flex flex-col relative overflow-hidden bg-[#FCFDFE]">
        {/* Background Graphic overlay */}
        <div className="absolute bottom-0 left-0 w-full h-[500px] pointer-events-none" style={{
          background: "radial-gradient(circle at bottom left, rgba(226, 232, 240, 0.4) 0%, transparent 70%)"
        }} />
        {/* Hospital background image */}
        <div className="absolute -bottom-10 -left-10 w-[120%] opacity-20 pointer-events-none select-none mix-blend-multiply">
           <img src="/images/footer_new.png" alt="" className="w-full h-auto" />
        </div>

        <div className="relative z-10 pt-16 px-12 flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16 justify-center">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3L35 11.6603V28.9808L20 37.641L5 28.9808V11.6603L20 3Z" fill="#334155" />
              <path d="M20 3L35 11.6603L20 20.3205L5 11.6603L20 3Z" fill="#94A3B8" />
              <path d="M5 11.6603L20 20.3205V37.641L5 28.9808V11.6603Z" fill="#64748B" />
              <path d="M35 11.6603L20 20.3205V37.641L35 28.9808V11.6603Z" fill="#1E293B" />
              <circle cx="20" cy="20.3205" r="5" fill="#FCFDFE" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[22px] font-semibold tracking-tight text-[#0f172a] leading-none mb-1">ELVON</span>
              <span className="text-[10px] tracking-wide text-slate-600 font-semibold uppercase leading-none">Clinical Intelligence</span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold mb-3">Welcome Back</h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              Sign in to your {accountType === "individual" ? "individual" : "hospital"} account to access AI-powered clinical intelligence.
            </p>
          </div>

          <p className="text-[13px] font-semibold text-slate-900 mb-4 text-left">Account Type</p>

          <div className="space-y-4">
            {/* Option 1: Individual */}
            <button 
              onClick={() => setAccountType("individual")}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                accountType === "individual" 
                  ? "border-blue-600 bg-blue-50/50 shadow-[0_0_0_1px_rgba(37,99,235,1)]" 
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${accountType === "individual" ? "bg-blue-100/50" : "bg-slate-50"}`}>
                <User size={24} className={accountType === "individual" ? "text-blue-600" : "text-slate-400"} />
              </div>
              <div className="flex-1 mt-1">
                <h3 className="font-semibold text-[15px] mb-1.5">Individual Person</h3>
                <p className="text-xs text-slate-500 leading-relaxed pr-2">For doctors, clinicians and healthcare professionals</p>
              </div>
              <div className="shrink-0 mt-2">
                {accountType === "individual" ? (
                  <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white"></div>
                )}
              </div>
            </button>

            {/* Option 2: Hospital */}
            <button 
              onClick={() => setAccountType("hospital")}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                accountType === "hospital" 
                  ? "border-blue-600 bg-blue-50/50 shadow-[0_0_0_1px_rgba(37,99,235,1)]" 
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${accountType === "hospital" ? "bg-blue-100/50" : "bg-slate-50"}`}>
                <Building2 size={24} className={accountType === "hospital" ? "text-blue-600" : "text-slate-400"} />
              </div>
              <div className="flex-1 mt-1">
                <h3 className="font-semibold text-[15px] mb-1.5">Hospital Authorisation</h3>
                <p className="text-xs text-slate-500 leading-relaxed pr-2">For hospitals, labs and healthcare organizations</p>
              </div>
              <div className="shrink-0 mt-2">
                {accountType === "hospital" ? (
                  <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white"></div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANE ─────────────────────────────────────────────────────── */}
      <div className="flex-1 p-6 relative">
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 w-full h-full flex flex-col relative overflow-y-auto">
          
          <div className="px-10 pt-10 pb-6 flex justify-end items-center sticky top-0 bg-white/80 backdrop-blur-md z-20">
             <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-slate-700">
               <HelpCircle size={14} strokeWidth={2.5} /> Need help?
             </button>
          </div>

          <div className="px-10 pb-16 max-w-[560px] mt-4">
            <h1 className="text-[28px] font-semibold mb-2">
              {accountType === "individual" ? "Sign in to your account" : "Sign in to your hospital account"}
            </h1>
            <p className="text-slate-500 text-sm mb-12">
              Enter your credentials to continue to ELVON Clinical Intelligence.
            </p>
            
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-6">
              
              {accountType === "individual" ? (
                <>
                  {/* Medical Reg Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Medical Registration or Licence Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <BadgeInfo size={18} strokeWidth={2} />
                      </div>
                      <input 
                        type="text" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. MED-98765-IN" 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Hospital Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Hospital Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Building2 size={18} strokeWidth={2} />
                      </div>
                      <input 
                        type="text" 
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="Enter hospital name" 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
                      />
                    </div>
                  </div>
                  
                  {/* Registration Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Registration Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <BadgeInfo size={18} strokeWidth={2} />
                      </div>
                      <input 
                        type="text" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. HOSP-MH-001" 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
                      />
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={18} strokeWidth={2} />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address" 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} strokeWidth={2} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password (e.g. doctor or admin)" 
                    className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <EyeOff size={18} strokeWidth={2} />
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading} className="w-full bg-[#0f172a] text-white py-4 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors">
                  {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={18} strokeWidth={2.5} />
                </button>
              </div>
              
              <div className="text-center pt-8">
                <p className="text-sm text-slate-500 font-medium">
                  Don't have an account? <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-semibold">Sign up as {accountType === "individual" ? "Individual" : "Hospital"}</Link>
                </p>
              </div>

            </form>
          </div>

        </div>
      </div>

    </div>
  )
}
