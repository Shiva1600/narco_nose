import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import SimulationBar from './components/SimulationBar';
import SnapshotModal from './components/SnapshotModal';
import HomeHub from './pages/HomeHub';
import SensorData from './pages/SensorData';
import CameraYolo from './pages/CameraYolo';
import HistoryLogs from './pages/HistoryLogs';
import SystemDiagnostics from './pages/SystemDiagnostics';
import DeviceSettings from './pages/DeviceSettings';

function DashboardContent() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Hardware Simulation & Scenario Test Toolbar */}
      <SimulationBar />

      {/* Main Tab Router Canvas */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'home' && <HomeHub />}
        {activeTab === 'sensors' && <SensorData />}
        {activeTab === 'camera' && <CameraYolo />}
        {activeTab === 'history' && <HistoryLogs />}
        {activeTab === 'diagnostics' && <SystemDiagnostics />}
        {activeTab === 'settings' && <DeviceSettings />}
      </main>

      {/* High-Resolution Snapshot Inspection Modal */}
      <SnapshotModal />

      {/* Shared Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/20 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">sensors</span>
              <span>Narco Nose</span>
            </span>
            <span className="text-secondary">
              © 2024–2026 Chemical Threat Proxy Detection Prototype • Raspberry Pi 5
            </span>
          </div>

          <div className="flex items-center gap-4 text-secondary font-medium">
            <span>YOLOv8-Nano Vision Core</span>
            <span>•</span>
            <span>MQ Gas Array</span>
            <span>•</span>
            <span>NEO-6M GPS Engine</span>
            <span>•</span>
            <span className="text-primary font-bold">Node SN-9021-TX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
