"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { IntroAnimation, INTRO_DURATION_MS, HERO_REVEAL_MS } from "@/components/intro-animation"
import { AgentInterface } from "@/components/agent-interface"
import { PixelIcon } from "@/components/pixel-icon"
import { LiveAgentFeed, LiveAgentCounter } from "@/components/live-agent-feed"
import { RevealText } from "@/components/reveal-text"
import { StackingAgentCards } from "@/components/stacking-agent-cards"
import { MobileNav } from "@/components/mobile-nav"
import { DevExSection } from "@/components/devex-section"

// ─── Intersection Observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = 16
    const increment = end / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, end])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Bento card ──────────────────────────────────────────────────────────────
function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Hover glow spot */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)" }}
      />
      {children}
    </div>
  )
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ElvonPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  // Start video zoom slightly before hero content reveals, for seamless overlap
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)
  }, [])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="text-[#111] min-h-screen font-sans antialiased">

      {/* ── INTRO ANIMATION ───────────────────────────────────────────────── */}
      <IntroAnimation onDone={handleIntroDone} />

      {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
      <MobileNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex flex-col justify-end">

        {/* Video background — zooms in once intro is done */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/Hospital_machines.mp4"
          style={{
            transform: videoReady ? "scale(1.05)" : "scale(0.85)",
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: "blur(4px)",
          }}
        />



        {/* Progressive blur + light gradient rising from bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "65%", background: "linear-gradient(to top, #F3F6FA 0%, #F3F6FA 18%, rgba(243,246,250,0.85) 35%, rgba(243,246,250,0.5) 55%, rgba(243,246,250,0.15) 75%, transparent 100%)" }} />
        {/* Backdrop blur layers — progressively lighter toward top */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "20%", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "38%", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "55%", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />

        {/* Title + metrics — pushed to bottom but with relative layout */}
        <div className="relative z-30 flex flex-col px-6 md:px-12 pb-12 pt-32 max-w-3xl">
          {/* Title */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-light text-[#111] leading-tight tracking-tight mb-6"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms",
            }}
          >
            Enterprise AI Infrastructure<br />for Modern Healthcare
          </h1>

          {/* Description */}
          <p
            className="text-lg sm:text-xl text-black/60 font-light leading-relaxed mb-10 max-w-2xl"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(20px)",
              transform: heroReady ? "translateY(0px)" : "translateY(24px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 100ms, filter 1s cubic-bezier(0.16,1,0.3,1) 100ms, transform 1s cubic-bezier(0.16,1,0.3,1) 100ms",
            }}
          >
            Deploy licensed AI models or build hospital-owned AI systems<br />
            that analyze medical imaging, laboratory reports, and patient<br />
            records—all within your hospital&apos;s secure infrastructure.
          </p>

          {/* ── BIG HERO SIGN UP & LOGIN BUTTONS (BLUE - BEIGE - GREEN THEME) ── */}
          <div 
            className="flex flex-wrap items-center gap-4 my-8"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(18px)",
              transform: heroReady ? "translateY(0px)" : "translateY(24px)",
              transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 150ms, filter 0.9s cubic-bezier(0.16,1,0.3,1) 150ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 150ms",
            }}
          >
            <a
              href="/sign-up"
              className="px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] text-white font-bold text-base sm:text-lg shadow-xl shadow-[#0B4F8C]/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 tracking-wide"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <span>✨ Hospital / Doctor Sign Up</span>
              <span className="text-xl">→</span>
            </a>
            <a
              href="/login"
              className="px-8 py-4 sm:py-5 rounded-2xl bg-[#F4F6F9] border-2 border-[#0B4F8C]/40 text-[#0B4F8C] hover:bg-[#5B9BD5]/20 hover:border-[#0B4F8C] font-bold text-base sm:text-lg shadow-md transition-all duration-300 flex items-center gap-2 tracking-wide"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <span>🚀 Clinical Portal Login</span>
            </a>
          </div>

          {/* 3 metrics — staggered after title & description */}
          <div className="flex flex-wrap gap-8 sm:gap-12 mt-2">
            {[
              { value: "100+", label: "AI Models" },
              { value: "100%", label: "On-Premise Secure" },
              { value: "24/7", label: "Clinical Intelligence" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(16px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${220 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${220 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${220 + i * 80}ms`,
                }}
              >
                <div className="text-3xl sm:text-4xl text-[#111] font-light tracking-tight" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.value}</div>
                <div className="text-xs text-black/40 tracking-widest uppercase mt-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── */}
      <section id="platform" className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>PLATFORM</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              {"Everything hospitals need to\ndeploy AI with confidence."}
            </RevealText>
          </div>

          <div className="grid grid-cols-12 grid-rows-auto gap-3" onMouseMove={handleMouse}>
            {/* Big left card — full width now that multi-agent is removed */}
            <BentoCard className="col-span-12 p-8 min-h-[200px] flex flex-col justify-between relative overflow-hidden" delay={0}>
              {/* Arc background image — always fills container, objects pushed to bottom third */}
              <img
                src="/images/arc_new.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 70%", filter: "blur(3px)" }}
              />
              {/* Progressive blur layer — blurs from 45% downward */}
              <div className="absolute inset-0" style={{
                maskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }} />
              {/* Fade-to-background gradient — matches site bg color #F3F6FA */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, transparent 35%, rgba(243,246,250,0.3) 50%, rgba(243,246,250,0.75) 65%, rgba(243,246,250,0.95) 80%, rgb(243,246,250) 100%)",
                }}
              />
              {/* Content */}
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl border border-black/10 bg-white/60 flex items-center justify-center mb-6" style={{ backdropFilter: "blur(8px)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
                </div>
                <h3 className="text-xl font-light mb-3">Licensed AI Model Marketplace</h3>
                <p className="text-sm text-black/45 leading-relaxed max-w-xl">
                  Deploy clinically validated AI models for disease prediction, medical imaging analysis, and laboratory diagnostics—all running securely inside your hospital infrastructure.
                </p>
              </div>
            </BentoCard>

            {/* Bottom row */}
            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={120}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Hospital AutoML Studio</h3>
              <p className="text-sm text-black/45 leading-relaxed">Build hospital-owned AI models using your own datasets through a guided, no-code AutoML pipeline with automated preprocessing, training, evaluation, and deployment.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={160}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Medical Systems Integration</h3>
              <p className="text-sm text-black/45 leading-relaxed">Seamlessly connect with MRI, CT, X-ray, PACS, LIS, EMR/EHR, pathology, and laboratory systems to create a unified AI-powered clinical workflow.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={200}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Clinical Intelligence Dashboard</h3>
              <p className="text-sm text-black/45 leading-relaxed">Monitor AI models, patient analyses, system integrations, performance metrics, and real-time clinical insights through an intuitive enterprise dashboard.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
      <section id="agents" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>AI MODULES</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
                {"Enterprise AI Modules\nReady for Deployment"}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              Deploy clinically validated AI modules or customize them with hospital datasets. All modules are secure, HIPAA-compliant, and run entirely on-premise.
            </p>
          </div>

          <StackingAgentCards />
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="workflow" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>WORKFLOW</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
              {"From Deployment to\nClinical Intelligence"}
            </RevealText>
            <div className="mt-4 text-xl font-light text-black/50" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
              Phase 1 - Licensed AI Models
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-16" onMouseMove={handleMouse}>
            {[
              { n: "01", title: "Choose",  desc: "Browse the AI Model Marketplace and select clinically validated disease prediction models for your hospital's requirements.", delay: 0,   img: "/images/choose_new.png" },
              { n: "02", title: "Deploy",  desc: "Install the licensed AI models directly on your hospital's secure on-premise infrastructure with minimal configuration.", delay: 80,  img: "/images/deploy_new.png" },
              { n: "03", title: "Integrate", desc: "Connect the deployed models with MRI, CT, X-ray, laboratory systems, PACS, and EMR/EHR to begin automated data analysis.", delay: 140, img: "/images/integrate_new.png" },
              { n: "04", title: "Analyze", desc: "AI continuously analyzes patient data, generates explainable reports, and provides real-time clinical insights to assist doctors.", delay: 200, img: "/images/analyze_new.png" },
            ].map((step) => (
              <BentoCard key={step.n} className="relative overflow-hidden flex flex-col min-h-[320px]" delay={step.delay}>
                {/* Image at top — mask fades it out strongly before the bottom edge */}
                <div className="absolute inset-x-0 top-0 h-56 pointer-events-none">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover object-top"
                    style={{
                      maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                    }}
                  />
                </div>
                {/* Number top-left */}
                <div className="relative z-10 p-7">
                  <span className="font-pixel text-[11px] text-black/20 tracking-widest block">{step.n}</span>
                </div>
                {/* Text pushed further down */}
                <div className="relative z-10 px-7 pb-7 mt-auto pt-16">
                  <h3 className="text-2xl font-light mb-3">{step.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed">{step.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>

          <div className="mt-24 mb-16">
            <div className="text-xl font-light text-black/50" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
              Phase 2 - Hospital AutoML Platform
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3" onMouseMove={handleMouse}>
            {[
              { n: "05", title: "Upload",  desc: "Upload your hospital's medical dataset or import data securely from laboratory and imaging systems.", delay: 0,   img: "/images/upload_new.png" },
              { n: "06", title: "Build",   desc: "The AutoML engine automatically validates, cleans, engineers features, trains multiple algorithms, and selects the best-performing model.", delay: 80,  img: "/images/build_new.png" },
              { n: "07", title: "Validate", desc: "Review explainability reports, model performance, accuracy metrics, and approve the model after clinical verification.", delay: 140, img: "/images/validate_new.png" },
              { n: "08", title: "Deploy",  desc: "Publish the hospital-owned AI model to production, integrate it into clinical workflows, and manage it through the Model Dashboard.", delay: 200, img: "/images/deploy_p2_new.png" },
            ].map((step) => (
              <BentoCard key={`p2-${step.n}`} className="relative overflow-hidden flex flex-col min-h-[320px]" delay={step.delay}>
                {/* Image at top — mask fades it out strongly before the bottom edge */}
                <div className="absolute inset-x-0 top-0 h-56 pointer-events-none">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover object-top"
                    style={{
                      maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                    }}
                  />
                </div>
                {/* Number top-left */}
                <div className="relative z-10 p-7">
                  <span className="font-pixel text-[11px] text-black/20 tracking-widest block">{step.n}</span>
                </div>
                {/* Text pushed further down */}
                <div className="relative z-10 px-7 pb-7 mt-auto pt-16">
                  <h3 className="text-2xl font-light mb-3">{step.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed">{step.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ──────────────────────────────────────────────────── */}
      <section id="integrations" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4"><Tag>INTEGRATIONS</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
                {"Connect Every Clinical System.\nPower Every Workflow."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-lg">
              Seamlessly integrate with your hospital&apos;s existing healthcare infrastructure. From medical imaging devices to laboratory systems and electronic health records, the platform securely unifies clinical data into one intelligent AI ecosystem.
            </p>
          </div>

          {/* Full-width image block with glass cards */}
          {/* Mobile: flex-col, image + cards stacked. Desktop: image fills block, cards absolute */}
          <div className="rounded-2xl overflow-hidden border border-black/[0.07] flex flex-col md:block md:relative" onMouseMove={handleMouse}>
            {/* Image */}
            <div className="relative w-full h-[280px] md:h-[580px] shrink-0">
              <img
                src="/images/integrations_new.png"
                alt="Healthcare integration architecture"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            {/* Cards — flex row on mobile (equal spacing), absolute on desktop */}
            <div className="flex flex-col gap-3 p-4 md:absolute md:bottom-4 md:right-4 md:p-0 md:w-96">
              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  background: "rgba(255,255,255,0.60)",
                }}
              >
                <Tag>APIS &amp; SDKS</Tag>
                <h3 className="mt-3 text-lg font-light mb-2">Developer &amp; Enterprise APIs</h3>
                <p className="text-xs text-black/45 leading-relaxed mb-4">Integrate the platform into your existing healthcare ecosystem using secure APIs and SDKs.</p>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/[0.06]">
                  {["REST API", "WebSocket Streaming", "Python SDK", "Java SDK", ".NET SDK", "OAuth 2.0", "Access Control"].map((f) => (
                    <span key={f} className="text-[10px] bg-black/[0.04] px-2 py-0.5 rounded text-black/55">{f}</span>
                  ))}
                </div>
              </div>

              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  background: "rgba(255,255,255,0.60)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-black/40 tracking-widest font-mono"># Example Integration</span>
                </div>
                <div className="bg-black/[0.05] rounded-lg border border-black/[0.07] p-3 font-mono text-[10px] text-black/60 leading-relaxed overflow-x-auto">
                  <span className="text-blue-600/70">from</span> hospital_ai <span className="text-blue-600/70">import</span> Client<br /><br />
                  client = Client(api_key=<span className="text-green-700/70">&quot;YOUR_API_KEY&quot;</span>)<br /><br />
                  analysis = client.predict(<br />
                  {"  "}source=<span className="text-green-700/70">&quot;MRI&quot;</span>,<br />
                  {"  "}patient_id=<span className="text-green-700/70">&quot;PT-2048&quot;</span>,<br />
                  {"  "}model=<span className="text-green-700/70">&quot;Brain Tumor Detection&quot;</span><br />
                  )<br /><br />
                  <span className="text-blue-600/70">print</span>(analysis.result)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY & OBSERVABILITY ──────────────────────────────────��──── */}
      <section id="security" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>SECURITY</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
              {"Enterprise-Grade Security\nfor Modern Healthcare"}
            </RevealText>
          </div>

          {/* Asymmetric grid: left text + title, right interactive audit log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side — descriptions */}
            <div className="space-y-6">
              <p className="text-sm text-black/45 leading-relaxed">
                Built for hospitals where patient privacy, regulatory compliance, and AI transparency are essential. Every medical analysis, AI prediction, and system activity is securely recorded and fully traceable.
              </p>

              <div className="space-y-4">
                {[
                  { label: "100% On-Premise Deployment", desc: "Patient data, AI models, and medical reports never leave the hospital infrastructure, ensuring complete control over sensitive healthcare information." },
                  { label: "Complete Audit Trail", desc: "Every prediction, report generation, doctor review, model deployment, and system activity is automatically logged for full traceability and compliance." },
                  { label: "Real-Time AI Monitoring", desc: "Monitor AI model health, inference performance, integration status, and system activity through a centralized enterprise dashboard." },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-1 bg-black/10 rounded-full shrink-0" />
                    <div>
                      <h3 className="text-sm font-light mb-1">{item.label}</h3>
                      <p className="text-xs text-black/35">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance badges — vertical stack */}
              <div className="pt-4 flex flex-col gap-2">
                <div className="text-xs text-black/40 font-mono tracking-widest mb-1">Healthcare Compliance Ready</div>
                {["HIPAA Ready", "GDPR Ready", "ISO 27001", "HL7 & FHIR Compatible", "DICOM & PACS Support"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-xs text-black/25">
                    <span className="w-1 h-1 rounded-full bg-black/25" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Right side — live audit log visualization */}
            <BentoCard className="p-6 lg:row-span-1" delay={0}>
              <div className="text-xs text-black/30 tracking-widest uppercase mb-4">Live Clinical Activity</div>
              <div className="space-y-2">
                {[
                  { time: "14:42:18", action: "Brain Tumor AI Model Completed Analysis", status: "success" },
                  { time: "14:42:11", action: "MRI Study Received from PACS", status: "success" },
                  { time: "14:41:56", action: "Hospital AutoML Training Started", status: "success" },
                  { time: "14:41:40", action: "Doctor Approved AI Analysis", status: "success" },
                  { time: "14:41:22", action: "New Laboratory Report Synced", status: "success" },
                  { time: "14:40:58", action: "Pneumonia Detection Model Updated", status: "success" },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/[0.02] hover:bg-black/[0.04] transition-colors border border-black/[0.04] group cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                    }}
                  >
                    <span className="text-[10px] text-black/25 font-mono min-w-[60px]">{log.time}</span>
                    <span className="text-[11px] text-black/50 font-light flex-1">{log.action}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 group-hover:bg-green-500 transition-colors" />
                  </div>
                ))}
              </div>
              <style>{`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── DEVELOPER EXPERIENCE ──────────────────────────────────────────── */}
      <DevExSection />

      {/* ── MARQUEE CAPABILITIES ──────────────────────────────────────────── */}
      <section className="py-0 border-t border-black/[0.06] overflow-hidden select-none">
        <div className="flex border-b border-black/[0.06]" style={{ animation: "marqueeLeft 28s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Disease Prediction", "Medical Imaging", "AI Report Analysis", "MRI", "CT Scan", "X-Ray", "Pathology", "Laboratory Intelligence", "AutoML Studio", "Explainable AI", "Clinical Dashboard", "Model Marketplace"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                  <span className="text-sm text-black/45 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex" style={{ animation: "marqueeRight 22s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Hospital-Owned AI", "DICOM", "PACS", "HL7", "FHIR", "EMR/EHR", "Real-Time Monitoring", "AI Governance", "Secure On-Premise", "Healthcare Analytics", "Clinical Decision Support", "Enterprise AI"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/12 shrink-0" />
                  <span className="text-sm text-black/30 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>


      {/* ── PRICING (BLUE - BEIGE - GREEN CLINICAL TIERS) ────────────────── */}
      <section id="pricing" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] bg-[#F4F6F9]/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <PixelIcon type="pricing" size={40} />
            <div className="mt-4"><Tag>HOSPITAL DEPLOYMENT</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight text-[#0B4F8C]">
              {"Secure On-Premise Clinical AI Tiers."}
            </RevealText>
            <p className="text-sm text-slate-600 mt-3 max-w-xl">
              No free tiers or unsecured cloud data paths. 100% on-premise deployment inside your hospital enclave with full CDSCO &amp; HIPAA compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" onMouseMove={handleMouse}>
            {[
              {
                name: "Clinical Pilot",
                price: "$1,499",
                period: "/mo",
                sub: "For single radiology or ICU department",
                features: ["Up to 10 PACS/DICOM modalities", "13-Step AutoML Studio", "HIPAA/CDSCO compliant enclave", "Local workstation inference", "Dedicated clinical onboarding"],
                highlight: false,
                buttonText: "START PILOT DEPLOYMENT",
                href: "/sign-up",
                delay: 0,
              },
              {
                name: "Hospital Network",
                price: "$4,999",
                period: "/mo",
                sub: "For full multi-specialty hospital deployment",
                features: ["Unlimited PACS/EHR/EMR feeds", "Multi-Algorithm AutoML Tournament", "Live SHAP Clinical Explainability", "Real-time Patient Triage Dashboard", "24/7 Priority AI Clinical Support", "Air-gapped secure hardware sync"],
                highlight: true,
                buttonText: "LAUNCH HOSPITAL AI",
                href: "/sign-up",
                delay: 80,
              },
              {
                name: "Health System Enterprise",
                price: "Custom",
                sub: "For regional multi-hospital networks",
                features: ["Multi-campus federated learning", "Custom LLM & Medical Vision models", "Governing Ethics Committee sign-off", "Dedicated AI Safety Engineers", "Custom SLAs & Hardware clusters", "Full source code auditability"],
                highlight: false,
                buttonText: "CONTACT CLINICAL SALES",
                href: "/login",
                delay: 140,
              },
            ].map((plan) => (
              <BentoCard
                key={plan.name}
                className={`p-8 flex flex-col justify-between ${
                  plan.highlight 
                    ? "border-2 border-[#5B9BD5] bg-gradient-to-b from-[#F4F6F9] via-white to-white shadow-xl shadow-[#0B4F8C]/10" 
                    : "border border-[#0B4F8C]/15 bg-white shadow-sm hover:border-[#0B4F8C]/30"
                }`}
                delay={plan.delay}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-pixel text-[11px] tracking-widest text-[#0B4F8C] font-bold">{plan.name}</div>
                    {plan.highlight && (
                      <span className="px-2.5 py-1 rounded-full bg-[#5B9BD5]/15 text-[#5B9BD5] font-bold text-[10px] tracking-wider uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-light text-slate-900">{plan.price}</span>
                    {plan.period && <span className="text-slate-500 text-sm font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-slate-500 tracking-wide mb-6 min-h-[32px]">{plan.sub}</p>
                  
                  <div className="w-full h-px bg-slate-200 mb-6" />

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                        <div className="w-2 h-2 rounded-full bg-[#5B9BD5] mt-1.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href={plan.href}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 text-center block ${
                    plan.highlight
                      ? "bg-gradient-to-r from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] text-white shadow-md shadow-[#0B4F8C]/20 hover:shadow-lg hover:opacity-95"
                      : "bg-[#F4F6F9] border border-[#0B4F8C]/20 text-[#0B4F8C] hover:bg-[#0B4F8C] hover:text-white"
                  }`}
                >
                  {plan.buttonText}
                </a>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        {/* Glass panels image — anchored to bottom center */}
        <img
          src="/images/footer_new.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none"
          style={{ opacity: 0.85 }}
        />
        {/* Progressive blur from bottom — blends into site bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
        {/* Colour fade from bottom to site bg Ice Silver */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #F4F6F9 0%, rgba(244,246,249,0.95) 15%, transparent 60%)"
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="mb-4"><Tag>PREMIUM VERSION</Tag></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-6">
            {"Bring Enterprise AI\nto Every Hospital"}
          </h2>
          <p className="text-sm text-black/45 leading-relaxed mb-10 max-w-2xl mx-auto">
            Deploy clinically validated AI models, build hospital-owned intelligence, and transform medical imaging, laboratory diagnostics, and clinical workflows with ELVON&apos;s secure on-premise AI platform.
          </p>
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center items-center gap-4">
              <a
                href="/sign-up"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] text-white font-bold text-base shadow-xl shadow-[#0B4F8C]/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <span>✨ Hospital Sign Up Now</span>
                <span>→</span>
              </a>
              <a
                href="/login"
                className="px-8 py-4 rounded-2xl bg-[#F4F6F9] border-2 border-[#0B4F8C]/40 text-[#0B4F8C] hover:bg-[#5B9BD5]/20 font-bold text-base shadow-md transition-all duration-300"
              >
                🚀 Clinical Portal Login
              </a>
            </div>

            <div className="text-xs text-[#5B9BD5] font-semibold tracking-wider uppercase">— OR —</div>

            {!submitted ? (
              <form
                onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true) }}
                className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your hospital email for custom setup"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white border border-[#0B4F8C]/40 rounded-xl px-4 py-3.5 text-sm text-[#1E293B] placeholder:text-[#B3B9BD] focus:outline-none focus:border-[#0B4F8C] transition-colors shadow-sm"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-[#0B4F8C] to-[#5B9BD5] text-white text-sm rounded-xl hover:opacity-90 transition-colors tracking-widest font-bold shadow-md"
                >
                  SCHEDULE DEMO
                </button>
              </form>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-600/30 bg-emerald-50 text-emerald-800 font-semibold text-sm shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                {"Thank you! Our clinical AI engineering team will reach out to verify your credentials."}
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-14 px-6 md:px-12 lg:px-20 border-t border-[#0B4F8C]/15 bg-[#F4F6F9]/60">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Designer Logo Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B4F8C] via-[#5B9BD5] to-[#585E62] flex items-center justify-center shadow-md shadow-[#0B4F8C]/20">
              <span className="font-extrabold text-white tracking-tighter text-sm font-sans">E+</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.28em] text-sm text-[#1E293B] font-sans">ELVON</span>
              <span className="text-[9px] tracking-[0.16em] text-[#5B9BD5] font-bold -mt-1 uppercase">Medical AI Studio</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-x-12 gap-y-4">
            {/* Row 1 Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { label: "Platform",     href: "#platform" },
                { label: "AI Modules",   href: "#agents" },
                { label: "Workflow",     href: "#workflow" },
                { label: "Integrations", href: "#integrations" },
                { label: "Security",     href: "#security" },
                { label: "Pricing",      href: "#pricing" },
              ].map(l => (
                <a key={l.label} href={l.href} className="text-xs text-[#1E293B]/75 hover:text-[#0B4F8C] transition-colors tracking-wide font-semibold">{l.label}</a>
              ))}
            </div>

            {/* Row 2 Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { label: "Documentation", href: "#" },
                { label: "API Reference", href: "#" },
                { label: "Contact",       href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms",         href: "#" },
              ].map(l => (
                <a key={l.label} href={l.href} className="text-xs text-[#5B9BD5] hover:text-[#1E293B] transition-colors tracking-wide font-medium">{l.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#0B4F8C]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#5B9BD5] font-medium">© 2026 ELVON. Designer Medical AI Studio.</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0B4F8C] animate-pulse" />
            <span className="text-[11px] text-[#0B4F8C] font-semibold tracking-wider uppercase">On-Premise Clinical Enclave v2.4</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
