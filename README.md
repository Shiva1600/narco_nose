# 👃 Narco Nose — Real-Time Chemical Threat Proxy Detection Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5%2B-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Raspberry Pi 5](https://img.shields.io/badge/Hardware-Raspberry_Pi_5-C51A4A?logo=raspberrypi&logoColor=white)](https://www.raspberrypi.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

> **Narco Nose** is a full-stack IoT biosensing and computer vision command interface designed for real-time chemical threat proxy detection. Built for a field-deployable **Raspberry Pi 5** hardware unit equipped with an MQ-series electronic nose (e-nose), DHT22 environmental sensor, NEO-6M GPS module, and local YOLOv8 object detection.

---

## 🌟 Key Features & 5-Tab Architecture

The dashboard strictly adheres to a modern **Light Mode, Squircle (28px radius)** flat aesthetic designed for high field legibility:

### 1. 🎛️ Central Hub (Home)
- **5 Squircle Routing Cards** with live metric badges (`Sensor Data`, `Camera YOLO`, `History`, `System Diagnostics`, `Settings`).
- **Dynamic Threat Level Banner**: Color-coded system status (`SAFE` / `WARNING` / `CRITICAL THREAT`) calculated in real time from multi-gas ML confidence payloads.
- **Node Status Pill**: Displays firmware state, node serial (`Node SN-9021-TX`), and live active sensors.

### 2. 📊 Sensor Data Dashboard
- **Simple Info Mode**: High-visibility numerical readout cards for:
  - **MQ-2**: Combustible gases, smoke, LPG (ppm)
  - **MQ-3**: Alcohol, ethanol, solvent vapor proxies (ppm)
  - **MQ-135**: Air quality, ammonia, hazardous benzene traces (ppm)
  - **DHT22**: Temperature (°C/°F), Relative Humidity (%), and Vapor Pressure Heat Index
- **Advanced Info Mode**:
  - **Rolling Multi-Line Trend Graph**: Real-time 30-second multi-gas ppm synchronization (Chart.js).
  - **5-Axis Chemical Vector Radar**: Signature geometry comparing live gas readings against clean-air calibration baselines.
  - **ADS1115 ADC Matrix**: Live analog voltage conversions and baseline tare delta offsets.
- **One-Click Sensor Calibration**: Tare and calibrate sensors to ambient clean-air baseline.

### 3. 🎥 Camera YOLO & GPS Mapping
- **Optical Inspection Stream**: Real-time camera feed overlaid with YOLOv8 bounding boxes, confidence tags (e.g., *Chemical Container 94.2%*, *Suspicious Powder 88.7%*), and live framerate (29.8 FPS).
- **Interactive Controls**: Toggle bounding box HUDs, adjust inference confidence cutoff sliders, and capture high-res snapshots.
- **NEO-6M GPS Tracker**: Interactive Leaflet map displaying real-time field rover coordinates (Lat/Lon), ground speed, altitude, satellite fix quality, and breadcrumb route trails.

### 4. 📜 Historical Telemetry & Threat Event Log
- **24-Hour Telemetry Graphs**: Query continuous rolling gas trends logged directly to the local SQLite database.
- **Chronological Threat Log**: Complete event timeline displaying anomaly category, severity, peak ppm values, and GPS locations.
- **Snapshot Inspection Modal**: Click to inspect captured YOLO threat frames with zoom and download capabilities.
- **Data Export**: Instant export of logged telemetry to **CSV** and **JSON**.

### 5. ⚙️ Diagnostics & Actuator Settings
- **Hardware Telemetry**: Pi 5 Broadcom BCM2712 CPU load %, LPDDR4X RAM allocation %, and SoC core temperature (°C) displayed with animated circular SVG gauges.
- **Sensor I/O Matrix**: Status monitoring for all physical buses (I2C 0x48, UART /dev/ttyAMA0, CSI MIPI Camera, GPIO 4).
- **Bi-Directional Actuator Control**:
  - **5V Clearing Fan**: `AUTO` (auto-purges chamber on gas spike), `MANUAL ON`, or `OFF`.
  - **Piezo Buzzer Alarm**: `ARMED`, `MUTE`, or `TEST`.
  - **RGB Status LEDs**: `PULSE_TEAL`, `ALERT_RED`, `WARN_AMBER`, or `OFF`.
- **Threshold Trimming**: Live sliders to customize alarm trip points for each gas channel and ML confidence.
- **MQTT Gateway Config**: Easily bind to your Mosquitto broker IP, port, and topic prefix.

---

## 🧪 Built-in Simulation & Threat Injector Suite

No physical hardware connected yet? No problem! The dashboard features a collapsible **Hardware Test Suite** banner at the top of the interface:
- **Vapor Plume Spike**: Spikes MQ-3 (880 ppm) and injects an ethanol vapor detection event.
- **Combustion / LPG Leak**: Spikes MQ-2 (920 ppm) and flags combustible gas anomalies.
- **YOLO Powder Detection**: Simulates optical classification of suspicious chemical packages.
- **Chamber Purge**: Automatically triggers the 5V clearing fan to dissipate gas back to clean air baseline within seconds.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js (`react-chartjs-2`), Leaflet (`leaflet`), Material Symbols Outlined, Plus Jakarta Sans & Inter typography.
- **Backend**: Node.js, Express, Socket.IO (bidirectional WebSockets), SQLite3 (`server/narco_nose.db`).
- **Communication Protocol**: WebSockets for browser streaming + MQTT (`mqtt.js`) for Raspberry Pi 5 broker integration.
- **Vision Pipeline**: YOLOv8-Nano inference metadata bridge + dynamic MJPEG/SVG HUD frame generator.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18 or higher ([Download Node.js](https://nodejs.org/))
- **npm** v9 or higher

### 2. Clone and Install
```bash
git clone https://github.com/ankursinGGha/narco_nose.git
cd narco_nose
npm install
