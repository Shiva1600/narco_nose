import React from 'react';
import { useApp } from '../context/AppContext';

export default function HomeHub() {
  const { setActiveTab, telemetry, diagnostics, detections, anomalies, actuators } = useApp();

  const isThreat = telemetry.threat_level === 'THREAT';
  const isWarning = telemetry.threat_level === 'WARNING';

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 pt-3 md:pt-4 pb-8 md:pb-10 flex flex-col justify-start">
      {/* Center Header Anchor */}
      <div className="text-center max-w-4xl mx-auto mb-6 md:mb-8">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-inter text-slate-900 tracking-tight mb-2">
          Narco Nose
        </h1>
        <p className="text-lg sm:text-xl font-normal text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Real-Time Chemical Threat Proxy Detection & Edge Machine Learning Interface
        </p>
      </div>

      {/* Main Navigation Grid: Centered Squircle Cards */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 md:gap-6 items-center">
        {/* Row 1: Exactly 3 Equal-Sized Squircle Cards Centered */}
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6 w-full">
          {/* Card 1: Sensor Data */}
          <button
            onClick={() => setActiveTab('sensors')}
            aria-label="Open Sensor Data module"
            className="squircle-card hover-pop-teal bg-surface-container-lowest w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center p-6 sm:p-7 text-center group cursor-pointer active:scale-95 relative"
          >
            {/* Live Indicator Pill */}
            <span className="absolute top-4 right-4 text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-primary border border-outline-variant/30">
              {telemetry.mq2} ppm
            </span>
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface group-hover:text-primary group-hover:bg-primary/15 transition-all duration-200 mb-3 sm:mb-4 group-hover:scale-110">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px]">graphic_eq</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">
              Sensor Data
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Real-time MQ &amp; DHT readouts
            </span>
          </button>

          {/* Card 2: Camera YOLO */}
          <button
            onClick={() => setActiveTab('camera')}
            aria-label="Open Camera YOLO detection"
            className="squircle-card hover-pop-blue bg-surface-container-lowest w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center p-6 sm:p-7 text-center group cursor-pointer active:scale-95 relative"
          >
            {/* Live Indicator Pill */}
            <span className="absolute top-4 right-4 text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-tertiary border border-outline-variant/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              LIVE
            </span>
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface group-hover:text-tertiary group-hover:bg-tertiary/15 transition-all duration-200 mb-3 sm:mb-4 group-hover:scale-110">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px]">center_focus_strong</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-tertiary transition-colors tracking-tight">
              Camera YOLO
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Vision proxy &amp; GPS trail
            </span>
          </button>

          {/* Card 3: History */}
          <button
            onClick={() => setActiveTab('history')}
            aria-label="View History and logs"
            className="squircle-card hover-pop-purple bg-surface-container-lowest w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center p-6 sm:p-7 text-center group cursor-pointer active:scale-95 relative"
          >
            <span className="absolute top-4 right-4 text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-secondary border border-outline-variant/30">
              {anomalies.length} events
            </span>
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface group-hover:text-purple-700 group-hover:bg-purple-100 transition-all duration-200 mb-3 sm:mb-4 group-hover:scale-110">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px]">history</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors tracking-tight">
              History
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Event archive &amp; snapshots
            </span>
          </button>
        </div>

        {/* Row 2: Exactly 2 Equal-Sized Squircle Cards Centered */}
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6 w-full">
          {/* Card 4: System Diagnostics */}
          <button
            onClick={() => setActiveTab('diagnostics')}
            aria-label="Run System Diagnostics"
            className="squircle-card hover-pop-teal bg-surface-container-lowest w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center p-6 sm:p-7 text-center group cursor-pointer active:scale-95 relative"
          >
            <span className="absolute top-4 right-4 text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-primary border border-outline-variant/30">
              {diagnostics.tempC}°C
            </span>
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface group-hover:text-primary group-hover:bg-primary/15 transition-all duration-200 mb-3 sm:mb-4 group-hover:scale-110">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px]">memory</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">
              System Diagnostics
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Hardware health &amp; telemetry
            </span>
          </button>

          {/* Card 5: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            aria-label="Configure Settings"
            className="squircle-card hover-pop-amber bg-surface-container-lowest w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center p-6 sm:p-7 text-center group cursor-pointer active:scale-95 relative"
          >
            <span className="absolute top-4 right-4 text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-secondary border border-outline-variant/30">
              I/O Ready
            </span>
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface group-hover:text-amber-700 group-hover:bg-amber-100 transition-all duration-200 mb-3 sm:mb-4 group-hover:scale-110">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px]">tune</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors tracking-tight">
              Settings
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Actuators, ML &amp; MQTT
            </span>
          </button>
        </div>
      </div>

      {/* Quiet Baseline Device Status Pill */}
      <div className="mt-8 sm:mt-10 text-center">
        <div className="inline-flex items-center gap-3.5 px-6 py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-sm font-medium text-secondary shadow-sm">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="font-bold text-on-surface">Raspberry Pi 5 Hub (Node SN-9021-TX)</span>
          <span className="text-outline-variant">|</span>
          <span className="text-primary font-bold">100% Sensors Active</span>
        </div>
      </div>
    </div>
  );
}
