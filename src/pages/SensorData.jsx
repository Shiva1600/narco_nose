import React from 'react';
import { useApp } from '../context/AppContext';
import { Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

export default function SensorData() {
  const {
    telemetry,
    telemetryStream,
    sensorViewMode,
    setSensorViewMode,
    calibrate,
    triggerScenario
  } = useApp();

  const isThreat = telemetry.threat_level === 'THREAT';
  const isWarning = telemetry.threat_level === 'WARNING';

  // Rolling Multi-Line Chart Data
  const lineLabels = telemetryStream.map((t, idx) => t.timeLabel || `#${idx}`);
  const multiLineData = {
    labels: lineLabels.length ? lineLabels : ['00:00:00'],
    datasets: [
      {
        label: 'MQ-2 (Smoke / LPG)',
        data: telemetryStream.map(t => t.mq2),
        borderColor: '#008378',
        backgroundColor: 'rgba(0, 131, 120, 0.1)',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 2
      },
      {
        label: 'MQ-3 (Alcohol / Vapors)',
        data: telemetryStream.map(t => t.mq3),
        borderColor: '#ba1a1a',
        backgroundColor: 'rgba(186, 26, 26, 0.1)',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 2
      },
      {
        label: 'MQ-135 (Air Quality / NH3)',
        data: telemetryStream.map(t => t.mq135),
        borderColor: '#007bb9',
        backgroundColor: 'rgba(0, 123, 185, 0.1)',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 2
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 12 },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(25, 28, 30, 0.9)',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#565e74' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 10 }, color: '#565e74', maxTicksLimit: 8 }
      }
    }
  };

  // 5-Axis Threat Radar Chart Data
  const radarData = {
    labels: [
      'MQ-2 (Combustion)',
      'MQ-3 (Vapors/Alcohol)',
      'MQ-135 (Toxics/NH3)',
      'Thermal Drift',
      'Relative Humidity'
    ],
    datasets: [
      {
        label: 'Live Real-Time Signature',
        data: [
          Math.min(100, Math.round((telemetry.mq2 / 800) * 100)),
          Math.min(100, Math.round((telemetry.mq3 / 800) * 100)),
          Math.min(100, Math.round((telemetry.mq135 / 700) * 100)),
          Math.min(100, Math.round((telemetry.temp / 40) * 100)),
          Math.min(100, Math.round(telemetry.humidity))
        ],
        backgroundColor: isThreat ? 'rgba(186, 26, 26, 0.25)' : 'rgba(0, 104, 95, 0.2)',
        borderColor: isThreat ? '#ba1a1a' : '#00685f',
        borderWidth: 2.5,
        pointBackgroundColor: isThreat ? '#ba1a1a' : '#00685f',
        pointRadius: 4
      },
      {
        label: 'Clean Air Calibration Baseline',
        data: [25, 22, 28, 35, 45],
        backgroundColor: 'rgba(86, 94, 116, 0.08)',
        borderColor: '#94a3b8',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 2
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 11 },
          usePointStyle: true
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: 'rgba(226, 232, 240, 0.8)' },
        angleLines: { color: 'rgba(226, 232, 240, 0.8)' },
        pointLabels: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '700' },
          color: '#191c1e'
        }
      }
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1720px] mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col gap-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">sensors</span>
            <span>Biosensor Telemetry Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-inter text-slate-900 tracking-tight">
            Sensor Data Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Button: Simple vs Advanced */}
          <div className="bg-surface-container p-1 rounded-full flex items-center border border-outline-variant/30 shadow-sm">
            <button
              onClick={() => setSensorViewMode('simple')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                sensorViewMode === 'simple'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>Simple Info</span>
            </button>
            <button
              onClick={() => setSensorViewMode('advanced')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                sensorViewMode === 'advanced'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">analytics</span>
              <span>Advanced Infos</span>
            </button>
          </div>

          <button
            onClick={calibrate}
            className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">auto_fix_high</span>
            <span className="hidden sm:inline">Calibrate / Tare</span>
          </button>
        </div>
      </div>

      {/* Dynamic System Status Banner based on ML confidence */}
      <div
        className={`w-full p-5 sm:p-6 squircle-card border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${
          isThreat
            ? 'bg-rose-50 border-rose-300 shadow-md ring-1 ring-rose-300'
            : isWarning
            ? 'bg-amber-50 border-amber-300 shadow-md'
            : 'bg-teal-50/60 border-teal-200 shadow-sm'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isThreat
                ? 'bg-rose-600 text-white animate-pulse'
                : isWarning
                ? 'bg-amber-500 text-white'
                : 'bg-primary text-white'
            }`}
          >
            <span className="material-symbols-outlined text-3xl">
              {isThreat ? 'dangerous' : isWarning ? 'warning' : 'verified_user'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                ML Real-Time Classification
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase ${
                  isThreat
                    ? 'bg-rose-200 text-rose-900'
                    : isWarning
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-teal-100 text-teal-900'
                }`}
              >
                {telemetry.threat_level}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-on-surface mt-0.5">
              {isThreat
                ? 'Chemical Threat Detected — Active Plume Warning'
                : isWarning
                ? 'Elevated Gas Concentration — Monitoring Deviation'
                : 'Atmospheric Proxy Baseline — Clean Air Conditions'}
            </h2>
            <p className="text-sm text-secondary mt-1">
              ML Inference Confidence:{' '}
              <strong className="text-on-surface">{telemetry.ml_confidence}%</strong> | Multi-sensor
              fusion vector: MQ-2 ({telemetry.mq2} ppm), MQ-3 ({telemetry.mq3} ppm), MQ-135 ({telemetry.mq135} ppm).
            </p>
          </div>
        </div>

        {/* Threat Level Gauge Bar */}
        <div className="w-full md:w-64 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 flex flex-col gap-1.5 shrink-0">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-secondary">Threat Index</span>
            <span className={isThreat ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-primary'}>
              {isThreat ? 'CRITICAL (95%)' : isWarning ? 'ELEVATED (72%)' : 'NOMINAL (18%)'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isThreat ? 'bg-rose-600 w-11/12' : isWarning ? 'bg-amber-500 w-3/5' : 'bg-primary w-1/5'
              }`}
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SIMPLE INFO */}
      {sensorViewMode === 'simple' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
            {/* Card: MQ-2 Combustible Gas & Smoke */}
            <div className="squircle-card hover-pop-teal bg-surface-container-lowest p-5 flex flex-col justify-between cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Combustible / Smoke
                  </span>
                  <h3 className="text-lg font-extrabold text-on-surface mt-0.5">MQ-2 Sensor</h3>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">propane</span>
                </div>
              </div>

              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                  {telemetry.mq2} <span className="text-sm font-bold text-secondary">ppm</span>
                </div>
                <div className="text-xs text-secondary mt-1 flex items-center gap-1">
                  <span>Threshold: 420</span>
                  <span>•</span>
                  <span className={telemetry.mq2 > 420 ? 'text-rose-600 font-bold' : 'text-primary font-medium'}>
                    {telemetry.mq2 > 420 ? 'SPIKE' : 'Nominal'}
                  </span>
                </div>
              </div>

              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    telemetry.mq2 > 420 ? 'bg-rose-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, (telemetry.mq2 / 800) * 100)}%` }}
                />
              </div>
            </div>

            {/* Card: MQ-3 Alcohol & Organic Vapors */}
            <div className="squircle-card hover-pop-rose bg-surface-container-lowest p-5 flex flex-col justify-between cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Alcohol / Vapors
                  </span>
                  <h3 className="text-lg font-extrabold text-on-surface mt-0.5">MQ-3 Sensor</h3>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <span className="material-symbols-outlined text-xl">local_fire_department</span>
                </div>
              </div>

              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                  {telemetry.mq3} <span className="text-sm font-bold text-secondary">ppm</span>
                </div>
                <div className="text-xs text-secondary mt-1 flex items-center gap-1">
                  <span>Threshold: 380</span>
                  <span>•</span>
                  <span className={telemetry.mq3 > 380 ? 'text-rose-600 font-bold' : 'text-primary font-medium'}>
                    {telemetry.mq3 > 380 ? 'VAPOR SPIKE' : 'Safe Trace'}
                  </span>
                </div>
              </div>

              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    telemetry.mq3 > 380 ? 'bg-rose-500' : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.min(100, (telemetry.mq3 / 800) * 100)}%` }}
                />
              </div>
            </div>

            {/* Card: MQ-135 Hazardous Gases & Air Quality */}
            <div className="squircle-card hover-pop-blue bg-surface-container-lowest p-5 flex flex-col justify-between cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Toxics / NH3 / Benzene
                  </span>
                  <h3 className="text-lg font-extrabold text-on-surface mt-0.5">MQ-135 Sensor</h3>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-xl">air</span>
                </div>
              </div>

              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                  {telemetry.mq135} <span className="text-sm font-bold text-secondary">ppm</span>
                </div>
                <div className="text-xs text-secondary mt-1 flex items-center gap-1">
                  <span>Threshold: 550</span>
                  <span>•</span>
                  <span className={telemetry.mq135 > 550 ? 'text-rose-600 font-bold' : 'text-tertiary font-medium'}>
                    {telemetry.mq135 > 550 ? 'ELEVATED' : 'Clean'}
                  </span>
                </div>
              </div>

              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    telemetry.mq135 > 550 ? 'bg-rose-500' : 'bg-tertiary'
                  }`}
                  style={{ width: `${Math.min(100, (telemetry.mq135 / 700) * 100)}%` }}
                />
              </div>
            </div>

            {/* Card: DHT22 Chamber Temperature */}
            <div className="squircle-card hover-pop-amber bg-surface-container-lowest p-5 flex flex-col justify-between cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Chamber Temp
                  </span>
                  <h3 className="text-lg font-extrabold text-on-surface mt-0.5">DHT22 Temp</h3>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-xl">thermostat</span>
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                  {telemetry.temp}°<span className="text-sm font-bold text-secondary">C</span>
                </div>
                <div className="text-xs text-secondary mt-1">
                  Range: 20°C - 45°C
                </div>
              </div>
              <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full w-fit">
                Thermal Steady State
              </div>
            </div>

            {/* Card: DHT22 Relative Humidity */}
            <div className="squircle-card hover-pop-teal bg-surface-container-lowest p-5 flex flex-col justify-between cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Chamber Humidity
                  </span>
                  <h3 className="text-lg font-extrabold text-on-surface mt-0.5">DHT22 RH</h3>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">humidity_mid</span>
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                  {telemetry.humidity}<span className="text-sm font-bold text-secondary">%</span>
                </div>
                <div className="text-xs text-secondary mt-1">
                  Target: 35% - 65% RH
                </div>
              </div>
              <div className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full w-fit">
                Optimal Sensitivity
              </div>
            </div>

            {/* Card: Heat Index & Vapor Pressure */}
            <div className="squircle-card hover-pop-blue bg-surface-container-lowest p-5 flex flex-col justify-between cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Heat Index
                  </span>
                  <h3 className="text-lg font-extrabold text-on-surface mt-0.5">Enthalpy Proxy</h3>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-xl">device_thermostat</span>
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                  {telemetry.heat_index}°<span className="text-sm font-bold text-secondary">C</span>
                </div>
                <div className="text-xs text-secondary mt-1">
                  Vapor sorption model
                </div>
              </div>
              <div className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                Compensation Active
              </div>
            </div>
          </div>

          {/* Panoramic Live Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Rolling Multi-Line Trend Chart (2 cols) */}
            <div className="xl:col-span-2 squircle-card hover-pop-teal bg-surface-container-lowest p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-black text-on-surface">
                    Rolling Multi-Sensor Trend (Last 30s)
                  </h3>
                  <p className="text-xs text-secondary mt-0.5">
                    Live dynamic synchronization of MQ-2, MQ-3, and MQ-135 ppm response
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-primary">Streaming 1.2s</span>
                </div>
              </div>

              <div className="w-full h-80 min-h-[320px]">
                <Line data={multiLineData} options={lineOptions} />
              </div>
            </div>

            {/* 5-Axis Threat Radar Chart (1 col) */}
            <div className="squircle-card hover-pop-purple bg-surface-container-lowest p-6 flex flex-col">
              <div className="mb-2">
                <h3 className="text-xl font-black text-on-surface">
                  5-Axis Chemical Vector Radar
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Multi-channel signature geometry for threat differentiation
                </p>
              </div>

              <div className="w-full h-80 min-h-[320px] flex items-center justify-center">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ADVANCED INFOS (Multi-line trend + 5-axis radar chart) */}
      {sensorViewMode === 'advanced' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rolling Multi-Line Trend Chart */}
            <div className="lg:col-span-2 squircle-card hover-pop-teal bg-surface-container-lowest p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-black text-on-surface">
                    Rolling Multi-Sensor Trend (Last 30s)
                  </h3>
                  <p className="text-xs text-secondary mt-0.5">
                    Live dynamic synchronization of MQ-2, MQ-3, and MQ-135 ppm response
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-primary">Streaming 1.2s</span>
                </div>
              </div>

              <div className="w-full h-80 min-h-[320px]">
                <Line data={multiLineData} options={lineOptions} />
              </div>
            </div>

            {/* 5-Axis Threat Radar Chart */}
            <div className="squircle-card hover-pop-purple bg-surface-container-lowest p-6 flex flex-col">
              <div className="mb-2">
                <h3 className="text-xl font-black text-on-surface">
                  5-Axis Chemical Vector Radar
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Multi-channel signature geometry for threat differentiation
                </p>
              </div>

              <div className="w-full h-80 min-h-[320px] flex items-center justify-center">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>

          {/* Differential Telemetry & ADC Voltage Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="squircle-card hover-pop-amber bg-surface-container-lowest p-5 border border-outline-variant/30">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase">
                <span className="material-symbols-outlined text-primary text-base">electric_meter</span>
                <span>ADS1115 ADC Raw Voltages</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">AIN0 (MQ-2):</span>
                  <span className="font-mono font-bold text-on-surface">
                    {(0.85 + (telemetry.mq2 / 800) * 2.2).toFixed(3)} V
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">AIN1 (MQ-3):</span>
                  <span className="font-mono font-bold text-on-surface">
                    {(0.72 + (telemetry.mq3 / 800) * 2.4).toFixed(3)} V
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">AIN2 (MQ-135):</span>
                  <span className="font-mono font-bold text-on-surface">
                    {(0.91 + (telemetry.mq135 / 700) * 2.1).toFixed(3)} V
                  </span>
                </div>
              </div>
            </div>

            <div className="squircle-card hover-pop-blue bg-surface-container-lowest p-5 border border-outline-variant/30">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase">
                <span className="material-symbols-outlined text-tertiary text-base">delta</span>
                <span>Baseline Drift (Tare Delta)</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">MQ-2 Delta:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    +{Math.max(0, telemetry.mq2 - 210)} ppm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">MQ-3 Delta:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    +{Math.max(0, telemetry.mq3 - 185)} ppm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">MQ-135 Delta:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    +{Math.max(0, telemetry.mq135 - 230)} ppm
                  </span>
                </div>
              </div>
            </div>

            <div className="squircle-card hover-pop-rose bg-surface-container-lowest p-5 border border-outline-variant/30">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase">
                <span className="material-symbols-outlined text-rose-600 text-base">psychology</span>
                <span>ML Classifier Confidence</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Model:</span>
                  <span className="font-bold text-on-surface">LightGBM-Edge-v2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Confidence:</span>
                  <span className="font-mono font-bold text-primary">{telemetry.ml_confidence}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Inference Latency:</span>
                  <span className="font-mono font-bold text-secondary">4.2 ms (Pi 5 NPU)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
