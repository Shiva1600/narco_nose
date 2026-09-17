import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Line } from 'react-chartjs-2';

export default function HistoryLogs() {
  const { anomalies, setSelectedSnapshot, setActiveTab } = useApp();
  const [historyTelemetry, setHistoryTelemetry] = useState([]);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/telemetry/recent?limit=80')
      .then(res => res.json())
      .then(data => {
        setHistoryTelemetry(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [timeFilter]);

  // Chart Data preparation
  const labels = historyTelemetry.map(d => {
    const t = new Date(d.timestamp);
    return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const chartData = {
    labels: labels.length ? labels : ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    datasets: [
      {
        label: 'MQ-2 (Combustible Gas)',
        data: historyTelemetry.map(d => d.mq2_smoke || 210),
        borderColor: '#00685f',
        backgroundColor: 'rgba(0, 104, 95, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 2
      },
      {
        label: 'MQ-3 (Alcohol / Vapors)',
        data: historyTelemetry.map(d => d.mq3_alcohol || 185),
        borderColor: '#ba1a1a',
        backgroundColor: 'rgba(186, 26, 26, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 2
      },
      {
        label: 'MQ-135 (Air Quality)',
        data: historyTelemetry.map(d => d.mq135_air || 230),
        borderColor: '#007bb9',
        backgroundColor: 'rgba(0, 123, 185, 0.05)',
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 12 },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(25, 28, 30, 0.9)',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.7)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#565e74' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 10 }, color: '#565e74', maxTicksLimit: 12 }
      }
    }
  };

  // Filter anomalies
  const filteredAnomalies = anomalies.filter(a => {
    if (severityFilter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (severityFilter === 'WARNING') return a.severity === 'WARNING';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col gap-6">
      {/* Sub-Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3.5">
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-secondary hover:text-primary transition-colors py-1 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Home</span>
          </button>
          <div className="h-5 w-px bg-outline-variant/60 hidden sm:block"></div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface font-display-hero">
              History
            </h1>
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/60 text-on-surface-variant text-xs font-bold shadow-xs">
              SQLite Logbook • Node SN-9021-TX
            </span>
          </div>
        </div>

        <div className="text-sm font-bold text-secondary flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse"></span>
          <span>Database Synchronized</span>
        </div>
      </div>

      {/* Section 1: 24-Hour Biosensing Telemetry Trend */}
      <section className="bg-surface-container-lowest squircle-card hover-pop-teal p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary ring-2 ring-primary/20">
                <span className="material-symbols-outlined text-xl font-bold">show_chart</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Historical Telemetry &amp; Anomaly Trends
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-secondary mt-1">
              Continuous historical rolling capture across MQ gas proxies from SQLite database
            </p>
          </div>

          {/* Filter and Export Actions */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Time Range Filter Pills */}
            <div className="inline-flex bg-surface-container p-1 rounded-full border border-outline-variant/40 shadow-inner text-xs">
              {['1h', '6h', '24h', '7d'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-3.5 py-1.5 rounded-full font-extrabold transition-colors ${
                    timeFilter === tf
                      ? 'bg-on-surface text-surface-container-lowest shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Export Actions */}
            <a
              href="/api/export/csv"
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-extrabold transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-base text-primary">file_download</span>
              <span>Export CSV</span>
            </a>

            <a
              href="/api/export/json"
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-extrabold transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-base text-tertiary">data_object</span>
              <span>JSON</span>
            </a>
          </div>
        </div>

        {/* Time Series Vector Graph Canvas */}
        <div className="relative w-full h-72 sm:h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      {/* Section 2: Chronological Threat Event Log & YOLO Snapshots */}
      <section className="bg-surface-container-lowest squircle-card hover-pop-rose p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <span className="material-symbols-outlined text-xl font-bold">crisis_alert</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Chronological Threat Events &amp; YOLO Snapshots
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-secondary mt-1">
              Recorded proxy detections with optical snapshot captures and sensor peak measurements
            </p>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-secondary">Filter:</span>
            <div className="inline-flex bg-surface-container p-1 rounded-full text-xs">
              {['ALL', 'CRITICAL', 'WARNING'].map(f => (
                <button
                  key={f}
                  onClick={() => setSeverityFilter(f)}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    severityFilter === f
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Anomaly Event Cards List */}
        <div className="space-y-4">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-12 text-secondary text-sm font-medium">
              No anomalies recorded for this filter. System operating within baseline parameters.
            </div>
          ) : (
            filteredAnomalies.map((evt) => {
              const isCrit = evt.severity === 'CRITICAL';
              return (
                <div
                  key={evt.id}
                  className={`p-5 rounded-3xl bg-surface-container-low/70 border border-outline-variant/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                    isCrit ? 'hover-pop-rose' : 'hover-pop-amber'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                        isCrit ? 'bg-rose-600' : 'bg-amber-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl font-bold">
                        {isCrit ? 'warning' : 'notifications_active'}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                            isCrit ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {evt.severity} THREAT
                        </span>
                        <span className="text-xs font-mono font-semibold text-secondary">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          ML Conf: {evt.confidence}%
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-on-surface mt-1">
                        {evt.threat_type}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-secondary mt-1 font-medium">
                        <span>MQ-2 Peak: <strong className="text-on-surface">{evt.mq2} ppm</strong></span>
                        <span>•</span>
                        <span>MQ-3 Peak: <strong className="text-rose-600 font-bold">{evt.mq3} ppm</strong></span>
                        <span>•</span>
                        <span>MQ-135: <strong className="text-on-surface">{evt.mq135} ppm</strong></span>
                        <span>•</span>
                        <span>GPS: <strong className="font-mono text-on-surface">{evt.lat ? `${evt.lat.toFixed(4)}, ${evt.lon.toFixed(4)}` : '37.7749, -122.4194'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Snapshot thumbnail & zoom trigger */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setSelectedSnapshot(evt)}
                      className="group flex items-center gap-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 p-1.5 pr-3.5 rounded-2xl transition-all active:scale-95"
                    >
                      <div className="w-14 h-10 rounded-xl bg-slate-900 overflow-hidden border border-outline-variant/30 flex items-center justify-center">
                        <img
                          src={evt.snapshot_url || '/snapshots/threat_sample_1.jpg'}
                          alt="Snapshot"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = '/stream/frame.svg';
                          }}
                        />
                      </div>
                      <div className="text-left text-xs font-extrabold text-primary flex items-center gap-1">
                        <span>View YOLO Frame</span>
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
