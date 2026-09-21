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
  const [navMousePos, setNavMousePos] = useState({ x: 50, y: 50 });
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);

  const navRef = useRef(null);
  const tabRefs = useRef({});

  const currentDropletTab = hoveredTab || activeTab;

  const tabs = [
    { id: 'home', label: 'Home', icon: 'hub' },
    { id: 'sensors', label: 'Sensor Data', icon: 'monitoring' },
    { id: 'camera', label: 'Camera YOLO', icon: 'videocam' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'diagnostics', label: 'Diagnostics', icon: 'memory' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  const handleNavMouseMove = (e) => {
    const navEl = navRef.current;
    if (!navEl) return;
    const clientX = e.clientX;
    const navRect = navEl.getBoundingClientRect();

    // Specular refraction glint coordinates
    const x = ((clientX - navRect.left) / navRect.width) * 100;
    const y = ((e.clientY - navRect.top) / navRect.height) * 100;
    setNavMousePos({ x, y });

    // Continuous proximity tab detection - zero dead zones
    let closestTab = null;
    let minDistance = Infinity;

    for (const t of tabs) {
      const el = tabRefs.current[t.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right) {
          closestTab = t.id;
          minDistance = 0;
          break;
        }
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(clientX - center);
        if (dist < minDistance) {
          minDistance = dist;
          closestTab = t.id;
        }
      }
    }

    if (closestTab && closestTab !== hoveredTab) {
      setHoveredTab(closestTab);
    }
  };

  const isThreat = telemetry.threat_level === 'THREAT';
  const isWarning = telemetry.threat_level === 'WARNING';

  return (
    <header className={`${activeTab === 'home' ? 'bg-white/60 backdrop-blur-md border-b border-white/30 shadow-2xs' : 'bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-xs'} sticky top-0 z-50 w-full transition-colors duration-300`}>
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
                  y: -8,
                  scale: 1.045,
                  transition: { type: 'spring', stiffness: 450, damping: 14, mass: 0.8 }
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
                  className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-150 z-[3]"
                  style={{
                    opacity: isNavHovered ? 1 : 0,
                    background: `radial-gradient(140px circle at ${navMousePos.x}% ${navMousePos.y}%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.3) 40%, transparent 75%)`
                  }}
                />

                {tabs.map(t => {
                  const isDropletHere = currentDropletTab === t.id;
                  const isActivePage = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      ref={el => (tabRefs.current[t.id] = el)}
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
                          className="absolute inset-0 liquid-active-pill rounded-full pointer-events-none -z-10"
                          transition={{
                            type: 'spring',
                            stiffness: 580,
                            damping: 32,
                            mass: 0.45
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
          {/* Hardware Connection Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-xs font-semibold text-secondary">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{connected ? 'RPi 5 Online' : 'Connecting...'}</span>
          </div>

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

      {/* Mobile Nav Scroller - Hidden on Homepage */}
      <AnimatePresence>
        {activeTab !== 'home' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 overflow-x-auto bg-surface-container-low border-t border-outline-variant/20 scrollbar-none"
          >
            {tabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`relative flex items-center gap-1 text-sm font-bold whitespace-nowrap px-3.5 py-1.5 rounded-full transition-colors z-10 ${
                    isActive
                      ? 'text-primary font-black'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveNavPill"
                      className="absolute inset-0 bg-surface-container-lowest rounded-full shadow-xs border border-outline-variant/40"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="material-symbols-outlined text-base relative z-10">{t.icon}</span>
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
