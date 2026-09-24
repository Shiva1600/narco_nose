import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    connected,
    telemetry,
    calibrate,
    notification,
    setNotification
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);

  const navRef = useRef(null);
  const currentDropletTab = hoveredTab || activeTab;

  const tabs = [
    { id: 'home', label: 'Home', mobileLabel: 'Home', icon: 'hub' },
    { id: 'sensors', label: 'Sensor Data', mobileLabel: 'Sensors', icon: 'monitoring' },
    { id: 'camera', label: 'Optical Evidence', mobileLabel: 'Camera', icon: 'photo_camera' },
    { id: 'history', label: 'History', mobileLabel: 'History', icon: 'history' },
    { id: 'settings', label: 'Settings', mobileLabel: 'Settings', icon: 'settings' }
  ];

  const handleNavMouseMove = (e) => {
    const navEl = navRef.current;
    if (!navEl) return;
    const navRect = navEl.getBoundingClientRect();
    const x = ((e.clientX - navRect.left) / navRect.width) * 100;
    const y = ((e.clientY - navRect.top) / navRect.height) * 100;
    navEl.style.setProperty('--mouse-x', `${x}%`);
    navEl.style.setProperty('--mouse-y', `${y}%`);
  };

  const isThreat = telemetry.threat_level === 'THREAT';
  const isWarning = telemetry.threat_level === 'WARNING';

  return (
    <>
      <header className={`${activeTab === 'home' ? 'bg-white/60 backdrop-blur-md border-b border-white/30 shadow-2xs' : 'bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-xs'} sticky top-0 z-40 w-full transition-colors duration-300`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex justify-between items-center h-20">
        {/* Brand Anchor - Pushed to Far Left Corner */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity font-inter"
          >
            <span className="material-symbols-outlined text-primary text-2xl font-bold" data-icon="sensors">
              sensors
            </span>
            <span className="font-bold">Narco Nose</span>
          </button>
        </div>

        {/* Navigation Links with Liquid Glass Floating Capsule - Centered and Hidden on Homepage */}
        <AnimatePresence>
          {activeTab !== 'home' && (
            <div className="hidden md:block liquid-glass-nav-wrapper mx-4">
              {/* Fluid Caustic Underglow Aura */}
              <div className="liquid-glass-caustic" />

              <motion.nav
                ref={navRef}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                whileHover={{
                  y: -2,
                  scale: 1.015,
                  transition: { duration: 0.2, ease: 'easeOut' }
                }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setIsNavHovered(true)}
                onMouseLeave={() => {
                  setIsNavHovered(false);
                  setHoveredTab(null);
                }}
                onMouseMove={handleNavMouseMove}
                className="flex items-center gap-0.5 p-1 rounded-full font-inter liquid-glass-nav cursor-pointer select-none relative"
              >
                {/* Liquid Sheen Light Sweep Animation */}
                <div className="liquid-glass-sheen" />

                {/* Interactive Dynamic Mouse Refraction Hotspot */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-200 z-[3]"
                  style={{
                    opacity: isNavHovered ? 1 : 0,
                    background: `radial-gradient(140px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.3) 40%, transparent 75%)`
                  }}
                />

                {tabs.map(t => {
                  const isDropletHere = currentDropletTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id);
                        setHoveredTab(null);
                      }}
                      onMouseEnter={() => setHoveredTab(t.id)}
                      className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-150 z-10 ${
                        isDropletHere
                          ? 'text-primary font-bold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {isDropletHere && (
                        <motion.div
                          layoutId="liquidGlassDroplet"
                          className="absolute inset-0 liquid-active-pill rounded-full pointer-events-none -z-10 will-change-transform"
                          transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 26,
                            mass: 0.6
                          }}
                        />
                      )}

                      <span className="material-symbols-outlined text-xl relative z-10">{t.icon}</span>
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  );
                })}
              </motion.nav>
            </div>
          )}
        </AnimatePresence>

        {/* Trailing Action Cluster - Pushed to Far Right Corner */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Hardware Connection / Simulation Indicator Pill */}
          {!connected ? (
            <div 
              title="Connecting to local backend server..."
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Offline</span>
            </div>
          ) : telemetry.hardware_online ? (
            <div 
              title="Real-time telemetry streaming from Raspberry Pi 5"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold tracking-wide shadow-2xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="material-symbols-outlined text-sm">memory</span>
              <span>LIVE RPi 5</span>
            </div>
          ) : (
            <div 
              title="Simulation Mode: Real hardware is offline. Showing simulated ambient data."
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold tracking-wide shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="material-symbols-outlined text-sm">science</span>
              <span>SIMULATION MODE</span>
            </div>
          )}

          {/* Quick Threat Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
              isThreat
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-bounce'
                : isWarning
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isThreat ? 'warning' : isWarning ? 'crisis_alert' : 'verified_user'}
            </span>
            <span>{telemetry.threat_level}</span>
          </div>

          {/* Calibrate Sensor Button */}
          <button
            onClick={calibrate}
            title="Tare & Calibrate Sensors to Clean Baseline"
            className="hidden lg:flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary text-sm px-4 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">auto_fix_high</span>
            <span>Calibrate</span>
          </button>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors relative active:scale-95"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {notification && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white animate-ping" />
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-surface-container-lowest squircle-card p-4 shadow-xl z-50 border border-outline-variant/50">
                <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30 mb-3">
                  <h4 className="font-bold text-sm text-on-surface">Event Notifications</h4>
                  <button
                    onClick={() => {
                      setNotification(null);
                      setShowNotifications(false);
                    }}
                    className="text-xs text-secondary hover:text-on-surface"
                  >
                    Clear
                  </button>
                </div>
                {notification ? (
                  <div
                    className={`p-3 rounded-2xl text-xs ${
                      notification.type === 'threat'
                        ? 'bg-rose-50 text-rose-900 border border-rose-200'
                        : notification.type === 'success'
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        {notification.type === 'threat' ? 'dangerous' : 'check_circle'}
                      </span>
                      {notification.title}
                    </div>
                    <div>{notification.message}</div>
                    <div className="text-[10px] text-secondary mt-1">{notification.timestamp}</div>
                  </div>
                ) : (
                  <div className="text-xs text-secondary text-center py-4">No new notifications</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Native Mobile Bottom Navigation Bar - 1-Click Access to All 5 Sections */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-2 pt-1.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 select-none ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileBottomNavActiveIndicator"
                    className="absolute inset-0 bg-blue-50/90 rounded-2xl -z-10 border border-blue-200/60 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <div className="relative flex items-center justify-center">
                  <span
                    className={`material-symbols-outlined text-[23px] transition-transform duration-200 ${
                      isActive ? 'scale-110 text-primary' : 'text-slate-400'
                    }`}
                  >
                    {t.icon}
                  </span>
                  {isActive && (
                    <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-white" />
                  )}
                </div>
                <span
                  className={`text-[10.5px] tracking-tight leading-tight mt-0.5 font-bold transition-colors ${
                    isActive ? 'text-primary' : 'text-slate-500'
                  }`}
                >
                  {t.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
