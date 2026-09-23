const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const database = require('./database');
const mqttService = require('./mqtt_service');
const simEngine = require('./simulation_engine');
const cameraService = require('./camera_service');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e7 // 10 MB payload limit to safely accommodate camera frames
});

const PORT = process.env.PORT || 5000;

// Ensure snapshots directory exists
const snapshotsDir = path.join(__dirname, '../public/snapshots');
if (!fs.existsSync(snapshotsDir)) {
  fs.mkdirSync(snapshotsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/snapshots', express.static(path.join(__dirname, '../public/snapshots')));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../public')));

// -------------------------------------------------------------
// TELEMETRY & THREAT CAMERA INGESTION PIPELINE
// -------------------------------------------------------------

/**
 * Normalizes telemetry from Pi (supports both flat and nested schemas),
 * decodes Base64 images to static files on disk, logs threats to SQLite,
 * and returns a lightweight payload safe for WebSockets and React charts.
 */
async function processThreatPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return null;

  // 1. Unpack sensor readings (support both nested "sensors" object and flat keys, DHT11 temp/humidity)
  const sensors = rawPayload.sensors || {};
  const mq2 = Number(rawPayload.mq2 ?? sensors.mq2 ?? rawPayload.mq2_smoke ?? 0);
  const mq3 = Number(rawPayload.mq3 ?? sensors.mq3 ?? rawPayload.mq3_alcohol ?? 0);
  const mq135 = Number(rawPayload.mq135 ?? sensors.mq135 ?? rawPayload.mq135_air ?? 0);
  const temp = Number(rawPayload.temp ?? rawPayload.temperature ?? sensors.temperature ?? sensors.temp ?? 24.0);
  const humidity = Number(rawPayload.humidity ?? sensors.humidity ?? 45.0);
  const heat_index = Number(rawPayload.heat_index ?? (temp + 0.4));

  // 2. ML Prediction & Threat Classification (supports explicit "threat", "not harmful", "normal")
  const rawPred = String(rawPayload.prediction || rawPayload.output || rawPayload.status || '').toLowerCase().trim();
  const confidence = Number(rawPayload.confidence ?? rawPayload.ml_confidence ?? (rawPred.includes('threat') ? 88.5 : 15.0));

  let threat_level = 'SAFE';
  let formattedPrediction = rawPayload.prediction || 'normal';

  if (
    rawPred === 'threat' ||
    rawPred.includes('threat_detected') ||
    rawPred.includes('threat detected') ||
    (rawPred.includes('threat') && !rawPred.includes('no threat')) ||
    (rawPred.includes('harmful') && !rawPred.includes('not harmful') && !rawPred.includes('not_harmful')) ||
    rawPayload.threat_level === 'THREAT'
  ) {
    threat_level = 'THREAT';
    formattedPrediction = rawPayload.prediction || 'Threat Detected';
  } else if (
    rawPred === 'not harmful' ||
    rawPred === 'not_harmful' ||
    rawPred === 'warning' ||
    rawPred.includes('caution') ||
    rawPayload.threat_level === 'WARNING'
  ) {
    threat_level = 'WARNING';
    formattedPrediction = rawPayload.prediction || 'Not Harmful';
  } else {
    threat_level = 'SAFE';
    formattedPrediction = rawPayload.prediction || 'Normal';
  }

  const isThreat = threat_level === 'THREAT';
  const ml_confidence = confidence;

  // 3. Process captured camera image if present from OpenCV cv2 (Base64 -> disk file -> static URL)
  let snapshotUrl = null;
  const rawImg = rawPayload.captured_image || rawPayload.image || rawPayload.photo;
  if (rawImg && typeof rawImg === 'string') {
    const imgStr = rawImg.trim();
    if (imgStr.startsWith('/snapshots') || imgStr.startsWith('http')) {
      snapshotUrl = imgStr;
    } else {
      try {
        const base64Data = imgStr.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `threat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`;
        const filepath = path.join(snapshotsDir, filename);
        await fs.promises.writeFile(filepath, buffer);
        snapshotUrl = `/snapshots/${filename}`;
        console.log(`[OpenCV Camera Trigger] Saved threat snapshot: ${snapshotUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.error('[OpenCV Camera Trigger] Failed to save base64 image to disk:', err.message);
      }
    }
  }

  const timestamp = rawPayload.timestamp || new Date().toISOString();

  const normalized = {
    timestamp,
    mq2,
    mq3,
    mq135,
    temp,
    humidity,
    heat_index: +heat_index.toFixed(1),
    threat_level,
    ml_confidence,
    prediction: formattedPrediction,
    confidence,
    probabilities: rawPayload.probabilities || { safe: +(100 - confidence).toFixed(1), [formattedPrediction]: confidence },
    captured_image: snapshotUrl,
    actuators: rawPayload.actuators || {
      ...simEngine.actuators,
      buzzerState: isThreat ? 'ALARMING' : 'ARMED'
    }
  };

  // 4. Log to SQLite anomalies table if threat or snapshot captured
  if (isThreat || snapshotUrl) {
    try {
      const threatType = (formattedPrediction || 'Chemical Threat Detected')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      const anomalyRecord = {
        threat_type: threatType,
        severity: confidence >= 90 ? 'CRITICAL' : 'WARNING',
        confidence: ml_confidence,
        mq2,
        mq3,
        mq135,
        snapshot_url: snapshotUrl,
        lat: simEngine.gps?.lat || 37.774929,
        lon: simEngine.gps?.lon || -122.419416
      };

      const dbRes = await database.logAnomaly(anomalyRecord);
      const alertEvent = { id: dbRes.id, ...anomalyRecord, timestamp, url: snapshotUrl };
      io.emit('threat_alert', alertEvent);
      console.log(`[Anomaly Logged] Threat event recorded in SQLite (ID #${dbRes.id})`);
    } catch (dbErr) {
      console.error('[Database] Failed to record anomaly:', dbErr.message);
    }
  }

  // 5. Save standard telemetry tick to SQLite
  try {
    await database.logTelemetry({
      mq2_smoke: mq2,
      mq3_alcohol: mq3,
      mq135_air: mq135,
      temp,
      humidity,
      heat_index: +heat_index.toFixed(1),
      threat_level,
      ml_confidence
    });
  } catch (err) {
    // Non-fatal telemetry log error
  }

  return normalized;
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// System Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    mqtt: mqttService.getStatus(),
    simulation_active: true,
    threat_level: simEngine.threatLevel,
    ml_confidence: simEngine.mlConfidence
  });
});

