const path = require('path');
const fs = require('fs');

let sqlite3 = null;
let db = null;

try {
  sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'narco_nose.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.warn('[Database] SQLite disk file notice, using memory fallback:', err.message);
      db = null;
    } else {
      console.log('Connected to SQLite database at', dbPath);
      initTables();
    }
  });
} catch (loadErr) {
  console.warn('[Database] SQLite native binary notice (using memory store fallback):', loadErr.message);
  db = null;
}

// In-memory fallback store
const memStore = {
  telemetry: [],
  anomalies: [
    {
      id: 1,
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      threat_type: "Vapor Plume / Ethanol Derivative",
      severity: "CRITICAL",
      confidence: 96.4,
      mq2: 685,
      mq3: 840,
      mq135: 720,
      lat: 37.7749,
      lon: -122.4194,
      snapshot_url: "/snapshots/threat_sample_1.jpg"
    }
  ],
  settings: {
    fan_mode: 'AUTO',
    fan_state: 'OFF',
    buzzer_state: 'ARMED',
    led_mode: 'PULSE_TEAL',
    mq2_threshold: '420',
    mq3_threshold: '380',
    mq135_threshold: '550',
    confidence_threshold: '85',
    mqtt_host: '127.0.0.1',
    mqtt_port: '1883',
    mqtt_topic_prefix: 'narconose/'
  }
};

