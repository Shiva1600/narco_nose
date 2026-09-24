import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import L from 'leaflet';

// Fix Leaflet icon asset paths in Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function OpticalEvidence() {
  const {
    telemetry,
    gps,
    anomalies,
    captureSnapshot,
    setSelectedSnapshot,
    activeTab
  } = useApp();

  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  // Invalidate map layout when switching into optical evidence tab
  useEffect(() => {
    if (activeTab === 'camera' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 60);
    }
  }, [activeTab]);

  // Determine current active incident photo: either live telemetry image or latest anomaly
  const latestAnomalyWithPhoto = anomalies?.find(a => a.snapshot_url || a.url);
  const currentPhotoUrl = telemetry.captured_image || latestAnomalyWithPhoto?.snapshot_url || latestAnomalyWithPhoto?.url;
  const isThreat = telemetry.threat_level === 'THREAT';
  const isWarning = telemetry.threat_level === 'WARNING';

  // Initialize Leaflet Map once on mount, clean up on unmount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = gps?.lat || 22.560264;
    const lon = gps?.lon || 88.490171;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-gps-pin',
      html: `
        <div style="background-color: #ba1a1a; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(186,26,26,0.6); display: flex; align-items: center; justify-content: center; color: white;">
          <span class="material-symbols-outlined" style="font-size: 18px;">location_on</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(`<b>Narco Nose Monitoring Node</b><br/>UEM Kolkata Campus<br/>Lat: ${lat.toFixed(5)}<br/>Lon: ${lon.toFixed(5)}`);

    const polyline = L.polyline(gps.routeTrail || [[lat, lon]], {
      color: '#ba1a1a',
      weight: 3.5,
      opacity: 0.7,
      dashArray: '5, 8'
    }).addTo(map);

    mapInstanceRef.current = map;
    markerRef.current = marker;
    polylineRef.current = polyline;

    setTimeout(() => {
      map.invalidateSize();
    }, 60);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      polylineRef.current = null;
    };
  }, []);

  // Update marker & trail smoothly when GPS coordinates change
  useEffect(() => {
    if (markerRef.current && gps?.lat && gps?.lon) {
      markerRef.current.setLatLng([gps.lat, gps.lon]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([gps.lat, gps.lon]);
      }
    }
    if (polylineRef.current && gps.routeTrail) {
      polylineRef.current.setLatLngs(gps.routeTrail);
    }
  }, [gps]);

  const handleManualCapture = async () => {
    setSnapshotLoading(true);
    await captureSnapshot({
      threat_type: telemetry.prediction || 'Manual Optical Capture',
      confidence: telemetry.ml_confidence || 90.0,
      severity: isThreat ? 'CRITICAL' : 'NOMINAL'
    });
    setSnapshotLoading(false);
  };

  return (
    <div className="flex-1 w-full max-w-[1720px] mx-auto px-6 sm:px-8 lg:px-12 py-6 space-y-6">
      {/* Subheader Bar with Node Identity & Capture Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/60 shadow-xs">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <span className="material-symbols-outlined text-2xl font-bold">photo_camera</span>
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-inter">
                Optical Threat Evidence
              </h1>
              <p className="text-xs text-secondary font-medium">
                Automated OpenCV optical capture triggered on chemical threat detection
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-on-surface bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/40 shadow-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isThreat ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'}`}></span>
          <span className="font-extrabold text-on-surface">Raspberry Pi 5</span>
          <span className="text-outline-variant font-black">•</span>
          <span className="text-secondary font-semibold">Camera Trigger: Armed</span>
        </div>
      </div>

      {/* Global Status Banner */}
      <div
        className={`w-full border-2 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm transition-colors duration-300 ${isThreat
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : isWarning
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${isThreat ? 'bg-rose-600 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {isThreat ? 'dangerous' : isWarning ? 'warning' : 'verified_user'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-3.5 h-3.5 rounded-full ${isThreat ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'}`} />
              <span className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                STATUS: {telemetry.threat_level || 'NORMAL'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/80 border border-black/10">
                Confidence: {telemetry.ml_confidence || 90}%
              </span>
            </div>
            <p className="text-sm font-semibold mt-0.5 opacity-90">
              {isThreat
                ? `Active Threat Detected (${telemetry.prediction || 'Harmful Gas'}) — Incident frame captured via Raspberry Pi camera.`
                : isWarning
                  ? 'Elevated Gas Concentration (Not Harmful) — Atmospheric levels monitored.'
                  : 'Normal Atmospheric Baseline — Sensors clean. Camera in passive ready standby.'}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white border-2 border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-slate-800 shadow-xs">
            <span className="material-symbols-outlined text-base text-rose-600">center_focus_strong</span>
            <span>OpenCV</span>
          </div>
          <div className="bg-white border-2 border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-slate-800 shadow-xs">
            <span className="material-symbols-outlined text-base text-primary">location_on</span>
            <span>GPS Geo-Tagged</span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Incident Photo Viewer (65%) vs Incident Details & GPS (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Incident Photo Display */}
        <section className="lg:col-span-7 xl:col-span-8 bg-surface-container-lowest squircle-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <span className="material-symbols-outlined text-2xl font-semibold">camera_alt</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">
                  Threat Optical Capture
                </h2>
                <p className="text-xs sm:text-sm font-medium text-secondary">
                  Single-frame snapshot captured automatically by OpenCV during threat event
                </p>
              </div>
            </div>

            {currentPhotoUrl && (
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                Threat Evidence
              </span>
            )}
          </div>

          {/* Photo Viewport Container */}
          <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-inner group flex items-center justify-center">
            {currentPhotoUrl ? (
              <>
                <img
                  src={currentPhotoUrl}
                  alt="Threat Incident Captured"
                  className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-102"
                  onClick={() => setSelectedSnapshot({
                    url: currentPhotoUrl,
                    captured_image: currentPhotoUrl,
                    timestamp: telemetry.timestamp || new Date().toISOString(),
                    threat_type: telemetry.prediction || 'Threat Detected',
                    confidence: telemetry.ml_confidence,
                    lat: gps?.lat,
                    lon: gps?.lon,
                    severity: 'CRITICAL'
                  })}
                />

                {/* Visual Overlay Header */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>Threat Event: {telemetry.prediction || 'Harmful Gas Detected'}</span>
                    <span className="text-rose-400 font-mono">({telemetry.ml_confidence || 89}%)</span>
                  </div>
                  <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs font-mono">
                    {new Date(telemetry.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>

                {/* Hover Click to Expand Indicator */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-black/80 text-white px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-sm border border-white/20">
                    <span className="material-symbols-outlined text-base">zoom_in</span>
                    <span>Click to Inspect Full Resolution</span>
                  </div>
                </div>
              </>
            ) : (
              /* Standby State when no photo has been triggered yet */
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                  <span className="material-symbols-outlined text-4xl">photo_camera</span>
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-lg font-bold text-slate-200">
                    Camera In Standby Mode
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No active threat photo captured yet. The Raspberry Pi 5 camera will automatically trigger, capture a high-resolution frame via OpenCV, and display it here when a chemical threat is detected.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sensor Pipeline Active • Ready to Snap</span>
                </div>
              </div>
            )}
          </div>

          {/* Photo Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <span className="material-symbols-outlined text-base text-primary">info</span>
              <span>Camera snaps instantly upon ML threat detection</span>
            </div>

            <div className="flex items-center gap-2">
              {currentPhotoUrl && (
                <button
                  onClick={() => setSelectedSnapshot({
                    url: currentPhotoUrl,
                    captured_image: currentPhotoUrl,
                    timestamp: telemetry.timestamp || new Date().toISOString(),
                    threat_type: telemetry.prediction || 'Threat Detected',
                    confidence: telemetry.ml_confidence,
                    lat: gps?.lat,
                    lon: gps?.lon,
                    severity: 'CRITICAL'
                  })}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>Inspect Fullscreen</span>
                </button>
              )}
              <button
                onClick={handleManualCapture}
                disabled={snapshotLoading}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-primary">photo_camera</span>
                <span>{snapshotLoading ? 'Triggering...' : 'Manual Snapshot'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Incident Details & GPS Location Map */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Incident Details Card */}
          <section className="bg-surface-container-lowest squircle-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg font-bold">assignment</span>
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Incident Telemetry</h2>
              </div>
              <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${isThreat ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-blue-50 text-blue-900 border border-blue-200'
                }`}>
                {telemetry.prediction || 'Normal'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30">
                <span className="text-secondary font-semibold">Model Output</span>
                <span className="font-bold text-on-surface text-sm uppercase">
                  {telemetry.prediction || 'Normal'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30">
                <span className="text-secondary font-semibold">Model Confidence</span>
                <span className="font-bold text-primary text-sm font-mono">
                  {telemetry.ml_confidence || 90}%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-1.5">
                <span className="text-secondary font-semibold block">Sensors at Trigger:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-white/80 p-1.5 rounded-lg border border-black/5">
                    <span className="block text-[10px] text-secondary">MQ-2</span>
                    <span className="font-bold text-slate-800">{telemetry.mq2 || 0}</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg border border-black/5">
                    <span className="block text-[10px] text-secondary">MQ-3</span>
                    <span className="font-bold text-slate-800">{telemetry.mq3 || 0}</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg border border-black/5">
                    <span className="block text-[10px] text-secondary">MQ-135</span>
                    <span className="font-bold text-slate-800">{telemetry.mq135 || 0}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-center pt-1">
                  <div className="bg-white/80 p-1.5 rounded-lg border border-black/5">
                    <span className="block text-[10px] text-secondary">DHT11 Temp</span>
                    <span className="font-bold text-slate-800">{telemetry.temp || 24}°C</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-lg border border-black/5">
                    <span className="block text-[10px] text-secondary">DHT11 Humidity</span>
                    <span className="font-bold text-slate-800">{telemetry.humidity || 45}%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* GPS Map Card: Field Incident Location */}
          <section className="bg-surface-container-lowest squircle-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg font-bold">my_location</span>
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Field GPS Location</h2>
              </div>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-xs font-black flex items-center gap-1 border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                <span>{gps.satellites || 9} Sats • {gps.fix || '3D Fix'}</span>
              </span>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="w-full h-56 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-inner relative z-0">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Coordinates Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30 font-mono">
              <div>
                <span className="text-secondary block font-sans font-semibold">LATITUDE</span>
                <span className="font-bold text-on-surface">{(gps.lat || 22.560264).toFixed(6)}° N</span>
              </div>
              <div>
                <span className="text-secondary block font-sans font-semibold">LONGITUDE</span>
                <span className="font-bold text-on-surface">{(gps.lon || 88.490171).toFixed(6)}° E</span>
              </div>
              <div>
                <span className="text-secondary block font-sans font-semibold">ALTITUDE</span>
                <span className="font-bold text-on-surface">{gps.altitude || 14.5} m MSL</span>
              </div>
              <div>
                <span className="text-secondary block font-sans font-semibold">GROUND SPEED</span>
                <span className="font-bold text-primary">{gps.speed || 0.0} m/s</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
