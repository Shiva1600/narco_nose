import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function DeviceSettings() {
  const {
    actuators,
    setActuator,
    calibrate,
    connected,
    setActiveTab,
    setNotification
  } = useApp();

  // Threshold state
  const [mq2Thresh, setMq2Thresh] = useState(420);
  const [mq3Thresh, setMq3Thresh] = useState(380);
  const [mq135Thresh, setMq135Thresh] = useState(550);
  const [mlConfThresh, setMlConfThresh] = useState(85);

  // MQTT Config State
  const [mqttHost, setMqttHost] = useState('127.0.0.1');
  const [mqttPort, setMqttPort] = useState('1883');
  const [mqttPrefix, setMqttPrefix] = useState('narconose/');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.thresholds) {
          if (data.thresholds.mq2) setMq2Thresh(data.thresholds.mq2);
          if (data.thresholds.mq3) setMq3Thresh(data.thresholds.mq3);
          if (data.thresholds.mq135) setMq135Thresh(data.thresholds.mq135);
          if (data.thresholds.confidence) setMlConfThresh(data.thresholds.confidence);
        }
        if (data.mqtt_host) setMqttHost(data.mqtt_host);
        if (data.mqtt_port) setMqttPort(data.mqtt_port);
        if (data.mqtt_topic_prefix) setMqttPrefix(data.mqtt_topic_prefix);
      })
      .catch(err => console.warn(err));
  }, []);

  const handleSaveAll = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thresholds: {
            mq2: Number(mq2Thresh),
            mq3: Number(mq3Thresh),
            mq135: Number(mq135Thresh),
            confidence: Number(mlConfThresh)
          },
          mqtt_host: mqttHost,
          mqtt_port: mqttPort,
          mqtt_topic_prefix: mqttPrefix
        })
      });
      setSaveSuccess(true);
      setNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Thresholds, actuators, and MQTT configuration synchronized.',
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
      {/* Sub-Header Area */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-4 pt-1">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center space-x-2 text-secondary hover:text-primary text-base font-bold transition-colors group"
          >
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span>Back to Home</span>
          </button>
        </div>

        <div className="text-left sm:text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-inter">
            Settings &amp; Actuator Control
          </h1>
          <p className="text-xs sm:text-sm font-medium text-secondary mt-1 flex items-center sm:justify-center space-x-2">
            <span>Bi-directional MQTT Publishing &amp; Hardware Telemetry Triggers</span>
            <span className="text-outline font-bold">•</span>
            <span className="font-mono text-primary font-bold">Node SN-9021-TX</span>
          </p>
        </div>

        <div className="flex items-center justify-start sm:justify-end">
          <button
            onClick={handleSaveAll}
            className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-extrabold shadow-md active:scale-95 transition-all ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {saveSuccess ? 'check_circle' : 'done_all'}
            </span>
            <span>{saveSuccess ? 'Changes Saved!' : 'Save All Changes'}</span>
          </button>
        </div>
      </section>

      {/* 2x2 Bento Grid of Squircles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* CARD 1: Threshold Calibration */}
        <section className="squircle-card hover-pop-teal bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">tune</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Threshold Calibration</h2>
                  <p className="text-xs sm:text-sm font-medium text-secondary">
                    Set alert trigger limits for volatile gas detection
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-surface-bright border border-outline-variant/50 rounded-full text-xs font-bold text-secondary">
                Live Trim
              </span>
            </div>

            {/* Slider 1: MQ-2 */}
            <div className="mb-5 pb-4 border-b border-surface-container">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-bold text-on-surface">MQ-2 Combustible Gas Alert Limit</span>
                <span className="font-mono font-extrabold text-primary text-base bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                  {mq2Thresh} ppm
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xs font-bold text-secondary w-12">100 ppm</span>
                <input
                  type="range"
                  min="100"
                  max="800"
                  value={mq2Thresh}
                  onChange={(e) => setMq2Thresh(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-primary"
                />
                <span className="text-xs font-bold text-secondary text-right w-16">800 ppm</span>
              </div>
            </div>

            {/* Slider 2: MQ-3 */}
            <div className="mb-5 pb-4 border-b border-surface-container">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-bold text-on-surface">MQ-3 Alcohol / Solvents Alert Limit</span>
                <span className="font-mono font-extrabold text-rose-700 text-base bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                  {mq3Thresh} ppm
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xs font-bold text-secondary w-12">100 ppm</span>
                <input
                  type="range"
                  min="100"
                  max="800"
                  value={mq3Thresh}
                  onChange={(e) => setMq3Thresh(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-rose-600"
                />
                <span className="text-xs font-bold text-secondary text-right w-16">800 ppm</span>
              </div>
            </div>

            {/* Slider 3: MQ-135 */}
            <div className="mb-5 pb-4 border-b border-surface-container">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-bold text-on-surface">MQ-135 Hazardous Gases Alert Limit</span>
                <span className="font-mono font-extrabold text-blue-800 text-base bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                  {mq135Thresh} ppm
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xs font-bold text-secondary w-12">100 ppm</span>
                <input
                  type="range"
                  min="100"
                  max="900"
                  value={mq135Thresh}
                  onChange={(e) => setMq135Thresh(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-blue-600"
                />
                <span className="text-xs font-bold text-secondary text-right w-16">900 ppm</span>
              </div>
            </div>

            {/* Slider 4: ML Confidence */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-bold text-on-surface">ML Alert Confidence Cutoff</span>
                <span className="font-mono font-extrabold text-on-surface text-base bg-surface-container px-3 py-1 rounded-xl border border-outline-variant/40">
                  {mlConfThresh}%
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xs font-bold text-secondary w-12">50%</span>
                <input
                  type="range"
                  min="50"
                  max="98"
                  value={mlConfThresh}
                  onChange={(e) => setMlConfThresh(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-primary"
                />
                <span className="text-xs font-bold text-secondary text-right w-16">98%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={calibrate}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs rounded-full border border-outline-variant/40 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm text-primary">auto_fix_high</span>
              <span>Tare Baseline to Clean Air</span>
            </button>
          </div>
        </section>

        {/* CARD 2: Physical Actuators & Hardware Triggers (Bi-directional MQTT) */}
        <section className="squircle-card hover-pop-amber bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">precision_manufacturing</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Hardware Actuators</h2>
                  <p className="text-xs sm:text-sm font-medium text-secondary">
                    Bi-directional MQTT relay triggers for Pi 5 GPIOs
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-black">
                Active Relay Bus
              </span>
            </div>

            {/* Actuator 1: 5V Chamber Fan */}
            <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-xl">mode_fan</span>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">5V Chamber Clearing Fan</h3>
                    <p className="text-xs text-secondary">Purges volatile vapors after chemical detection</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  actuators.fanState === 'ON' ? 'bg-primary text-white animate-pulse' : 'bg-surface-container text-secondary'
                }`}>
                  {actuators.fanState}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                <span className="font-semibold text-secondary">Control Mode:</span>
                <div className="inline-flex bg-surface-container p-1 rounded-full">
                  {['AUTO', 'ON', 'OFF'].map(m => (
                    <button
                      key={m}
                      onClick={() => setActuator('fan', m === 'ON' ? 'ON' : (m === 'OFF' ? 'OFF' : actuators.fanState), m)}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        actuators.fanMode === m
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actuator 2: Audio Buzzer Alarm */}
            <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-orange-600 text-xl">volume_up</span>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Piezoelectric Buzzer Alarm</h3>
                    <p className="text-xs text-secondary">Acoustic alert (85 dB) on critical threshold breach</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  actuators.buzzerState === 'ARMED' ? 'bg-emerald-100 text-emerald-900' : 'bg-surface-container text-secondary'
                }`}>
                  {actuators.buzzerState}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                <span className="font-semibold text-secondary">State:</span>
                <div className="inline-flex bg-surface-container p-1 rounded-full">
                  {['ARMED', 'MUTE', 'TEST'].map(st => (
                    <button
                      key={st}
                      onClick={() => setActuator('buzzer', st)}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        actuators.buzzerState === st
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actuator 3: RGB Status LEDs */}
            <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-xl">palette</span>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">WS2812B RGB Status LEDs</h3>
                    <p className="text-xs text-secondary">Visual indicator for field deployment perimeter</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-primary">{actuators.ledMode}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                <span className="font-semibold text-secondary">Pattern:</span>
                {['PULSE_TEAL', 'ALERT_RED', 'WARN_AMBER', 'OFF'].map(pattern => (
                  <button
                    key={pattern}
                    onClick={() => setActuator('leds', null, pattern)}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                      actuators.ledMode === pattern
                        ? 'bg-tertiary text-white shadow-sm'
                        : 'bg-surface-container text-secondary hover:text-on-surface'
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CARD 3: MQTT Broker & IoT Gateway Configuration */}
        <section className="squircle-card hover-pop-blue bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">MQTT Broker Link</h2>
                  <p className="text-xs sm:text-sm font-medium text-secondary">
                    Mosquitto broker connection for Raspberry Pi 5
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-surface-container border border-outline-variant/50 rounded-full text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Sim-Bridge Active</span>
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1">
                  Broker Host / IP
                </label>
                <input
                  type="text"
                  value={mqttHost}
                  onChange={(e) => setMqttHost(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm font-mono text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    value={mqttPort}
                    onChange={(e) => setMqttPort(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm font-mono text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1">
                    Topic Prefix
                  </label>
                  <input
                    type="text"
                    value={mqttPrefix}
                    onChange={(e) => setMqttPrefix(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm font-mono text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Subscribed:</span>
                  <span className="font-mono font-bold text-on-surface">narconose/telemetry, camera/yolo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Published:</span>
                  <span className="font-mono font-bold text-on-surface">narconose/actuators/#</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 bg-tertiary hover:bg-tertiary-container text-white font-bold text-xs rounded-full shadow-sm active:scale-95 transition-all"
            >
              Re-bind MQTT Broker
            </button>
          </div>
        </section>

        {/* CARD 4: Machine Learning & Edge Model Parameters */}
        <section className="squircle-card hover-pop-purple bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <span className="material-symbols-outlined text-2xl">neurology</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">ML &amp; YOLO Vision Tuning</h2>
                  <p className="text-xs sm:text-sm font-medium text-secondary">
                    LightGBM classifier weights &amp; YOLOv8-Nano NPU inference
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-full text-xs font-bold">
                Model v4.1
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Inference Engine:</span>
                  <span className="font-mono font-bold text-primary">PyTorch Lite / ONNX</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">NPU Acceleration:</span>
                  <span className="font-bold text-emerald-700">Raspberry Pi AI Kit (Hailo-8L)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Input Tensor:</span>
                  <span className="font-mono text-secondary">640×640×3 (FP16)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Auto-Purge Delay:</span>
                  <span className="font-mono font-bold text-on-surface">3.5 seconds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Optical Verification:</span>
                  <span className="font-bold text-primary">Multi-Modal Fusion Enabled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 bg-primary text-on-primary font-bold text-xs rounded-full shadow-sm active:scale-95 transition-all"
            >
              Update ML Parameters
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
