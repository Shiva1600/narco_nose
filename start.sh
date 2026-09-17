#!/usr/bin/env bash
# Narco Nose One-Click Launcher for Linux / macOS / Raspberry Pi 5
set -e

# Change directory to the folder where this script is located
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "   Narco Nose - Real-Time Chemical Threat Detection"
echo "=========================================================="
echo "Project Directory: $PROJECT_DIR"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
    echo "[SETUP] Installing dependencies..."
    npm install
fi

# Build frontend if dist is missing
if [ ! -f "dist/index.html" ]; then
    echo "[BUILD] Building frontend..."
    npm run build
fi

# Open browser if GUI desktop is detected
if [ -n "$DISPLAY" ] || [ "$(uname)" = "Darwin" ]; then
    (sleep 2 && (xdg-open http://localhost:5000 2>/dev/null || open http://localhost:5000 2>/dev/null || true)) &
fi

echo "[RUNNING] Starting Narco Nose on http://localhost:5000 ..."
echo "Press Ctrl+C to stop."
echo "=========================================================="
node server/index.js
