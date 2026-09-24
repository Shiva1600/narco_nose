const EventEmitter = require('events');
const cameraService = require('./camera_service');
const database = require('./database');

class SimulationEngine extends EventEmitter {
  constructor() {
    super();

    // Baseline sensor baselines
    this.baseline = {
      mq2: 210,
      mq3: 185,
      mq135: 230,
      temp: 23.8,
      humidity: 45.2
    };

    // Current live sensor values
    this.current = { ...this.baseline };

    // Threat injection target & decay
    this.threatTarget = null;
    this.activeThreatScenario = null;
    this.threatLevel = 'SAFE'; // 'SAFE' | 'WARNING' | 'THREAT'
    this.mlConfidence = 21.4;

    // Actuators
    this.actuators = {
      fanMode: 'AUTO',
      fanState: 'OFF',
      buzzerState: 'ARMED',
      ledMode: 'PULSE_TEAL'
    };

    // System thresholds
    this.thresholds = {
      mq2: 420,
      mq3: 380,
      mq135: 550,
      confidence: 85
    };

    // Raspberry Pi 5 hardware metrics
    this.piMetrics = {
      cpuUsage: 24.5,
      ramUsage: 43.8,
      tempC: 48.2,
      diskFreeGB: 41.6,
      diskTotalGB: 64.0,
      fanRpm: 0,
      uptimeSeconds: 14280,
      sensorHealth: {
        mq2: { online: true, voltage: 1.12, status: 'Nominal' },
        mq3: { online: true, voltage: 0.98, status: 'Nominal' },
        mq135: { online: true, voltage: 1.25, status: 'Nominal' },
        dht11: { online: true, i2c: '0x38', status: 'Nominal' },
        gps_neo6m: { online: true, port: '/dev/ttyAMA0', baud: 9600, status: 'Fix 3D' },
        camera_usb: { online: true, fps: 29.8, status: 'Streaming' },
        ads1115_adc: { online: true, address: '0x48', status: 'Ready' }
      }
    };

    // NEO-6M GPS State (Default: University of Engineering & Management, UEM Kolkata)
    this.gps = {
      lat: 22.560264,
      lon: 88.490171,
      altitude: 14.5,
      speed: 0.0,
      satellites: 9,
      fix: '3D Fix',
      hdop: 1.1,
      routeTrail: [
        [22.5598, 88.4895],
        [22.5600, 88.4899],
        [22.560264, 88.490171]
      ]
    };

    this.timer = null;
    this.tickCount = 0;
  }

