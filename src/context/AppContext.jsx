import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home');
  const [sensorViewMode, setSensorViewMode] = useState('simple'); // 'simple' | 'advanced'
  const [connected, setConnected] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState({
    timestamp: new Date().toISOString(),
    is_simulation: true,
    source: 'simulation',
    hardware_online: false,
    mq2: 210,
    mq3: 185,
    mq135: 230,
    temp: 24.1,
    humidity: 45.3,
    heat_index: 24.5,
    threat_level: 'SAFE',
    ml_confidence: 22.4,
    actuators: {
      fanMode: 'AUTO',
      fanState: 'OFF',
      buzzerState: 'ARMED',
      ledMode: 'PULSE_BLUE'
    }
  });

  // Rolling points for real-time charts (last 30 seconds)
  const [telemetryStream, setTelemetryStream] = useState([]);

  // Actuator states
  const [actuators, setActuators] = useState({
    fanMode: 'AUTO',
    fanState: 'OFF',
    buzzerState: 'ARMED',
    ledMode: 'PULSE_BLUE'
  });

  // GPS coordinates & tracking (Default: University of Engineering & Management, UEM Kolkata)
  const [gps, setGps] = useState({
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
  });

  // Pi 5 Hardware Diagnostics
  const [diagnostics, setDiagnostics] = useState({
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
  });

  // Optical Detections
  const [detections, setDetections] = useState([]);
  const [boundingBoxesEnabled, setBoundingBoxesEnabled] = useState(true);

  // History Anomalies
  const [anomalies, setAnomalies] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  // System Notification Toast
  const [notification, setNotification] = useState(null);

  // Dismissed Snapshot Tracker (prevents recurring simulator ticks from un-dismissing)
  const dismissedSnapshotRef = useRef(null);
  const [dismissedSnapshot, setDismissedSnapshot] = useState(null);

  const socketRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setAnomalies(data))
      .catch(err => console.warn('Could not load history:', err));

    fetch('/api/camera/detections')
      .then(res => res.json())
      .then(data => {
        if (data && data.activeDetections) {
          setDetections(data.activeDetections);
        }
      })
      .catch(err => console.warn('Could not load detections:', err));

    // Connect Socket.io
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('sensor_update', (data) => {
      // Normalize data safely (supports nested sensors, confidence, and prediction)
      const sensors = data.sensors || {};
      const pred = String(data.prediction || data.output || data.status || '').toLowerCase().trim();
      let threatLevel = data.threat_level;
      if (!threatLevel) {
        if (
          pred === 'threat' ||
          pred.includes('threat_detected') ||
          pred.includes('threat detected') ||
          (pred.includes('threat') && !pred.includes('no threat')) ||
          (pred.includes('harmful') && !pred.includes('not harmful') && !pred.includes('not_harmful'))
        ) {
          threatLevel = 'THREAT';
        } else if (pred === 'not harmful' || pred === 'not_harmful' || pred.includes('warning') || pred.includes('caution')) {
          threatLevel = 'WARNING';
        } else {
          threatLevel = 'SAFE';
        }
      }

      const isSim = data.is_simulation !== undefined ? Boolean(data.is_simulation) : (data.source !== 'hardware');
      const isHw = Boolean(data.hardware_online) || (data.source === 'hardware');

      const normalizedData = {
        ...data,
        is_simulation: isSim,
        source: isHw ? 'hardware' : 'simulation',
        hardware_online: isHw,
        mq2: Number(data.mq2 ?? sensors.mq2 ?? 0),
        mq3: Number(data.mq3 ?? sensors.mq3 ?? 0),
        mq135: Number(data.mq135 ?? sensors.mq135 ?? 0),
        temp: Number(data.temp ?? data.temperature ?? sensors.temperature ?? sensors.temp ?? 24.0),
        humidity: Number(data.humidity ?? sensors.humidity ?? 45.0),
        ml_confidence: Number(data.confidence ?? data.ml_confidence ?? (threatLevel === 'THREAT' ? 88 : threatLevel === 'WARNING' ? 65 : 20)),
        threat_level: threatLevel,
        prediction: data.prediction || (threatLevel === 'THREAT' ? 'Threat Detected' : threatLevel === 'WARNING' ? 'Not Harmful' : 'Normal')
      };

      setTelemetry(prev => {
        let resolvedImage = prev.captured_image;
        const incomingImage = normalizedData.captured_image;
        if (incomingImage !== undefined) {
          if (incomingImage && incomingImage !== dismissedSnapshotRef.current) {
            resolvedImage = incomingImage;
            dismissedSnapshotRef.current = null;
            setDismissedSnapshot(null);
          } else if (!incomingImage || incomingImage === dismissedSnapshotRef.current) {
            resolvedImage = null;
          }
        }
        return {
          ...normalizedData,
          captured_image: resolvedImage
        };
      });
      if (data.actuators) {
        setActuators(data.actuators);
      }

      // Memory & Canvas Guardrail:
      // Exclude heavy captured_image strings from the rolling 25-point chart stream
      const { captured_image, ...chartPoint } = normalizedData;
      setTelemetryStream(prev => {
        const timeLabel = new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const next = [...prev, { ...chartPoint, timeLabel }];
        return next.slice(-25); // keep last 25 ticks
      });
    });

    socket.on('gps_update', (data) => {
      if (!data) return;
      let lat = Number(data.lat ?? data.latitude);
      let lon = Number(data.lon ?? data.lng ?? data.longitude);
      // Fallback to UEM Kolkata if GPS module on Pi has no satellite lock or sends invalid coordinates
      if (!lat || Math.abs(lat) < 0.001 || isNaN(lat)) lat = 22.560264;
      if (!lon || Math.abs(lon) < 0.001 || isNaN(lon)) lon = 88.490171;
      setGps(prev => ({
        ...prev,
        ...data,
        lat,
        lon,
        routeTrail: data.routeTrail && data.routeTrail.length > 0 ? data.routeTrail : (prev.routeTrail || [[lat, lon]])
      }));
    });

    socket.on('pi_diagnostics', (data) => {
      setDiagnostics(data);
    });

    socket.on('actuator_update', (data) => {
      setActuators(data);
    });

    socket.on('camera_update', (data) => {
      if (data && data.activeDetections) {
        setDetections(data.activeDetections);
      }
    });

    socket.on('snapshot_dismissed', () => {
      setTelemetry(prev => ({ ...prev, captured_image: null }));
    });

    socket.on('threat_alert', (anomaly) => {
      setAnomalies(prev => [anomaly, ...prev]);
      if (anomaly.snapshot_url || anomaly.url) {
        setTelemetry(prev => ({
          ...prev,
          captured_image: anomaly.snapshot_url || anomaly.url,
          prediction: anomaly.threat_type || prev.prediction,
          confidence: anomaly.confidence || prev.confidence
        }));
      }
      setNotification({
        type: 'threat',
        title: `${anomaly.threat_type}`,
        message: `Severity: ${anomaly.severity} | Confidence: ${anomaly.confidence}%`,
        timestamp: new Date().toLocaleTimeString(),
        snapshot_url: anomaly.snapshot_url || anomaly.url
      });
    });

    socket.on('calibration_complete', (res) => {
      setNotification({
        type: 'success',
        title: 'Sensor Calibration Complete',
        message: 'MQ-2, MQ-3, and MQ-135 tared to clean air baseline.',
        timestamp: new Date().toLocaleTimeString()
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Actuator Trigger Action
  const setActuator = (actuator, state, mode) => {
    fetch('/api/actuators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actuator, state, mode })
    }).catch(err => console.error(err));
  };

  // Sensor Calibration Action
  const calibrate = () => {
    fetch('/api/calibrate', { method: 'POST' })
      .catch(err => console.error(err));
  };

  // Threat Injection Action
  const triggerScenario = (scenario) => {
    fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    }).catch(err => console.error(err));
  };

  // Camera Snapshot Action
  const captureSnapshot = async (meta = {}) => {
    try {
      const res = await fetch('/api/camera/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
      });
      const data = await res.json();
      setSelectedSnapshot(data);
      setNotification({
        type: 'info',
        title: 'Snapshot Captured',
        message: `Saved incident photo from edge camera`,
        timestamp: new Date().toLocaleTimeString()
      });
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Camera View Overlays
  const toggleBoundingBoxes = () => {
    const nextVal = !boundingBoxesEnabled;
    setBoundingBoxesEnabled(nextVal);
    if (socketRef.current) {
      socketRef.current.emit('toggle_bounding_boxes', nextVal);
    }
  };

  const dismissThreatSnapshot = () => {
    const currentImg = telemetry.captured_image;
    dismissedSnapshotRef.current = currentImg;
    setDismissedSnapshot(currentImg);
    setTelemetry(prev => ({ ...prev, captured_image: null }));
    if (socketRef.current) {
      socketRef.current.emit('dismiss_snapshot');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sensorViewMode,
        setSensorViewMode,
        connected,
        mqttConnected,
        telemetry,
        telemetryStream,
        actuators,
        setActuator,
        gps,
        diagnostics,
        detections,
        boundingBoxesEnabled,
        toggleBoundingBoxes,
        anomalies,
        selectedSnapshot,
        setSelectedSnapshot,
        notification,
        setNotification,
        calibrate,
        triggerScenario,
        captureSnapshot,
        dismissThreatSnapshot,
        dismissedSnapshot
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
