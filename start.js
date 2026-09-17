const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');

// Ensure working directory is strictly this project root
const ROOT_DIR = __dirname;
process.chdir(ROOT_DIR);

console.log('==========================================================');
console.log('   Narco Nose - Real-Time Chemical Threat Detection');
console.log('==========================================================');
console.log(`Directory: ${ROOT_DIR}\n`);

// 1. Check if node_modules exists
if (!fs.existsSync(path.join(ROOT_DIR, 'node_modules'))) {
  console.log('[SETUP] Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: ROOT_DIR });
}

// 2. Check if dist exists
if (!fs.existsSync(path.join(ROOT_DIR, 'dist', 'index.html'))) {
  console.log('[BUILD] Building production frontend...');
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
}

// 3. Open browser after a short delay
const url = 'http://localhost:5000';
setTimeout(() => {
  try {
    const startCmd = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' : 'xdg-open';
    execSync(`${startCmd} ${url}`);
  } catch (e) {
    // Non-fatal if browser cannot be launched in headless environments
  }
}, 2000);

// 4. Run the full-stack server
console.log(`[RUNNING] Launching Narco Nose on ${url} ...`);
require(path.join(ROOT_DIR, 'server', 'index.js'));
