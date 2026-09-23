const fs = require('fs');
const path = require('path');

// Ensure snapshots directory exists
const snapshotsDir = path.join(__dirname, '../public/snapshots');
if (!fs.existsSync(snapshotsDir)) {
  fs.mkdirSync(snapshotsDir, { recursive: true });
}

// Active camera detection state
let detectionState = {
  activeDetections: [
    {
      id: 'det-1',
      label: 'Chemical Container (Class A)',
      confidence: 94.2,
      box: { x: 120, y: 80, width: 220, height: 260 },
      threatLevel: 'THREAT',
      color: '#ba1a1a'
    },
    {
      id: 'det-2',
      label: 'Suspicious Powder / Trace',
      confidence: 88.5,
      box: { x: 380, y: 140, width: 160, height: 130 },
      threatLevel: 'WARNING',
      color: '#007bb9'
    }
  ],
  fps: 29.8,
  exposure: 'Auto (1/120s)',
  iso: 200,
  fov: '110° Wide',
  resolution: '1920x1080 (Downsampled 720p)',
  boundingBoxesEnabled: true,
  thermalMode: false
};

// Registered MJPEG client responses
const clients = new Set();

function handleStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });

  clients.add(res);
  req.on('close', () => {
    clients.delete(res);
  });
}

