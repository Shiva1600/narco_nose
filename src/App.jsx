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

import { AnimatePresence, motion } from 'framer-motion';

function DashboardContent() {
  const { activeTab } = useApp();
  const isHomePage = activeTab === 'home';

  return (
    <div className={`min-h-screen flex flex-col ${isHomePage ? 'bg-background' : 'bg-transparent page-translucent'} text-on-surface overflow-x-hidden relative`}>
      {/* Railway Station Platform Background - Only active for pages other than homepage */}
      {!isHomePage && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <img
            src="/images/platform_bg.jpg"
            alt="Railway Station Platform Background"
            className="w-full h-full object-cover object-center fixed inset-0"
          />
          {/* Subtle ambient overlay to maintain contrast while preserving the sunset and platform imagery */}
          <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20" />
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar />

      {/* Hardware Simulation & Scenario Test Toolbar */}
      <SimulationBar />

      {/* Main Animated Tab Router Canvas */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="flex-1 flex flex-col"
          >
            {activeTab === 'home' && <HomeHub />}
            {activeTab === 'sensors' && <SensorData />}
            {activeTab === 'camera' && <CameraYolo />}
            {activeTab === 'history' && <HistoryLogs />}
            {activeTab === 'diagnostics' && <SystemDiagnostics />}
            {activeTab === 'settings' && <DeviceSettings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* High-Resolution Snapshot Inspection Modal */}
      <SnapshotModal />
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