// Telemetry recent
app.get('/api/telemetry/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 60;
    const data = await database.getRecentTelemetry(limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// HARDWARE INGESTION ENDPOINTS (Push data from Raspberry Pi to Website)
// -------------------------------------------------------------

// Ingestion API: Receive real hardware telemetry from external Raspberry Pi
app.post('/api/telemetry', async (req, res) => {
  try {
    const raw = req.body || {};

    // When real telemetry arrives from Pi, pause the mock simulation
    if (simEngine.timer) {
      simEngine.stop();
      console.log('[Hardware Ingest] Real Pi Telemetry detected — stopped mock simulator.');
    }

    const telemetryData = await processThreatPayload(raw);
    if (telemetryData) {
      io.emit('sensor_update', telemetryData);
    }

    res.json({ success: true, message: 'Telemetry processed', captured_image: telemetryData?.captured_image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hardware Ingestion: GPS coordinates from Pi
app.post('/api/gps', (req, res) => {
  try {
    const gpsData = req.body || {};
    io.emit('gps_update', gpsData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hardware Ingestion: Diagnostics (CPU, RAM, Temp) from Pi
app.post('/api/diagnostics', (req, res) => {
  try {
    const diagData = req.body || {};
    io.emit('pi_diagnostics', diagData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hardware Ingestion: YOLO Detections from Pi Model
app.post('/api/camera/yolo', (req, res) => {
  try {
    const data = req.body || {};
    if (Array.isArray(data.detections)) {
      cameraService.updateDetections(data.detections);
    }
    io.emit('yolo_update', cameraService.getDetectionState());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Threat Anomaly history
app.get('/api/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const anomalies = await database.getAnomalies(limit);
    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings & Thresholds
app.get('/api/settings', async (req, res) => {
  try {
    const dbSettings = await database.getSettings();
    res.json({
      ...dbSettings,
      actuators: simEngine.actuators,
      thresholds: simEngine.thresholds
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    for (const [k, v] of Object.entries(updates)) {
      await database.updateSetting(k, v);
    }
    if (updates.thresholds) {
      simEngine.setThresholds(updates.thresholds);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actuator Commands (Bi-directional MQTT & Sim)
app.post('/api/actuators', (req, res) => {
  const { actuator, state, mode } = req.body;
  if (actuator === 'fan') {
    if (mode) simEngine.setActuator('fanMode', mode);
    if (state) simEngine.setActuator('fanState', state);
    mqttService.publish('actuators/fan', { mode, state });
  } else if (actuator === 'buzzer') {
    simEngine.setActuator('buzzerState', state);
    mqttService.publish('actuators/buzzer', { state });
  } else if (actuator === 'leds') {
    simEngine.setActuator('ledMode', mode);
    mqttService.publish('actuators/leds', { mode });
  }

  io.emit('actuator_update', simEngine.actuators);
  res.json({ success: true, actuators: simEngine.actuators });
});

// Calibration / Tare
app.post('/api/calibrate', (req, res) => {
  const result = simEngine.calibrateSensors();
  mqttService.publish('commands/calibrate', { tare: true, timestamp: Date.now() });
  io.emit('calibration_complete', result);
  res.json(result);
});

// Simulate Threat Injection
app.post('/api/simulate', (req, res) => {
  const { scenario } = req.body;
  simEngine.injectScenario(scenario);
  res.json({ success: true, scenario });
});

// Camera endpoints
app.get('/api/camera/detections', (req, res) => {
  res.json(cameraService.getDetectionState());
});

app.post('/api/camera/snapshot', (req, res) => {
  const meta = req.body || {};
  const snap = cameraService.captureSnapshot(meta);
  
  // Also log to DB if associated with threat
  if (meta.threat_type) {
    database.logAnomaly({
      threat_type: meta.threat_type,
      severity: meta.severity || 'WARNING',
      confidence: meta.confidence || 92.0,
      mq2: simEngine.current.mq2,
      mq3: simEngine.current.mq3,
      mq135: simEngine.current.mq135,
      snapshot_url: snap.url,
      lat: simEngine.gps.lat,
      lon: simEngine.gps.lon
    }).then(dbRes => {
      io.emit('anomaly_created', { id: dbRes.id, ...snap });
    });
  }

  res.json(snap);
});

// Live Video stream & frame endpoints
app.get('/stream/video.mjpg', (req, res) => {
  cameraService.handleStream(req, res);
});

app.get('/stream/frame.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(cameraService.generateFrameSVG());
});

// Telemetry Export (CSV / JSON)
app.get('/api/export/csv', async (req, res) => {
  try {
    const rows = await database.getRecentTelemetry(500);
    const headers = 'ID,Timestamp,MQ2_Smoke,MQ3_Alcohol,MQ135_Air,Temperature,Humidity,Heat_Index,Threat_Level,ML_Confidence\n';
    const csvLines = rows.map(r => 
      `${r.id},"${r.timestamp}",${r.mq2_smoke},${r.mq3_alcohol},${r.mq135_air},${r.temp},${r.humidity},${r.heat_index},"${r.threat_level}",${r.ml_confidence}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="narco_nose_telemetry.csv"');
    res.send(headers + csvLines);
  } catch (err) {
    res.status(500).send('Export error: ' + err.message);
  }
});

app.get('/api/export/json', async (req, res) => {
  try {
    const rows = await database.getRecentTelemetry(500);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="narco_nose_telemetry.json"');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback for frontend client routing
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.url.startsWith('/api') || req.url.startsWith('/stream') || req.url.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// -------------------------------------------------------------
// WEBSOCKET (SOCKET.IO) WIRE-UP
// -------------------------------------------------------------
io.on('connection', (socket) => {
  console.log('[Socket.IO] Client connected:', socket.id);

  // Send initial handshake state
  socket.emit('sensor_update', {
    timestamp: new Date().toISOString(),
    mq2: Math.round(simEngine.current.mq2),
    mq3: Math.round(simEngine.current.mq3),
    mq135: Math.round(simEngine.current.mq135),
    temp: simEngine.current.temp,
    humidity: simEngine.current.humidity,
    heat_index: +(simEngine.current.temp + 0.4).toFixed(1),
    threat_level: simEngine.threatLevel,
    ml_confidence: simEngine.mlConfidence,
    actuators: simEngine.actuators
  });

  socket.emit('gps_update', simEngine.gps);
  socket.emit('pi_diagnostics', simEngine.piMetrics);
  socket.emit('actuator_update', simEngine.actuators);
  socket.emit('yolo_update', cameraService.getDetectionState());

  // Handle client commands
  socket.on('set_actuator', (data) => {
    const { actuator, state, mode } = data;
    if (actuator === 'fan') {
      if (mode) simEngine.setActuator('fanMode', mode);
      if (state) simEngine.setActuator('fanState', state);
      mqttService.publish('actuators/fan', { mode, state });
    } else if (actuator === 'buzzer') {
      simEngine.setActuator('buzzerState', state);
      mqttService.publish('actuators/buzzer', { state });
    } else if (actuator === 'leds') {
      simEngine.setActuator('ledMode', mode);
      mqttService.publish('actuators/leds', { mode });
    }
    io.emit('actuator_update', simEngine.actuators);
  });

  socket.on('calibrate', () => {
    const res = simEngine.calibrateSensors();
    io.emit('calibration_complete', res);
  });

  socket.on('trigger_scenario', (scenario) => {
    simEngine.injectScenario(scenario);
  });

  socket.on('toggle_bounding_boxes', (enabled) => {
    cameraService.setBoundingBoxesEnabled(enabled);
    io.emit('yolo_update', cameraService.getDetectionState());
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id);
  });
});

// Wire simulation engine events to Socket.io & MQTT
simEngine.on('telemetry', (payload) => {
  io.emit('sensor_update', payload);
  mqttService.publish('telemetry', payload);
});

simEngine.on('gps', (payload) => {
  io.emit('gps_update', payload);
});

simEngine.on('diagnostics', (payload) => {
  io.emit('pi_diagnostics', payload);
});

simEngine.on('anomaly_created', (anomaly) => {
  io.emit('threat_alert', anomaly);
});

// Wire MQTT messages from external hardware into system
mqttService.on('telemetry', async (data) => {
  if (simEngine.timer) {
    simEngine.stop();
    console.log('[Hardware Ingest] Real Pi MQTT Telemetry detected — stopped mock simulator.');
  }
  const telemetryData = await processThreatPayload(data);
  if (telemetryData) {
    io.emit('sensor_update', telemetryData);
  }
});

mqttService.on('gps', (data) => {
  io.emit('gps_update', data);
});

mqttService.on('diagnostics', (data) => {
  io.emit('pi_diagnostics', data);
});

// Start services
mqttService.init();
simEngine.start(1200);

// Start HTTP server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Narco Nose Full-Stack Server listening on port ${PORT}`);
  console.log(`MJPEG Video Stream: http://localhost:${PORT}/stream/video.mjpg`);
  console.log(`REST API:          http://localhost:${PORT}/api/status`);
  console.log(`====================================================`);
});