// Generate dynamic SVG representation of camera feed with OpenCV optical HUD
function generateFrameSVG() {
  const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const boxes = detectionState.boundingBoxesEnabled ? detectionState.activeDetections : [];
  
  // HUD boxes SVG elements
  const boxesSvg = boxes.map(d => {
    const isCritical = d.threatLevel === 'THREAT';
    const strokeColor = isCritical ? '#ba1a1a' : '#007bb9';
    const bgColor = isCritical ? 'rgba(186, 26, 26, 0.15)' : 'rgba(0, 123, 185, 0.15)';
    return `
      <!-- Bounding Box -->
      <g>
        <rect x="${d.box.x}" y="${d.box.y}" width="${d.box.width}" height="${d.box.height}" 
              fill="${bgColor}" stroke="${strokeColor}" stroke-width="2.5" rx="8" />
        <!-- Corner brackets -->
        <path d="M${d.box.x} ${d.box.y + 20} L${d.box.x} ${d.box.y} L${d.box.x + 20} ${d.box.y}" stroke="${strokeColor}" stroke-width="4" fill="none" />
        <path d="M${d.box.x + d.box.width - 20} ${d.box.y} L${d.box.x + d.box.width} ${d.box.y} L${d.box.x + d.box.width} ${d.box.y + 20}" stroke="${strokeColor}" stroke-width="4" fill="none" />
        <path d="M${d.box.x} ${d.box.y + d.box.height - 20} L${d.box.x} ${d.box.y + d.box.height} L${d.box.x + 20} ${d.box.y + d.box.height}" stroke="${strokeColor}" stroke-width="4" fill="none" />
        <path d="M${d.box.x + d.box.width - 20} ${d.box.y + d.box.height} L${d.box.x + d.box.width} ${d.box.y + d.box.height} L${d.box.x + d.box.width} ${d.box.y + d.box.height - 20}" stroke="${strokeColor}" stroke-width="4" fill="none" />
        
        <!-- Label tag -->
        <rect x="${d.box.x}" y="${d.box.y - 28}" width="${Math.max(140, d.label.length * 9)}" height="26" fill="${strokeColor}" rx="4" />
        <text x="${d.box.x + 8}" y="${d.box.y - 10}" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="12">
          ${d.label} [${d.confidence.toFixed(1)}%]
        </text>
      </g>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 450" width="720" height="450">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#19222b"/>
          <stop offset="50%" stop-color="#0f151c"/>
          <stop offset="100%" stop-color="#1e2d3d"/>
        </linearGradient>
        <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
          <stop offset="60%" stop-color="transparent"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.6)"/>
        </radialGradient>
      </defs>

      <!-- Background scene simulation -->
      <rect width="720" height="450" fill="url(#bgGrad)"/>
      <rect width="720" height="450" fill="url(#vignette)"/>

      <!-- Simulated Lab Table / Surface -->
      <polygon points="40,320 680,320 720,450 0,450" fill="#141c24" opacity="0.85"/>
      <line x1="40" y1="320" x2="680" y2="320" stroke="#2a3b4c" stroke-width="2"/>

      <!-- Simulated Chemical Container Flask -->
      <g transform="translate(160, 110)">
        <path d="M40 0 L80 0 L80 40 L120 180 L0 180 L40 40 Z" fill="#2d4256" stroke="#486582" stroke-width="2" opacity="0.8"/>
        <!-- Liquid Level -->
        <path d="M20 120 L100 120 L115 175 L5 175 Z" fill="#008378" opacity="0.65"/>
        <line x1="20" y1="120" x2="100" y2="120" stroke="#89f5e7" stroke-width="2"/>
        <text x="35" y="150" fill="#f4fffc" font-size="10" font-family="sans-serif" font-weight="bold">SOLVENT-X</text>
      </g>

      <!-- Simulated Chemical Sample Tray -->
      <g transform="translate(410, 160)">
        <rect x="0" y="0" width="100" height="60" rx="8" fill="#243342" stroke="#3b526b" stroke-width="2"/>
        <ellipse cx="50" cy="30" rx="35" ry="18" fill="#d9e2ec" opacity="0.85"/>
        <ellipse cx="50" cy="30" rx="20" ry="10" fill="#f0f4f8" opacity="0.95"/>
      </g>

      <!-- Crosshair HUD center -->
      <g stroke="#008378" stroke-width="1.5" opacity="0.6">
        <circle cx="360" cy="225" r="30" fill="none" stroke-dasharray="4,4"/>
        <line x1="360" y1="180" x2="360" y2="210"/>
        <line x1="360" y1="240" x2="360" y2="270"/>
        <line x1="315" y1="225" x2="345" y2="225"/>
        <line x1="375" y1="225" x2="405" y2="225"/>
      </g>

      <!-- Optical Detections -->
      ${boxesSvg}

      <!-- Top Overlay HUD -->
      <rect x="16" y="16" width="688" height="34" rx="8" fill="rgba(15, 23, 42, 0.75)"/>
      <circle cx="32" cy="33" r="5" fill="#ba1a1a">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <text x="46" y="38" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="12" letter-spacing="0.05em">LIVE REC</text>
      <text x="130" y="38" fill="#89f5e7" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="12">OpenCV cv2</text>
      <text x="360" y="38" fill="#dae2fd" font-family="'Inter', sans-serif" font-size="12">${timeStr}</text>
      <text x="600" y="38" fill="#6bd8cb" font-family="'Inter', sans-serif" font-weight="600" font-size="12">FPS: ${detectionState.fps.toFixed(1)}</text>

      <!-- Bottom Overlay HUD -->
      <rect x="16" y="400" width="688" height="34" rx="8" fill="rgba(15, 23, 42, 0.75)"/>
      <text x="28" y="422" fill="#93ccff" font-family="'Inter', sans-serif" font-size="11">CAM 01: SONY IMX708 (Pi Cam v3)</text>
      <text x="270" y="422" fill="#bcc9c6" font-family="'Inter', sans-serif" font-size="11">EXP: ${detectionState.exposure} | ISO: ${detectionState.iso}</text>
      <text x="510" y="422" fill="#89f5e7" font-family="'Inter', sans-serif" font-weight="600" font-size="11">TARGET CONF: ${(detectionState.activeDetections[0]?.confidence || 90).toFixed(1)}%</text>
    </svg>
  `;
}

function captureSnapshot(meta = {}) {
  const filename = `snapshot_${Date.now()}.svg`;
  const filePath = path.join(snapshotsDir, filename);
  const svgContent = generateFrameSVG();
  fs.writeFileSync(filePath, svgContent, 'utf-8');
  return {
    url: `/snapshots/${filename}`,
    timestamp: new Date().toISOString(),
    detections: detectionState.activeDetections,
    ...meta
  };
}

// Update detections from simulation or MQTT
function updateDetections(newDetections) {
  if (Array.isArray(newDetections)) {
    detectionState.activeDetections = newDetections;
  }
}

function setBoundingBoxesEnabled(val) {
  detectionState.boundingBoxesEnabled = !!val;
}

function getDetectionState() {
  return detectionState;
}

module.exports = {
  handleStream,
  generateFrameSVG,
  captureSnapshot,
  updateDetections,
  setBoundingBoxesEnabled,
  getDetectionState
};
