import React from 'react';
import { useApp } from '../context/AppContext';

export default function HomeHub() {
  const { setActiveTab, telemetry, detections, anomalies } = useApp();

  return (
    <div className="flex-1 w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 pb-8 pt-4 flex flex-col justify-end home-hub-page">
      {/* 2-Column Command Center Grid: Left Brand & Hardware Hub, Right Module Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center w-full mt-auto mb-2">
        
        {/* Left Column: Brand Hero & Device Status Anchor (Spans 4 to 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center text-left space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider w-fit shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Edge AI &amp; Biosensing Core</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black font-inter text-white lg:text-slate-900 tracking-tight leading-[1.08] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] lg:drop-shadow-none">
              Narco Nose
            </h1>
            
            <p className="text-base sm:text-lg text-slate-100 lg:text-slate-600 font-normal leading-relaxed max-w-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] lg:drop-shadow-none">
              Real-Time Chemical Threat Proxy Detection &amp; Edge Machine Learning Interface. Multi-gas proxy fusion with automated OpenCV threat photo capture and GPS tracking.
            </p>
          </div>

          {/* Quiet Baseline Device Status Card */}
          <div className="bg-surface-container-lowest squircle-card p-5 border border-outline-variant/30 space-y-3.5 shadow-xs max-w-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${telemetry.hardware_online ? 'bg-emerald-500' : 'bg-amber-500'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${telemetry.hardware_online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className="font-extrabold text-sm text-on-surface">Raspberry Pi 5 Hub</span>
              </div>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                telemetry.hardware_online
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {telemetry.hardware_online ? 'LIVE HARDWARE' : 'SIMULATION MODE'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-secondary pt-2 border-t border-surface-container/60">
              <span className={telemetry.hardware_online ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                {telemetry.hardware_online ? 'Real MQTT Telemetry' : 'Mock Physics Engine'}
              </span>
              <span>•</span>
              <span>{telemetry.temp || 24}°C Sensor Temp</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">Nominal Base</span>
            </div>
          </div>
        </div>

        {/* Right Column: 5 Interactive Navigation Cards in Balanced Bento Grid (Spans 7 to 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5 sm:gap-6 w-full">
          {/* Row 1: 2 Flagship Modules (Sensor Data & Optical Evidence) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Card 1: Sensor Data */}
            <button
              onClick={() => setActiveTab('sensors')}
              aria-label="Open Sensor Data module"
              className="squircle-card hover-pop-teal bg-surface-container-lowest w-full min-h-[220px] sm:min-h-[240px] flex flex-col justify-between p-6 sm:p-7 text-left group cursor-pointer active:scale-98 relative shadow-xs"
            >
              <div className="flex justify-between items-start w-full">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">graphic_eq</span>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {telemetry.mq2} ppm
                </span>
              </div>

              <div className="my-2">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">
                  Sensor Data
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                  Real-time MQ-2, MQ-3, MQ-135 &amp; DHT11 environmental telemetry
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-primary pt-2 border-t border-surface-container/60">
                <span>Open Telemetry Suite</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
              </div>
            </button>

            {/* Card 2: Optical Evidence (OpenCV) */}
            <button
              onClick={() => setActiveTab('camera')}
              aria-label="Open Optical Threat Evidence"
              className="squircle-card hover-pop-blue bg-surface-container-lowest w-full min-h-[220px] sm:min-h-[240px] flex flex-col justify-between p-6 sm:p-7 text-left group cursor-pointer active:scale-98 relative shadow-xs"
            >
              <div className="flex justify-between items-start w-full">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  EVIDENCE CAM
                </span>
              </div>

              <div className="my-2">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-tertiary transition-colors tracking-tight">
                  Optical Evidence
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                  OpenCV incident photo verification &amp; GPS location mapping
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-tertiary pt-2 border-t border-surface-container/60">
                <span>View Threat Photos &amp; Map</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
              </div>
            </button>
          </div>

          {/* Row 2: 2 Management Modules (History & Settings) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Card 3: History */}
            <button
              onClick={() => setActiveTab('history')}
              aria-label="View History and logs"
              className="squircle-card edge-light-purple bg-surface-container-lowest w-full min-h-[190px] sm:min-h-[200px] flex flex-col justify-between p-5 text-left group cursor-pointer active:scale-98 relative shadow-xs"
            >
              <div className="flex justify-between items-start w-full relative z-[2]">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">history</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-secondary border border-outline-variant/30">
                  {anomalies.length} events
                </span>
              </div>

              <div className="my-1 relative z-[2]">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors tracking-tight">
                  History
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Event archive &amp; snapshots
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 pt-1.5 border-t border-surface-container/60 relative z-[2]">
                <span>Query SQLite</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>

            {/* Card 4: Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              aria-label="Configure Settings"
              className="squircle-card edge-light-amber bg-surface-container-lowest w-full min-h-[190px] sm:min-h-[200px] flex flex-col justify-between p-5 text-left group cursor-pointer active:scale-98 relative shadow-xs"
            >
              <div className="flex justify-between items-start w-full relative z-[2]">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-secondary border border-outline-variant/30">
                  MQTT Gateway
                </span>
              </div>

              <div className="my-1 relative z-[2]">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors tracking-tight">
                  Settings
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  MQTT broker &amp; Pi 5 link
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 pt-1.5 border-t border-surface-container/60 relative z-[2]">
                <span>Configure Broker</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
