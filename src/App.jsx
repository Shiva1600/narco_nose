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
    <div className={`min-h-screen flex flex-col ${isHomePage ? 'bg-slate-50' : 'bg-transparent page-translucent'} text-on-surface overflow-x-hidden relative`}>
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

      {/* Homepage Top Background Video - Google Flow Vintage Railway Station ("No Drugs Only Bugs") */}
      {isHomePage && (
        <div className="absolute top-0 left-0 right-0 h-[380px] sm:h-[440px] lg:h-[490px] xl:h-[530px] pointer-events-none z-0 overflow-hidden select-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            src="/videos/homepage_train.mp4"
            className="w-full h-full object-cover object-[center_32%]"
          />
          {/* Subtle cinematic gradient overlays to blend into page background and preserve legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-transparent to-slate-50" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50/20 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50/20 to-transparent" />
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Hardware Simulation & Scenario Test Toolbar */}
      <div className="relative z-10">
        <SimulationBar />
      </div>

      {/* Main Animated Tab Router Canvas */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
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