  start(intervalMs = 1200) {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), intervalMs);
    console.log('[SimEngine] Physics simulation started at interval:', intervalMs, 'ms');
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  tick() {
    this.tickCount++;

    // 1. Process threat target & decay
    if (this.threatTarget) {
      // Approach target
      this.current.mq2 += (this.threatTarget.mq2 - this.current.mq2) * 0.25;
      this.current.mq3 += (this.threatTarget.mq3 - this.current.mq3) * 0.25;
      this.current.mq135 += (this.threatTarget.mq135 - this.current.mq135) * 0.25;

      // If fan is ON, dissipate faster
      if (this.actuators.fanState === 'ON') {
        this.threatTarget.mq2 += (this.baseline.mq2 - this.threatTarget.mq2) * 0.22;
        this.threatTarget.mq3 += (this.baseline.mq3 - this.threatTarget.mq3) * 0.22;
        this.threatTarget.mq135 += (this.baseline.mq135 - this.threatTarget.mq135) * 0.22;
      }
    } else {
      // Natural gentle ambient noise
      const noise = () => (Math.random() - 0.5) * 3.5;
      this.current.mq2 = Math.max(140, this.baseline.mq2 + noise());
      this.current.mq3 = Math.max(120, this.baseline.mq3 + noise());
      this.current.mq135 = Math.max(160, this.baseline.mq135 + noise());
    }

    // Environmental fluctuation
    this.current.temp = +(this.baseline.temp + Math.sin(this.tickCount * 0.1) * 0.4 + (Math.random() - 0.5) * 0.15).toFixed(1);
    this.current.humidity = +(this.baseline.humidity + Math.cos(this.tickCount * 0.08) * 1.2 + (Math.random() - 0.5) * 0.3).toFixed(1);
    const heatIndex = +(this.current.temp + (this.current.humidity > 50 ? 0.8 : 0.3)).toFixed(1);

    // Compute threat level & ML confidence
    const maxRatio = Math.max(
      this.current.mq2 / this.thresholds.mq2,
      this.current.mq3 / this.thresholds.mq3,
      this.current.mq135 / this.thresholds.mq135
    );

    if (maxRatio >= 1.25) {
      this.threatLevel = 'THREAT';
      this.mlConfidence = +(88 + Math.min(11, (maxRatio - 1.25) * 15) + (Math.random() * 1.5)).toFixed(1);
    } else if (maxRatio >= 0.88) {
      this.threatLevel = 'WARNING';
      this.mlConfidence = +(68 + (maxRatio - 0.88) * 45 + (Math.random() * 2)).toFixed(1);
    } else {
      this.threatLevel = 'SAFE';
      this.mlConfidence = +(18 + (Math.random() * 8)).toFixed(1);
    }

    // Auto Actuator handling
    if (this.actuators.fanMode === 'AUTO') {
      if (this.threatLevel === 'THREAT' || this.threatLevel === 'WARNING') {
        this.actuators.fanState = 'ON';
        this.piMetrics.fanRpm = 4850;
      } else if (this.threatLevel === 'SAFE' && (!this.threatTarget || (this.current.mq2 < 260 && this.current.mq3 < 240))) {
        this.actuators.fanState = 'OFF';
        this.piMetrics.fanRpm = 0;
        this.threatTarget = null;
      }
    }

    // LED Mode sync
    if (this.threatLevel === 'THREAT') {
      this.actuators.ledMode = 'ALERT_RED';
    } else if (this.threatLevel === 'WARNING') {
      this.actuators.ledMode = 'WARN_AMBER';
    } else {
      this.actuators.ledMode = 'PULSE_TEAL';
    }

    // Update Pi 5 hardware metrics
    this.piMetrics.cpuUsage = +(22 + (this.actuators.fanState === 'ON' ? 12 : 0) + (Math.random() * 6)).toFixed(1);
    this.piMetrics.ramUsage = +(43.5 + Math.sin(this.tickCount * 0.05) * 1.5).toFixed(1);
    this.piMetrics.tempC = +(47.0 + (this.piMetrics.cpuUsage > 30 ? 4.2 : 0) + (Math.random() * 0.8)).toFixed(1);
    this.piMetrics.uptimeSeconds += 1;

    // GPS gentle waypoint wandering
    const dLat = (Math.random() - 0.48) * 0.00008;
    const dLon = (Math.random() - 0.48) * 0.00008;
    this.gps.lat = +(this.gps.lat + dLat).toFixed(6);
    this.gps.lon = +(this.gps.lon + dLon).toFixed(6);
    this.gps.altitude = +(42.0 + Math.sin(this.tickCount * 0.1) * 1.5).toFixed(1);
    this.gps.speed = +(0.4 + Math.random() * 0.8).toFixed(1);

    if (this.tickCount % 5 === 0) {
      this.gps.routeTrail.push([this.gps.lat, this.gps.lon]);
      if (this.gps.routeTrail.length > 40) this.gps.routeTrail.shift();
    }

    // Telemetry payload
    const telemetryPayload = {
      timestamp: new Date().toISOString(),
      is_simulation: true,
      source: 'simulation',
      hardware_online: false,
      mq2: Math.round(this.current.mq2),
      mq3: Math.round(this.current.mq3),
      mq135: Math.round(this.current.mq135),
      temp: this.current.temp,
      humidity: this.current.humidity,
      heat_index: heatIndex,
      threat_level: this.threatLevel,
      ml_confidence: this.mlConfidence,
      prediction: this.threatScenarioName || (this.threatLevel === 'THREAT' ? 'Threat Detected' : this.threatLevel === 'WARNING' ? 'Not Harmful' : 'Normal'),
      captured_image: this.latestSnapshot || null,
      actuators: this.actuators
    };

    // Log to DB every 6 ticks (approx every ~7 seconds) or immediately if THREAT
    if (this.tickCount % 6 === 0 || this.threatLevel === 'THREAT') {
      database.logTelemetry({
        mq2_smoke: telemetryPayload.mq2,
        mq3_alcohol: telemetryPayload.mq3,
        mq135_air: telemetryPayload.mq135,
        temp: telemetryPayload.temp,
        humidity: telemetryPayload.humidity,
        heat_index: telemetryPayload.heat_index,
        threat_level: telemetryPayload.threat_level,
        ml_confidence: telemetryPayload.ml_confidence
      }).catch(err => console.error('[Sim] DB log error:', err));
    }

    // Emit live tick
    this.emit('telemetry', telemetryPayload);
    this.emit('gps', this.gps);
    this.emit('diagnostics', this.piMetrics);
  }

  // Trigger scenario
  injectScenario(scenarioType) {
    console.log('[SimEngine] Injected scenario:', scenarioType);
    this.activeThreatScenario = scenarioType;

    // Ensure timer is running
    if (!this.timer) {
      this.start(1200);
    }

    let anomalyRecord = null;

    if (scenarioType === 'vapors') {
      // Alcohol / Ethanol vapor leak
      this.threatTarget = { mq2: 440, mq3: 880, mq135: 690 };
      this.current.mq2 = 440;
      this.current.mq3 = 880;
      this.current.mq135 = 690;
      this.threatLevel = 'THREAT';
      this.mlConfidence = 97.4;
      this.threatScenarioName = 'Vapor Plume / Ethanol Derivative';
      const snap = cameraService.captureSnapshot({ threat_type: 'Vapor Plume / Ethanol Derivative' });
      this.latestSnapshot = snap.url;
      anomalyRecord = {
        threat_type: 'Vapor Plume / Ethanol Derivative',
        severity: 'CRITICAL',
        confidence: 97.4,
        mq2: 440,
        mq3: 880,
        mq135: 690,
        snapshot_url: snap.url,
        lat: this.gps.lat,
        lon: this.gps.lon
      };
    } else if (scenarioType === 'combustion') {
      // Combustion / LPG Gas leak
      this.threatTarget = { mq2: 920, mq3: 310, mq135: 640 };
      this.current.mq2 = 920;
      this.current.mq3 = 310;
      this.current.mq135 = 640;
      this.threatLevel = 'THREAT';
      this.mlConfidence = 95.8;
      this.threatScenarioName = 'Combustion Trace / LPG Anomaly';
      const snap = cameraService.captureSnapshot({ threat_type: 'Combustion Trace / LPG Anomaly' });
      this.latestSnapshot = snap.url;
      anomalyRecord = {
        threat_type: 'Combustion Trace / LPG Anomaly',
        severity: 'CRITICAL',
        confidence: 95.8,
        mq2: 920,
        mq3: 310,
        mq135: 640,
        snapshot_url: snap.url,
        lat: this.gps.lat,
        lon: this.gps.lon
      };
    } else if (scenarioType === 'powder') {
      // Chemical Threat trigger
      this.threatTarget = { mq2: 410, mq3: 380, mq135: 620 };
      this.current.mq2 = 410;
      this.current.mq3 = 380;
      this.current.mq135 = 620;
      this.threatLevel = 'THREAT';
      this.mlConfidence = 91.5;
      this.threatScenarioName = 'Chemical Threat Detected';
      const snap = cameraService.captureSnapshot({ threat_type: 'Chemical Threat Detected' });
      this.latestSnapshot = snap.url;
      anomalyRecord = {
        threat_type: 'Chemical Threat Detected',
        severity: 'WARNING',
        confidence: 91.5,
        mq2: 410,
        mq3: 380,
        mq135: 620,
        snapshot_url: snap.url,
        lat: this.gps.lat,
        lon: this.gps.lon
      };
    } else if (scenarioType === 'purge') {
      this.purgeChamber();
      return;
    }

    if (anomalyRecord) {
      database.logAnomaly(anomalyRecord).then(res => {
        this.emit('anomaly_created', { id: res.id, ...anomalyRecord, timestamp: new Date().toISOString() });
      });
    }

    // Immediately tick so UI updates instantly!
    this.tick();
  }

  purgeChamber() {
    console.log('[SimEngine] Purging sensor chamber...');
    this.actuators.fanState = 'ON';
    this.piMetrics.fanRpm = 5200;
    this.threatTarget = null;
    this.threatScenarioName = 'Normal';
    this.latestSnapshot = null;
    this.current = { ...this.baseline };
    this.threatLevel = 'SAFE';
    this.mlConfidence = 21.0;
    
    if (!this.timer) {
      this.start(1200);
    }
    this.tick();

    setTimeout(() => {
      if (this.actuators.fanMode === 'AUTO') {
        this.actuators.fanState = 'OFF';
        this.piMetrics.fanRpm = 0;
      }
      this.tick();
    }, 3000);
  }

  calibrateSensors() {
    console.log('[SimEngine] Calibrating / Taring sensors to clean air baseline...');
    this.baseline.mq2 = Math.round(this.current.mq2 * 0.9);
    this.baseline.mq3 = Math.round(this.current.mq3 * 0.9);
    this.baseline.mq135 = Math.round(this.current.mq135 * 0.9);
    this.threatTarget = null;
    return { success: true, baseline: this.baseline };
  }

  setActuator(key, value) {
    if (key === 'fanMode') {
      this.actuators.fanMode = value;
      if (value === 'ON') this.actuators.fanState = 'ON';
      if (value === 'OFF') this.actuators.fanState = 'OFF';
    } else if (key === 'fanState') {
      this.actuators.fanState = value;
      this.piMetrics.fanRpm = value === 'ON' ? 4800 : 0;
    } else if (key === 'buzzerState') {
      this.actuators.buzzerState = value;
    } else if (key === 'ledMode') {
      this.actuators.ledMode = value;
    }
    this.emit('actuator_update', this.actuators);
  }

  setThresholds(newThresh) {
    this.thresholds = { ...this.thresholds, ...newThresh };
    return this.thresholds;
  }
}

module.exports = new SimulationEngine();
