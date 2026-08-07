"use client"

import React from "react"
import DocLayout from "@/components/doc-layout"
import { 
  Settings, Users, Box, Link as LinkIcon, Shield, Bell, 
  Database, Award, Paintbrush, Info, Building2, Monitor, 
  Brain, Lock, Headphones, RefreshCw, MessageSquare, 
  ChevronDown, ArrowRight, Server, ShieldCheck
} from "lucide-react"

export default function SettingsPage() {
  return (
    <DocLayout 
      title="Good Morning, Dr. Ananya" 
      subtitle="Manage your platform settings and preferences"
      searchPlaceholder="Search models, systems, settings..."
    >
      <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 custom-scrollbar">
        
        {/* ── HEADER & TABS ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 pb-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h2 className="text-[20px] font-bold text-slate-900 mb-1">Settings</h2>
            <p className="text-[13px] font-medium text-slate-500">Configure and manage all aspects of the platform</p>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
            {[
              { name: 'General', icon: Settings, active: true },
              { name: 'Users & Roles', icon: Users, active: false },
              { name: 'AI Model Settings', icon: Box, active: false },
              { name: 'Integration', icon: LinkIcon, active: false },
              { name: 'Security', icon: Shield, active: false },
              { name: 'Notifications', icon: Bell, active: false },
              { name: 'Backup & Storage', icon: Database, active: false },
              { name: 'Licensing', icon: Award, active: false },
              { name: 'Appearance', icon: Paintbrush, active: false },
              { name: 'About', icon: Info, active: false },
            ].map((tab, i) => (
              <button key={i} className={`flex items-center gap-2 pb-4 border-b-2 whitespace-nowrap transition-colors ${tab.active ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 font-semibold hover:text-slate-800'}`}>
                <tab.icon size={16} strokeWidth={tab.active ? 2.5 : 2} /> <span className="text-[13px]">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── SETTINGS GRID ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6 flex-1">
          
          {/* Row 1, Col 1: Organization Settings */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 size={16} strokeWidth={2} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Organization Settings</h3>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Organization Name</label>
                <input type="text" defaultValue="Elvon Clinical Intelligence" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors bg-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Hospital / Institute Name</label>
                <input type="text" defaultValue="CityCare Advanced Imaging Center" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Language</label>
                <div className="relative">
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>English (US)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Date Format</label>
                <div className="relative">
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>12 May 2025 (DD MMM YYYY)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Time Zone</label>
                <div className="relative">
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>(GMT+05:30) Asia/Kolkata</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Time Format</label>
                <div className="relative">
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>10:30 AM (12 Hour)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm">Save Changes</button>
            </div>
          </div>

          {/* Row 1, Col 2: System Preferences */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Monitor size={16} strokeWidth={2} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">System Preferences</h3>
            </div>
            <div className="flex-1 flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[12px] font-bold text-slate-900 mb-0.5">Auto Update Platform</div>
                  <div className="text-[11px] font-medium text-slate-500">Automatically install new updates</div>
                </div>
                <div className="w-9 h-5 bg-blue-600 rounded-full flex items-center p-0.5 shadow-inner shrink-0 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-4"></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[12px] font-bold text-slate-900 mb-0.5">Enable Audit Logs</div>
                  <div className="text-[11px] font-medium text-slate-500">Track all system activities</div>
                </div>
                <div className="w-9 h-5 bg-blue-600 rounded-full flex items-center p-0.5 shadow-inner shrink-0 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-4"></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <label className="text-[12px] font-bold text-slate-900">Default Landing Page</label>
                <div className="relative w-[140px]">
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>Dashboard</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-slate-900">Items per page</label>
                <div className="relative w-[140px]">
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>10</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm">Save Changes</button>
            </div>
          </div>

          {/* Row 1, Col 3: System Information */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Info size={16} strokeWidth={2} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">System Information</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              {[
                { label: 'Platform Version', val: 'v2.4.1' },
                { label: 'AI Engine Version', val: 'v2.4.1' },
                { label: 'API Version', val: 'v1.8.0' },
                { label: 'Database Version', val: 'PostgreSQL 14.6' },
                { label: 'Last Updated', val: '12 May 2025, 10:30 AM' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[12px]">
                  <span className="font-medium text-slate-500">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-medium text-slate-500">System Uptime</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 15d 6h 24m</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button className="flex items-center gap-2 border border-blue-200 text-blue-600 bg-white px-6 py-2.5 rounded-xl text-[12px] font-bold hover:bg-blue-50 transition-colors shadow-sm w-full justify-center">
                <RefreshCw size={14} /> Check for Updates
              </button>
            </div>
          </div>

          {/* Row 2, Col 1: Default Prediction Settings */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Brain size={16} strokeWidth={2} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Default Prediction Settings</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-slate-900">Default Model</label>
                <div className="relative w-[180px]">
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>LungCancerNet v2.4.1</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[12px] font-bold text-slate-900">Confidence Threshold</label>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-lg px-2 py-1 text-[12px] font-bold text-blue-600">90%</div>
                </div>
                <div className="relative w-full h-1.5 bg-slate-100 rounded-full mb-2">
                  <div className="absolute left-0 top-0 h-full bg-blue-600 rounded-full" style={{ width: '90%' }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow cursor-pointer" style={{ left: '90%', transform: 'translate(-50%, -50%)' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-1">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex justify-between items-start mt-2">
                <div>
                  <div className="text-[12px] font-bold text-slate-900 mb-0.5">Auto Reject if below threshold</div>
                  <div className="text-[11px] font-medium text-slate-500">Predictions below threshold will be marked as low confidence</div>
                </div>
                <div className="w-9 h-5 bg-blue-600 rounded-full flex items-center p-0.5 shadow-inner shrink-0 cursor-pointer mt-0.5">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-4"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm">Save Changes</button>
            </div>
          </div>

          {/* Row 2, Col 2: Data & Privacy */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Lock size={16} strokeWidth={2} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Data & Privacy</h3>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-slate-900">Data Retention Period</label>
                <div className="relative w-[140px]">
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 transition-colors bg-white">
                    <option>5 Years</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[12px] font-bold text-slate-900 mb-0.5">Anonymize Patient Data</div>
                  <div className="text-[11px] font-medium text-slate-500">Remove patient identifiers</div>
                </div>
                <div className="w-9 h-5 bg-blue-600 rounded-full flex items-center p-0.5 shadow-inner shrink-0 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-4"></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[12px] font-bold text-slate-900 mb-0.5">Allow Data Export</div>
                  <div className="text-[11px] font-medium text-slate-500">Enable data export for reports</div>
                </div>
                <div className="w-9 h-5 bg-blue-600 rounded-full flex items-center p-0.5 shadow-inner shrink-0 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-4"></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[12px] font-bold text-slate-900 mb-0.5">Share Usage Analytics</div>
                  <div className="text-[11px] font-medium text-slate-500">Help improve platform performance</div>
                </div>
                <div className="w-9 h-5 bg-slate-200 rounded-full flex items-center p-0.5 shadow-inner shrink-0 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm">Save Changes</button>
            </div>
          </div>

          {/* Row 2, Col 3: Support & Maintenance */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Headphones size={16} strokeWidth={2} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Support & Maintenance</h3>
            </div>

            <div className="flex-1 flex flex-col gap-5">
              {[
                { label: 'Support Email', val: 'support@elvon.ai', link: true },
                { label: 'Support Phone', val: '+91 1800 123 4567', link: true },
                { label: 'Support Hours', val: '24/7' },
                { label: 'Maintenance Window', val: 'Sunday 02:00 AM - 04:00 AM IST' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-start text-[12px]">
                  <span className="font-medium text-slate-500 shrink-0">{item.label}</span>
                  <span className={`font-bold text-right ${item.link ? 'text-blue-600 hover:underline cursor-pointer' : 'text-slate-900'}`}>{item.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button className="flex items-center gap-2 border border-blue-200 text-blue-600 bg-white px-6 py-2.5 rounded-xl text-[12px] font-bold hover:bg-blue-50 transition-colors shadow-sm w-full justify-center">
                <MessageSquare size={14} /> Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM FOOTER ROW ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center justify-between">
          
          <div className="flex items-center gap-4 px-6 border-r border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5">Active Users</div>
              <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">24</div>
              <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">View all users <ArrowRight size={10} /></button>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
              <Box size={18} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5">Models Deployed</div>
              <div className="text-[16px] font-bold text-slate-900 leading-none mb-1">10</div>
              <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">View all models <ArrowRight size={10} /></button>
            </div>
          </div>

          <div className="mx-4 flex-1 h-[60px] bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl flex items-center justify-center text-white gap-3 shadow-sm px-6 max-w-[200px]">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
               <ShieldCheck size={20} strokeWidth={2} />
             </div>
             <div className="text-[12px] font-bold leading-tight">ON-PREMISE<br/>SECURE</div>
          </div>

          <div className="flex items-center gap-4 px-6 border-r border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
              <Server size={18} />
            </div>
            <div className="w-[160px]">
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5">Storage Used</div>
              <div className="flex items-end justify-between mb-1.5">
                <div className="text-[14px] font-bold text-slate-900 leading-none">1.24 TB / 5 TB</div>
                <div className="text-[10px] font-bold text-slate-500">24.8%</div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '24.8%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pl-6 pr-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
              <Award size={18} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5">License Status</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-[14px] font-bold text-slate-900 leading-none">Enterprise Plan</div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Active</span>
              </div>
              <div className="text-[10px] font-medium text-slate-500">Valid till 12 May 2026</div>
            </div>
          </div>

        </div>

      </div>
    </DocLayout>
  )
}
