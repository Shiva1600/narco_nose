import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function DeviceSettings() {
  const {
    telemetry,
    connected,
    setNotification
  } = useApp();

  // MQTT Broker Link State
  const [mqttHost, setMqttHost] = useState('127.0.0.1');
  const [mqttPort, setMqttPort] = useState('1883');
  const [mqttPrefix, setMqttPrefix] = useState('narconose/');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.mqtt_host) setMqttHost(data.mqtt_host);
        if (data.mqtt_port) setMqttPort(String(data.mqtt_port));
        if (data.mqtt_topic_prefix) setMqttPrefix(data.mqtt_topic_prefix);
      })
      .catch(err => console.warn('Failed to load settings:', err));
  }, []);

  const handleConnect = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mqtt_host: mqttHost.trim(),
          mqtt_port: Number(mqttPort) || 1883,
          mqtt_topic_prefix: mqttPrefix.trim()
        })
      });
      const result = await res.json();
      setSaveSuccess(true);
      setNotification({
        type: 'success',
        title: 'MQTT Link Updated',
        message: `Connected to Mosquitto broker at ${mqttHost.trim()}:${mqttPort}`,
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not update MQTT broker settings. Check server logs.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-8 lg:px-12 py-8 flex-1 flex flex-col justify-start items-center">
      {/* Container Centered for MQTT Broker Link */}
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header Breadcrumb Banner */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/60 shadow-xs">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-inter">
              Settings
            </h1>
            <p className="text-xs sm:text-sm font-medium text-secondary mt-1 flex items-center space-x-2">
              <span>Raspberry Pi 5 Gateway &amp; Telemetry Bridge</span>
              <span className="text-outline font-bold">•</span>
              <span className="font-mono text-primary font-bold">Node SN-9021-TX</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              telemetry.hardware_online
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${telemetry.hardware_online ? 'bg-emerald-500 animate-ping' : 'bg-primary animate-pulse'}`} />
              <span>{telemetry.hardware_online ? 'Hardware Online' : 'Simulation Mode'}</span>
            </span>
          </div>
        </section>

        {/* MQTT Broker Link Card */}
        <section className="squircle-card hover-pop-blue bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between shadow-xs border border-white/70">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-2xs">
                  <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                    MQTT Broker Link
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-secondary">
                    Mosquitto broker connection for Raspberry Pi 5
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1 bg-surface-container border border-outline-variant/50 rounded-full text-xs font-bold text-primary flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${telemetry.hardware_online ? 'bg-emerald-500 animate-pulse' : 'bg-primary animate-pulse'}`} />
                <span>{telemetry.hardware_online ? 'Hardware Link Active' : 'Sim-Bridge Active'}</span>
              </span>
            </div>

            {/* Inputs & Configuration */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                  Raspberry Pi 5 IP / Broker Host
                </label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.105 or 127.0.0.1"
                  value={mqttHost}
                  onChange={(e) => setMqttHost(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
                <p className="text-[11px] text-secondary mt-1.5">
                  Enter your Pi 5's local Wi-Fi IP address to connect the website directly to your Pi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                    Port
                  </label>
                  <input
                    type="text"
                    value={mqttPort}
                    onChange={(e) => setMqttPort(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                    Topic Prefix
                  </label>
                  <input
                    type="text"
                    value={mqttPrefix}
                    onChange={(e) => setMqttPrefix(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Topics Info Box */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs sm:text-sm space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-secondary font-semibold">Subscribed:</span>
                  <span className="font-mono font-bold text-on-surface">
                    {mqttPrefix}telemetry, {mqttPrefix}gps
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-1.5 border-t border-outline-variant/20">
                  <span className="text-secondary font-semibold">Published:</span>
                  <span className="font-mono font-bold text-on-surface">
                    {mqttPrefix}actuators/#
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-secondary font-medium">
              Changes apply instantly to backend gateway and persistent SQLite configuration.
            </p>
            <button
              onClick={handleConnect}
              disabled={isSaving}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {saveSuccess ? 'check_circle' : (isSaving ? 'sync' : 'link')}
              </span>
              <span>
                {saveSuccess
                  ? 'Connected & Saved!'
                  : (isSaving ? 'Connecting...' : 'Connect to Pi 5 Broker')}
              </span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
