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

export default function CameraYolo() {
  const {
    telemetry,
    gps,
    detections,
    boundingBoxesEnabled,
    toggleBoundingBoxes,
    captureSnapshot,
    setSelectedSnapshot,
    setActiveTab,
    activeTab
  } = useApp();

  const [sensitivity, setSensitivity] = useState(75);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [feedTimestamp, setFeedTimestamp] = useState(Date.now());
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  // Invalidate map layout when switching into camera tab
  useEffect(() => {
    if (activeTab === 'camera' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 60);
    }
  }, [activeTab]);

  // Auto refresh static frame if MJPEG stream is not active
  useEffect(() => {
    const timer = setInterval(() => {
      setFeedTimestamp(Date.now());
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Initialize Leaflet Map once on mount, clean up on unmount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [gps.lat, gps.lon],
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
        <div style="background-color: #00685f; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,104,95,0.6); display: flex; align-items: center; justify-content: center; color: white;">
          <span class="material-symbols-outlined" style="font-size: 16px;">sensors</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([gps.lat, gps.lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(`<b>Narco Nose Node</b><br/>Lat: ${gps.lat.toFixed(5)}<br/>Lon: ${gps.lon.toFixed(5)}`);

    const polyline = L.polyline(gps.routeTrail || [[gps.lat, gps.lon]], {
      color: '#008378',
      weight: 3.5,
      opacity: 0.7,
      dashArray: '5, 8'
    }).addTo(map);

    mapInstanceRef.current = map;
    markerRef.current = marker;
    polylineRef.current = polyline;

    // Small delay to ensure container dimension layout finishes
    setTimeout(() => {
      map.invalidateSize();
    }, 50);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      polylineRef.current = null;
    };
  }, []);

  // Update marker & trail smoothly when GPS coordinates change
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([gps.lat, gps.lon]);
    }
    if (polylineRef.current && gps.routeTrail) {
      polylineRef.current.setLatLngs(gps.routeTrail);
    }
  }, [gps]);

  const handleCapture = async () => {
    setSnapshotLoading(true);
    await captureSnapshot({
      threat_type: detections[0]?.label || 'Manual Optical Capture',
      confidence: detections[0]?.confidence || 94.0,
      severity: telemetry.threat_level === 'THREAT' ? 'CRITICAL' : 'NOMINAL'
    });
    setSnapshotLoading(false);
  };

  const isThreat = telemetry.threat_level === 'THREAT';

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Subheader Bar with Return Navigation & Node Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-3.5">
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-on-surface text-sm font-bold transition-all active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-base font-semibold">arrow_back</span>
            <span>Back to Home</span>
          </button>
          <div className="h-6 w-px bg-outline-variant/60 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-display-hero">
              Camera YOLO
            </h1>
            <span className="bg-surface-container-highest/80 px-3.5 py-1 rounded-full text-xs font-bold text-on-surface-variant border border-outline-variant/30">
              YOLOv8-Nano Core
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-on-surface bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/40 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-extrabold text-on-surface">Node SN-9021-TX</span>
          <span className="text-outline-variant font-black">•</span>
          <span className="text-secondary font-semibold">Optical Proxy Stream</span>
        </div>
      </div>

      {/* Global Status Banner */}
      <div
        className={`w-full border-2 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm transition-colors duration-300 ${
          isThreat
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
              isThreat ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
            }`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {isThreat ? 'warning' : 'verified_user'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-3.5 h-3.5 rounded-full ${isThreat ? 'bg-rose-600' : 'bg-emerald-600'}`} />
              <span className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                SYSTEM STATUS: {telemetry.threat_level}
              </span>
            </div>
            <p className="text-sm font-semibold mt-0.5 opacity-90">
              {isThreat
                ? 'Active chemical anomaly detected! Bounding boxes locked on volatile proxy source.'
                : 'Biometric & chemical signatures calibrated. No airborne narcotic volatilization detected.'}
            </p>
          </div>
        </div>

        {/* Sub-badges with High-Contrast Styling */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white border-2 border-emerald-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-emerald-900 shadow-xs">
            <span className="material-symbols-outlined text-base text-emerald-600">neurology</span>
            <span>CV Model: YOLOv8 Active</span>
          </div>
          <div className="bg-white border-2 border-emerald-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-emerald-900 shadow-xs">
            <span className="material-symbols-outlined text-base text-emerald-600">videocam</span>
            <span>29.8 FPS Stream</span>
          </div>
        </div>
      </div>

      {/* Asymmetric 2-Column Grid: Video Feed (65%) vs Metadata & GPS (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Video Card */}
        <section className="lg:col-span-7 xl:col-span-8 bg-surface-container-lowest squircle-card hover-pop-teal p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl font-semibold">videocam</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">
                  Optical Inspection Stream
                </h2>
                <p className="text-xs sm:text-sm font-medium text-secondary">
                  Live Raspberry Pi USB Camera feed with real-time YOLO bounding box overlays
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-secondary">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-surface-container text-on-surface font-extrabold border border-outline-variant/30">
                Inference: 14.2ms
              </span>
            </div>
          </div>

          {/* Video Viewport Container */}
          <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-inner group">
            {/* Dynamic Frame Image (SVG generated by backend with HUD overlays) */}
            <img
              src={`/stream/frame.svg?t=${feedTimestamp}`}
              alt="Narco Nose Camera Stream"
              className="w-full h-full object-cover select-none"
              onError={(e) => {
                // Fallback graceful graphic if network momentarily reconnects
                e.target.style.display = 'none';
              }}
            />

            {/* Interactive Client-Side Bounding Box HUD if enabled */}
            {boundingBoxesEnabled && detections.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {detections.map((det) => {
                  const isCrit = det.threatLevel === 'THREAT';
                  return (
                    <div
                      key={det.id}
                      className={`absolute rounded-xl transition-all ${
                        isCrit ? 'hud-box-danger' : 'hud-box'
                      }`}
                      style={{
                        left: `${(det.box.x / 720) * 100}%`,
                        top: `${(det.box.y / 450) * 100}%`,
                        width: `${(det.box.width / 720) * 100}%`,
                        height: `${(det.box.height / 450) * 100}%`
                      }}
                    >
                      <div
                        className={`absolute -top-7 left-1 text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow flex items-center gap-1 ${
                          isCrit ? 'bg-rose-600' : 'bg-teal-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {isCrit ? 'dangerous' : 'biotech'}
                        </span>
                        <span>{det.label}</span>
                        <span>[{det.confidence.toFixed(1)}%]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Camera Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleBoundingBoxes}
                className={`px-4 py-2 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 active:scale-95 ${
                  boundingBoxesEnabled
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container text-secondary border-outline-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {boundingBoxesEnabled ? 'visibility' : 'visibility_off'}
                </span>
                <span>Bounding Boxes: {boundingBoxesEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={handleCapture}
                disabled={snapshotLoading}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm text-primary">photo_camera</span>
                <span>{snapshotLoading ? 'Capturing...' : 'Capture Frame'}</span>
              </button>
            </div>

            {/* Sensitivity Slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-secondary">Confidence Cutoff:</span>
              <input
                type="range"
                min="40"
                max="95"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-24 sm:w-28 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-on-surface w-8">
                {sensitivity}%
              </span>
            </div>
          </div>

          {/* Camera Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-2xl p-3.5">
              <span className="text-[11px] font-bold text-secondary uppercase block">Resolution</span>
              <span className="text-base sm:text-lg font-black text-on-surface mt-0.5 block">
                1920×1080 (720p)
              </span>
            </div>
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-2xl p-3.5">
              <span className="text-[11px] font-bold text-secondary uppercase block">Sensor FOV</span>
              <span className="text-base sm:text-lg font-black text-on-surface mt-0.5 block">
                110° Wide
              </span>
            </div>
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-2xl p-3.5">
              <span className="text-[11px] font-bold text-secondary uppercase block">Framerate</span>
              <span className="text-base sm:text-lg font-black text-primary mt-0.5 block">
                29.8 FPS
              </span>
            </div>
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-2xl p-3.5">
              <span className="text-[11px] font-bold text-secondary uppercase block">Bitrate</span>
              <span className="text-base sm:text-lg font-black text-tertiary mt-0.5 block">
                4.8 Mbps
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Stacked Metadata Card & GPS Map Card */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Metadata Card: Detection Log */}
          <section className="bg-surface-container-lowest squircle-card hover-pop-rose p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg font-bold">fact_check</span>
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Target Detections</h2>
              </div>
              <span className="bg-teal-50 text-teal-900 border border-teal-200 px-3 py-0.5 rounded-full text-xs font-black">
                {detections.length} Targets
              </span>
            </div>

            {/* Detected Objects List */}
            <div className="space-y-3">
              {detections.map((d, i) => (
                <div
                  key={d.id || i}
                  className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 hover:border-outline-variant transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base font-bold">
                        {d.threatLevel === 'THREAT' ? 'dangerous' : 'biotech'}
                      </span>
                      <span className="text-sm font-bold text-on-surface">{d.label}</span>
                    </div>
                    <span className="text-base font-black text-primary">
                      {d.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/20 text-xs font-semibold text-secondary">
                    <span className="font-mono text-xs text-on-surface-variant">
                      Bounding Box: [{d.box.width}×{d.box.height}px]
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        d.threatLevel === 'THREAT'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          d.threatLevel === 'THREAT' ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                      />
                      {d.threatLevel === 'THREAT' ? 'Active Threat' : 'Verified'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCapture}
              className="w-full bg-primary text-on-primary rounded-full py-2.5 text-sm font-extrabold hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              <span>Capture Snapshot to History</span>
            </button>
          </section>

          {/* GPS Map Card: Field Deployment Location (NEO-6M) */}
          <section className="bg-surface-container-lowest squircle-card hover-pop-blue p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg font-bold">my_location</span>
                </div>
                <h2 className="text-xl font-extrabold text-on-surface">Field GPS Location</h2>
              </div>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-xs font-black flex items-center gap-1 border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>{gps.satellites} Sats • {gps.fix}</span>
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
                <span className="font-bold text-on-surface">{gps.lat.toFixed(6)}° N</span>
              </div>
              <div>
                <span className="text-secondary block font-sans font-semibold">LONGITUDE</span>
                <span className="font-bold text-on-surface">{gps.lon.toFixed(6)}° W</span>
              </div>
              <div>
                <span className="text-secondary block font-sans font-semibold">ALTITUDE</span>
                <span className="font-bold text-on-surface">{gps.altitude} m MSL</span>
              </div>
              <div>
                <span className="text-secondary block font-sans font-semibold">GROUND SPEED</span>
                <span className="font-bold text-primary">{gps.speed} m/s</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
