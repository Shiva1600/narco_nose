import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SystemDiagnostics() {
  const { diagnostics, telemetry, connected, setActiveTab } = useApp();
  const [sensorsHealth, setSensorsHealth] = useState(diagnostics.sensorHealth || {});

  const toggleSensorSim = (key) => {
    setSensorsHealth(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        online: !prev[key]?.online,
        status: prev[key]?.online ? 'Offline (Fault)' : 'Nominal'
      }
    }));
  };

  const uptimeDays = Math.floor(diagnostics.uptimeSeconds / 86400);
  const uptimeHours = Math.floor((diagnostics.uptimeSeconds % 86400) / 3600);
  const uptimeMinutes = Math.floor((diagnostics.uptimeSeconds % 3600) / 60);

  // SVG Circular Gauge calculations
  const cpuPercent = Math.min(100, Math.round(diagnostics.cpuUsage || 25));
  const ramPercent = Math.min(100, Math.round(diagnostics.ramUsage || 44));
  const tempC = +(diagnostics.tempC || 48.2).toFixed(1);
  const tempPercent = Math.min(100, Math.round((tempC / 85) * 100));

  const strokeDash = 238.7;
  const cpuOffset = strokeDash - (strokeDash * cpuPercent) / 100;
  const ramOffset = strokeDash - (strokeDash * ramPercent) / 100;
  const tempOffset = strokeDash - (strokeDash * tempPercent) / 100;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Sub-header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-2">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-lowest border-2 border-outline-variant/50 text-slate-800 hover:text-primary hover:border-primary/50 text-base font-bold transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span>Back to Home</span>
          </button>
        </div>

        <div className="flex flex-col md:items-center text-left md:text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display-hero">
            System Diagnostics
          </h1>
          <div className="mt-2 inline-flex items-center gap-2.5 px-4 py-1.5 bg-surface-container-lowest rounded-full text-slate-800 text-xs sm:text-sm font-semibold border border-outline-variant/40 shadow-sm">
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`} />
              Raspberry Pi 5 (8GB)
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              Node SN-9021-TX
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="text-slate-700 font-medium">
              Uptime: {uptimeDays}d {uptimeHours}h {uptimeMinutes}m
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-secondary bg-surface-container-lowest px-3 py-1.5 rounded-full border border-outline-variant/40">
            MQTT Latency: <strong>4.2 ms</strong>
          </span>
        </div>
      </div>

      {/* 1. Top Row: Hardware Health (3 Uniform Squircle Gauge Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: CPU Usage */}
        <div className="squircle-card bg-surface-container-lowest p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-2xl">memory</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">CPU Usage</h3>
                  <p className="text-xs font-semibold text-slate-600">Broadcom BCM2712</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200">
                4 Cores @ 2.4GHz
              </span>
            </div>

            {/* Gauge Visualization */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#00685f"
                    strokeDasharray={strokeDash}
                    strokeDashoffset={cpuOffset}
                    strokeLinecap="round"
                    strokeWidth="10"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-950">{cpuPercent}%</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-800 mt-0.5">
                    Active Load
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold">Governor:</span>
              <span className="font-extrabold text-emerald-700">ondemand</span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Load: 1.12 / 0.95
            </span>
          </div>
        </div>

        {/* Card 2: RAM Usage */}
        <div className="squircle-card bg-surface-container-lowest p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-tertiary shadow-sm">
                  <span className="material-symbols-outlined text-2xl">storage</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">RAM Usage</h3>
                  <p className="text-xs font-semibold text-slate-600">LPDDR4X-4267</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 text-tertiary border border-blue-200">
                8.0 GB Physical
              </span>
            </div>

            {/* Gauge Visualization */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#007bb9"
                    strokeDasharray={strokeDash}
                    strokeDashoffset={ramOffset}
                    strokeLinecap="round"
                    strokeWidth="10"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-950">{ramPercent}%</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-tertiary mt-0.5">
                    Allocated
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-bold">Used:</span>
              <span className="font-mono font-bold">{(8 * (ramPercent / 100)).toFixed(1)} GB / 8 GB</span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Swap: 0% Free
            </span>
          </div>
        </div>

        {/* Card 3: Core Temperature */}
        <div className="squircle-card bg-surface-container-lowest p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">device_thermostat</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">SoC Core Temp</h3>
                  <p className="text-xs font-semibold text-slate-600">VideoCore VII / A76</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-orange-50 text-orange-800 border border-orange-200">
                Safe &lt; 80°C
              </span>
            </div>

            {/* Gauge Visualization */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke={tempC > 65 ? '#ba1a1a' : '#00685f'}
                    strokeDasharray={strokeDash}
                    strokeDashoffset={tempOffset}
                    strokeLinecap="round"
                    strokeWidth="10"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-950">{tempC}°C</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary mt-0.5">
                    Die Temp
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className={`w-2 h-2 rounded-full ${diagnostics.fanRpm > 0 ? 'bg-teal-500 animate-spin' : 'bg-slate-400'}`} />
              <span className="font-bold">Chamber Fan:</span>
              <span className="font-mono font-bold text-teal-700">{diagnostics.fanRpm} RPM</span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Throttle: 0x0
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sensor Module Health & I/O Status Matrix */}
      <div className="squircle-card bg-surface-container-lowest p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Hardware Bus &amp; Sensor I/O Matrix
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Active polling of I2C devices, ADS1115 ADC converter, UART GPS, and USB video stream
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full w-fit">
            All 7 Physical Modules Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* MQ-2 */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">MQ-2 Combustible Gas</span>
                <span className="text-[11px] text-secondary font-mono">Analog / AIN0 (ADS1115)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">Voltage:</span>
              <span className="font-bold text-on-surface">1.12 V</span>
            </div>
          </div>

          {/* MQ-3 */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">MQ-3 Alcohol / Vapors</span>
                <span className="text-[11px] text-secondary font-mono">Analog / AIN1 (ADS1115)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">Voltage:</span>
              <span className="font-bold text-on-surface">0.98 V</span>
            </div>
          </div>

          {/* MQ-135 */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">MQ-135 Air Quality / NH3</span>
                <span className="text-[11px] text-secondary font-mono">Analog / AIN2 (ADS1115)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">Voltage:</span>
              <span className="font-bold text-on-surface">1.25 V</span>
            </div>
          </div>

          {/* DHT22 */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">DHT22 Temp &amp; Humidity</span>
                <span className="text-[11px] text-secondary font-mono">GPIO 4 / Single-Bus</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">Sampling:</span>
              <span className="font-bold text-on-surface">0.5 Hz (Nominal)</span>
            </div>
          </div>

          {/* NEO-6M GPS */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">NEO-6M GPS Module</span>
                <span className="text-[11px] text-secondary font-mono">UART / /dev/ttyAMA0</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                3D Fix
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">NMEA Baud:</span>
              <span className="font-bold text-on-surface">9600 bps</span>
            </div>
          </div>

          {/* Camera */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">Sony IMX708 Camera</span>
                <span className="text-[11px] text-secondary font-mono">CSI / MIPI 2-Lane</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Streaming
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">Framerate:</span>
              <span className="font-bold text-primary">29.8 FPS</span>
            </div>
          </div>

          {/* ADS1115 */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">ADS1115 16-Bit ADC</span>
                <span className="text-[11px] text-secondary font-mono">I2C / 0x48</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Ready
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">Data Rate:</span>
              <span className="font-bold text-on-surface">860 SPS</span>
            </div>
          </div>

          {/* MicroSD Storage */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-900 block">SanDisk Extreme 64GB</span>
                <span className="text-[11px] text-secondary font-mono">eMMC / mmcblk0</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Nominal
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/20 font-mono">
              <span className="text-secondary">Free Space:</span>
              <span className="font-bold text-on-surface">{diagnostics.diskFreeGB} GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
