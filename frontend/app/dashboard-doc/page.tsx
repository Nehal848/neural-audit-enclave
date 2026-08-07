"use client"

import React from "react"
import DocLayout from "@/components/doc-layout"
import { 
  Wind, Brain, Heart, Activity, Bone, Star, Clock, 
  Target, Scan, Microscope, FlaskConical, Database, FileText,
  Box, Play, TrendingUp, BarChart2, CheckCircle2
} from "lucide-react"

export default function DocDashboardPage() {
  return (
    <DocLayout 
      title="Good Morning, CityCare Admin" 
      subtitle="Here's your clinical intelligence overview"
    >
      <div className="flex-1 w-full overflow-y-auto px-4 md:px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* ── ACTIVE & IN USE MODELS ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <h2 className="text-[16px] font-bold text-slate-900">Active & In Use Models</h2>
             <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700">View all models</button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {[
              { name: 'PneumoNet', ver: 'v2.4.1', date: '12 May 2025', acc: '95.6%', conf: '92.3%', icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50', chart: 'text-blue-500' },
              { name: 'BrainTumor AI', ver: 'v1.8.0', date: '10 May 2025', acc: '96.2%', conf: '94.1%', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', chart: 'text-purple-500' },
              { name: 'CardioRisk', ver: 'v3.1.0', date: '08 May 2025', acc: '93.7%', conf: '90.4%', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', chart: 'text-rose-500' },
              { name: 'DiabetesAI', ver: 'v2.2.3', date: '07 May 2025', acc: '94.8%', conf: '91.7%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', chart: 'text-emerald-500' },
              { name: 'BoneXpert', ver: 'v1.5.2', date: '06 May 2025', acc: '92.5%', conf: '89.6%', icon: Bone, color: 'text-amber-600', bg: 'bg-amber-50', chart: 'text-amber-500' },
            ].map((m, i) => (
              <div key={i} className="min-w-[280px] bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col shrink-0">
                <div className="flex gap-4 items-center mb-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${m.bg} ${m.color} shrink-0`}>
                    <m.icon size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">{m.name}</h3>
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">{m.ver}</div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-5">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">Accuracy</div>
                    <div className="text-[22px] font-bold text-slate-900 leading-none">{m.acc}</div>
                  </div>
                  <div className={`w-20 h-8 ${m.chart}`}>
                    <svg viewBox="0 0 100 30" fill="none" className="w-full h-full stroke-current" preserveAspectRatio="none">
                      <path d="M0,25 C20,20 40,30 50,15 C60,5 80,20 100,5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">Avg. Confidence</span>
                    <span className="font-bold text-slate-900">{m.conf}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">Version</span>
                    <span className="font-bold text-slate-900">{m.ver}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-500">Last Updated</span>
                    <span className="font-bold text-slate-900">{m.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MIDDLE GRID (3 COLUMNS) ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6 flex-1">
          
          {/* Recent Feedback */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
               <h3 className="text-[14px] font-bold text-slate-900">Recent Feedback from Doctors</h3>
               <button className="text-[11px] font-bold text-blue-600">View all</button>
            </div>
            <div className="space-y-5">
              {[
                { name: 'Dr. Ramesh Verma', model: 'PneumoNet (v2.4.1)', time: '2h ago', stars: 5, img: 'https://i.pravatar.cc/150?u=ramesh', text: 'Highly accurate in identifying early signs of pneumonia. Very reliable.' },
                { name: 'Dr. Priya Mehta', model: 'BrainTumor AI (v1.8.0)', time: '5h ago', stars: 4.5, img: 'https://i.pravatar.cc/150?u=priya', text: 'Great model performance. Helps in better and faster diagnosis.' },
                { name: 'Dr. Arjun Patel', model: 'CardioRisk (v3.1.0)', time: '1d ago', stars: 5, img: 'https://i.pravatar.cc/150?u=arjun', text: 'Excellent risk prediction. Very useful for patient assessments.' },
                { name: 'Dr. Neha Singh', model: 'DiabetesAI (v2.2.3)', time: '2d ago', stars: 4, img: 'https://i.pravatar.cc/150?u=neha', text: 'Good results overall. Can be improved for borderline cases.' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <img src={f.img} alt={f.name} className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-[12px] font-bold text-slate-900">{f.name}</div>
                        <div className="text-[10px] font-semibold text-blue-600">{f.model}</div>
                      </div>
                      <div className="flex gap-0.5 text-emerald-500">
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= Math.floor(f.stars) ? 'currentColor' : 'transparent'} strokeWidth={2} className={s > Math.floor(f.stars) && f.stars % 1 !== 0 ? 'opacity-50 fill-current' : ''} />)}
                        <span className="text-[10px] font-bold text-slate-700 ml-1 leading-none">{f.stars.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 leading-snug mb-1.5">{f.text}</p>
                    <div className="text-[9px] font-semibold text-slate-400 text-right">{f.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training (Ongoing) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
               <h3 className="text-[14px] font-bold text-slate-900">Training (Ongoing)</h3>
               <button className="text-[11px] font-bold text-blue-600">View all</button>
            </div>
            <div className="space-y-6">
              {[
                { name: 'LungCancerNet', data: 'Training on CT Scan Dataset', pct: 68, eta: '02:15:34', icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-600' },
                { name: 'LiverDisease AI', data: 'Training on Pathology Dataset', pct: 42, eta: '03:40:21', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500' },
                { name: 'KidneyAI', data: 'Training on Lab Dataset', pct: 25, eta: '05:10:11', icon: Database, color: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-500' },
                { name: 'SkinLesionNet', data: 'Training on Dermoscopy Dataset', pct: 78, eta: '01:25:18', icon: Scan, color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
                { name: 'ThyroidAI', data: 'Training on Ultrasound Dataset', pct: 33, eta: '04:05:32', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-500' },
              ].map((t, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className={`w-10 h-10 rounded-full ${t.bg} ${t.color} flex items-center justify-center shrink-0`}>
                    <t.icon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <div className="text-[12px] font-bold text-slate-900">{t.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">{t.data}</div>
                      </div>
                      <div className="text-[12px] font-bold text-slate-900">{t.pct}%</div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full mb-1.5 overflow-hidden">
                      <div className={`h-full ${t.bar} rounded-full`} style={{ width: `${t.pct}%` }}></div>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[9px] font-semibold text-slate-500">
                      <Clock size={10} /> ETA: {t.eta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
               <h3 className="text-[14px] font-bold text-slate-900">Integration Status</h3>
               <button className="text-[11px] font-bold text-blue-600">View all</button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'MRI System', icon: Target },
                { name: 'CT Scan System', icon: Scan },
                { name: 'X-Ray System', icon: Bone },
                { name: 'Pathology Lab', icon: Microscope },
                { name: 'Blood Lab', icon: FlaskConical },
                { name: 'PACS System', icon: Target },
                { name: 'EMR / EHR', icon: FileText },
                { name: 'ECG System', icon: Activity },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full border border-blue-100 bg-blue-50/50 flex items-center justify-center text-blue-600">
                       <s.icon size={14} />
                     </div>
                     <span className="text-[12px] font-bold text-slate-800">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]"></span> Connected
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── BOTTOM METRICS ROW ──────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4">
          
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
               <Box size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Total Models</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">12</div>
               <div className="text-[10px] font-bold text-emerald-600">Active</div>
             </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
               <Play size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Models In Use</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">8</div>
               <div className="text-[10px] font-bold text-emerald-600">Running</div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
               <TrendingUp size={18} />
             </div>
             <div className="flex-1">
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Avg. Model Accuracy</div>
               <div className="flex justify-between items-end">
                 <div className="text-[16px] font-bold text-slate-900 leading-none">94.6%</div>
                 <div className="w-12 h-4 text-blue-500">
                    <svg viewBox="0 0 100 30" fill="none" className="w-full h-full stroke-current" preserveAspectRatio="none">
                      <path d="M0,25 L20,15 L40,20 L60,10 L80,15 L100,5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="flex-1">
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Total Predictions</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">18,562</div>
               <div className="flex justify-between items-center">
                 <div className="text-[10px] font-medium text-slate-500">This Week</div>
                 <div className="flex items-end gap-0.5 h-3">
                   {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                     <div key={i} className="w-[3px] bg-blue-500 rounded-sm" style={{ height: `${h}%` }}></div>
                   ))}
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
               <Clock size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">Avg. Response Time</div>
               <div className="text-[16px] font-bold text-slate-900 leading-none">2.4 sec</div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
               <CheckCircle2 size={18} />
             </div>
             <div>
               <div className="text-[10px] font-semibold text-slate-500 mb-0.5">System Health</div>
               <div className="text-[11px] font-bold text-emerald-600 leading-tight">All Systems Operational</div>
             </div>
          </div>

        </div>

      </div>
    </DocLayout>
  )
}
