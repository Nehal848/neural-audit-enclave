import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FCFDFE] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        {/* Inner pulsing logo */}
        <div className="absolute w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center animate-pulse">
           <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3L35 11.6603V28.9808L20 37.641L5 28.9808V11.6603L20 3Z" fill="#334155" />
              <path d="M20 3L35 11.6603L20 20.3205L5 11.6603L20 3Z" fill="#94A3B8" />
              <path d="M5 11.6603L20 20.3205V37.641L5 28.9808V11.6603Z" fill="#64748B" />
              <path d="M35 11.6603L20 20.3205V37.641L35 28.9808V11.6603Z" fill="#1E293B" />
              <circle cx="20" cy="20.3205" r="5" fill="#FCFDFE" />
            </svg>
        </div>
      </div>
      <h2 className="mt-6 text-[15px] font-bold text-slate-800 tracking-tight">Initializing Enclave...</h2>
      <p className="text-[12px] text-slate-500 font-medium mt-2">Connecting to zero-leakage data environment</p>
    </div>
  );
}
