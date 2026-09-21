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

  // GPS coordinates & tracking
  const [gps, setGps] = useState({
    lat: 37.774929,
    lon: -122.419416,
    altitude: 42.5,
    speed: 0.6,
    satellites: 9,
    fix: '3D Fix',
    hdop: 1.1,
    routeTrail: [
      [37.7745, -122.4198],
      [37.7747, -122.4196],
      [37.774929, -122.419416]
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
      dht22: { online: true, i2c: '0x38', status: 'Nominal' },
      gps_neo6m: { online: true, port: '/dev/ttyAMA0', baud: 9600, status: 'Fix 3D' },
      camera_usb: { online: true, fps: 29.8, status: 'Streaming' },
      ads1115_adc: { online: true, address: '0x48', status: 'Ready' }
    }
  });

  // YOLO Camera Detections
  const [detections, setDetections] = useState([]);
  const [boundingBoxesEnabled, setBoundingBoxesEnabled] = useState(true);

  // History Anomalies
  const [anomalies, setAnomalies] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  // System Notification Toast
  const [notification, setNotification] = useState(null);

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
      setTelemetry(data);
      if (data.actuators) {
        setActuators(data.actuators);
      }
      setTelemetryStream(prev => {
        const timeLabel = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const next = [...prev, { ...data, timeLabel }];
        return next.slice(-25); // keep last 25 ticks
      });
    });

    socket.on('gps_update', (data) => {
      setGps(data);
    });

    socket.on('pi_diagnostics', (data) => {
      setDiagnostics(data);
    });

    socket.on('actuator_update', (data) => {
      setActuators(data);
    });

    socket.on('yolo_update', (data) => {
      if (data && data.activeDetections) {
        setDetections(data.activeDetections);
      }
    });

    socket.on('threat_alert', (anomaly) => {
      setAnomalies(prev => [anomaly, ...prev]);
      setNotification({
        type: 'threat',
        title: `${anomaly.threat_type}`,
        message: `Severity: ${anomaly.severity} | Confidence: ${anomaly.confidence}%`,
        timestamp: new Date().toLocaleTimeString()
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
        message: `Saved snapshot frame with YOLO tags`,
        timestamp: new Date().toLocaleTimeString()
      });
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle YOLO Bounding Boxes
  const toggleBoundingBoxes = () => {
    const nextVal = !boundingBoxesEnabled;
    setBoundingBoxesEnabled(nextVal);
    if (socketRef.current) {
      socketRef.current.emit('toggle_bounding_boxes', nextVal);
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
        captureSnapshot
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
