import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

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

  const tabs = [
    { id: 'home', label: 'Home', icon: 'hub' },
    { id: 'sensors', label: 'Sensor Data', icon: 'monitoring' },
    { id: 'camera', label: 'Camera YOLO', icon: 'videocam' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'diagnostics', label: 'Diagnostics', icon: 'memory' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  const isThreat = telemetry.threat_level === 'THREAT';
  const isWarning = telemetry.threat_level === 'WARNING';

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant/30 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20 w-full">
        {/* Brand Anchor */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('home')}
            className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-primary text-3xl font-bold" data-icon="sensors">
              sensors
            </span>
            <span className="font-extrabold">Narco Nose</span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 ml-2">
            {tabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 py-1 text-base lg:text-lg font-semibold transition-colors duration-150 relative ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{t.icon}</span>
                  <span>{t.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-[3px] bg-primary rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-3">
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
                : 'bg-teal-50 text-teal-800 border border-teal-200'
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
                        ? 'bg-teal-50 text-teal-900 border border-teal-200'
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

      {/* Mobile Nav Scroller */}
      <div className="md:hidden flex items-center gap-4 px-4 py-2.5 overflow-x-auto bg-surface-container-low border-t border-outline-variant/20 scrollbar-none">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1 text-sm font-semibold whitespace-nowrap px-3 py-1 rounded-full transition-all ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