function initTables() {
  db.serialize(() => {
    // Telemetry log table
    db.run(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        mq2_smoke REAL,
        mq3_alcohol REAL,
        mq135_air REAL,
        temp REAL,
        humidity REAL,
        heat_index REAL,
        threat_level TEXT,
        ml_confidence REAL
      )
    `);

    // Threat anomaly events table
    db.run(`
      CREATE TABLE IF NOT EXISTS anomalies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        threat_type TEXT,
        severity TEXT,
        confidence REAL,
        mq2 REAL,
        mq3 REAL,
        mq135 REAL,
        snapshot_url TEXT,
        lat REAL,
        lon REAL,
        resolved INTEGER DEFAULT 0
      )
    `);

    // Settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Seed initial settings if not present
    const defaultSettings = [
      ['fan_mode', 'AUTO'],
      ['fan_state', 'OFF'],
      ['buzzer_state', 'ARMED'],
      ['led_mode', 'PULSE_TEAL'],
      ['mq2_threshold', '420'],
      ['mq3_threshold', '380'],
      ['mq135_threshold', '550'],
      ['confidence_threshold', '85'],
      ['mqtt_host', '192.168.1.100'],
      ['mqtt_port', '1883'],
      ['mqtt_topic_prefix', 'narconose/']
    ];

    defaultSettings.forEach(([key, val]) => {
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, val]);
    });

    // Check if anomalies has records; if not, seed realistic historical threat logs
    db.get("SELECT COUNT(*) as count FROM anomalies", (err, row) => {
      if (!err && row && row.count === 0) {
        seedInitialHistory();
      }
    });
  });
}

function seedInitialHistory() {
  const sampleEvents = [
    {
      offsetMin: 22,
      threat_type: "Vapor Plume / Ethanol Derivative",
      severity: "CRITICAL",
      confidence: 96.4,
      mq2: 685,
      mq3: 840,
      mq135: 720,
      lat: 37.7749,
      lon: -122.4194,
      snapshot_url: "/snapshots/threat_sample_1.jpg"
    },
    {
      offsetMin: 78,
      threat_type: "Combustion Trace / LPG Anomaly",
      severity: "WARNING",
      confidence: 84.2,
      mq2: 520,
      mq3: 310,
      mq135: 460,
      lat: 37.7752,
      lon: -122.4188,
      snapshot_url: "/snapshots/threat_sample_2.jpg"
    },
    {
      offsetMin: 185,
      threat_type: "Chemical Container Detected (Optical Capture)",
      severity: "WARNING",
      confidence: 88.7,
      mq2: 340,
      mq3: 290,
      mq135: 410,
      lat: 37.7758,
      lon: -122.4175,
      snapshot_url: "/snapshots/threat_sample_3.jpg"
    },
    {
      offsetMin: 340,
      threat_type: "Air Quality Degradation / Ammonia Trace",
      severity: "WARNING",
      confidence: 78.5,
      mq2: 310,
      mq3: 270,
      mq135: 610,
      lat: 37.7761,
      lon: -122.4162,
      snapshot_url: "/snapshots/threat_sample_1.jpg"
    }
  ];

  sampleEvents.forEach(evt => {
    const timestamp = new Date(Date.now() - evt.offsetMin * 60 * 1000).toISOString();
    db.run(
      `INSERT INTO anomalies (timestamp, threat_type, severity, confidence, mq2, mq3, mq135, snapshot_url, lat, lon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [timestamp, evt.threat_type, evt.severity, evt.confidence, evt.mq2, evt.mq3, evt.mq135, evt.snapshot_url, evt.lat, evt.lon]
    );
  });

  // Also seed 30 telemetry data points over past 30 minutes
  for (let i = 30; i >= 0; i--) {
    const ts = new Date(Date.now() - i * 60 * 1000).toISOString();
    const mq2 = Math.round(180 + Math.random() * 40 + (i === 22 ? 400 : 0));
    const mq3 = Math.round(160 + Math.random() * 35 + (i === 22 ? 550 : 0));
    const mq135 = Math.round(210 + Math.random() * 50 + (i === 22 ? 420 : 0));
    const temp = +(23.4 + (Math.random() * 0.8)).toFixed(1);
    const humidity = +(44.0 + (Math.random() * 3.0)).toFixed(1);
    const threat_level = (mq2 > 400 || mq3 > 400) ? 'THREAT' : ((mq2 > 300 || mq3 > 300) ? 'WARNING' : 'SAFE');
    const ml_conf = threat_level === 'THREAT' ? 95 : (threat_level === 'WARNING' ? 82 : 24);

    db.run(
      `INSERT INTO telemetry (timestamp, mq2_smoke, mq3_alcohol, mq135_air, temp, humidity, heat_index, threat_level, ml_confidence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ts, mq2, mq3, mq135, temp, humidity, temp + 0.5, threat_level, ml_conf]
    );
  }
}

// Database helper promises
// Database helper promises with fallback
function logTelemetry(data) {
  if (!db) {
    const entry = { id: memStore.telemetry.length + 1, timestamp: new Date().toISOString(), ...data };
    memStore.telemetry.push(entry);
    if (memStore.telemetry.length > 500) memStore.telemetry.shift();
    return Promise.resolve(entry);
  }
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO telemetry (mq2_smoke, mq3_alcohol, mq135_air, temp, humidity, heat_index, threat_level, ml_confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      sql,
      [data.mq2_smoke, data.mq3_alcohol, data.mq135_air, data.temp, data.humidity, data.heat_index, data.threat_level, data.ml_confidence],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

function logAnomaly(data) {
  if (!db) {
    const entry = { id: memStore.anomalies.length + 1, timestamp: new Date().toISOString(), ...data };
    memStore.anomalies.unshift(entry);
    if (memStore.anomalies.length > 200) memStore.anomalies.pop();
    return Promise.resolve(entry);
  }
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO anomalies (threat_type, severity, confidence, mq2, mq3, mq135, snapshot_url, lat, lon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      sql,
      [data.threat_type, data.severity, data.confidence, data.mq2, data.mq3, data.mq135, data.snapshot_url || '/snapshots/threat_sample_1.jpg', data.lat || 37.7749, data.lon || -122.4194],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

function getRecentTelemetry(limit = 100) {
  if (!db) {
    return Promise.resolve(memStore.telemetry.slice(-limit));
  }
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM telemetry ORDER BY id DESC LIMIT ?`, [limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows ? rows.reverse() : []);
    });
  });
}

function getAnomalies(limit = 50) {
  if (!db) {
    return Promise.resolve(memStore.anomalies.slice(0, limit));
  }
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM anomalies ORDER BY id DESC LIMIT ?`, [limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getSettings() {
  if (!db) {
    return Promise.resolve(memStore.settings);
  }
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM settings`, [], (err, rows) => {
      if (err) reject(err);
      else {
        const obj = {};
        rows.forEach(r => obj[r.key] = r.value);
        resolve(obj);
      }
    });
  });
}

function updateSetting(key, value) {
  if (!db) {
    memStore.settings[key] = String(value);
    return Promise.resolve({ success: true });
  }
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, String(value)],
      function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
}

module.exports = {
  db,
  logTelemetry,
  logAnomaly,
  getRecentTelemetry,
  getAnomalies,
  getSettings,
  updateSetting
};
