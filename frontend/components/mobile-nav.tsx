"use client"

import { useState } from "react"
import Link from "next/link"

const NAV_LINKS = [
  { label: "Platform",     href: "/#platform" },
  { label: "Modules",      href: "/#agents" },
  { label: "Workflow",     href: "/#workflow" },
  { label: "Integrations", href: "/#integrations" },
  { label: "Pricing",      href: "/#pricing" },
]

const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(245,244,240,0.30)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
} as const

export function MobileNav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-6xl">

        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
          style={NAV_STYLE}
        >
          {/* Designer Logo Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] flex items-center justify-center shadow-md shadow-[#0B4F8C]/25 group-hover:scale-105 transition-all duration-300">
              <span className="font-extrabold text-white tracking-tighter text-sm font-sans">E+</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.28em] text-sm text-[#1E293B] font-sans">ELVON</span>
              <span className="text-[9px] tracking-[0.16em] text-[#5B9BD5] font-bold -mt-1 uppercase">Medical AI Studio</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-xs text-[#1E293B]/75 hover:text-[#0B4F8C] transition-colors duration-200 tracking-wide font-semibold"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/sign-up" 
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0B4F8C]/25 hover:shadow-lg hover:scale-105 transition-all duration-200 tracking-wide hidden lg:flex items-center gap-2" 
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <span>✨ Launch Clinical AI</span>
            </Link>

            {/* Burger — mobile only */}
            <button
              onClick={() => setOpen(v => !v)}
              className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span
                className={`w-5 h-[1.5px] bg-black/70 rounded-full transition-transform duration-300 origin-center ${
                  open ? "rotate-45 translate-y-[3.25px]" : ""
                }`}
              />
              <span
                className={`w-5 h-[1.5px] bg-black/70 rounded-full transition-transform duration-300 origin-center ${
                  open ? "-rotate-45 -translate-y-[3.25px]" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className={`lg:hidden mt-2 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "max-h-[350px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="px-4 py-3 text-sm text-[#1E293B]/75 hover:text-[#0B4F8C] hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide font-semibold"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 px-2 pb-2">
              <Link 
                href="/sign-up" 
                className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] text-white font-bold text-sm shadow-md transition-all duration-200 tracking-wide" 
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                ✨ Launch Clinical AI
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
