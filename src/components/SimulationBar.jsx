import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SimulationBar() {
  const { triggerScenario, calibrate, telemetry, actuators, setActuator } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-surface-container-high border-b border-outline-variant/30 text-xs px-4 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
            Hardware Test & Simulation Suite
          </span>
          <span className="text-secondary hidden sm:inline">|</span>
          <span className="text-secondary hidden sm:inline">
            Inject realistic multi-gas threat vectors or test auto clearing fan
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-secondary hover:text-on-surface font-semibold flex items-center gap-1 text-[11px]"
          >
            <span>{collapsed ? 'Show Test Scenarios' : 'Hide'}</span>
            <span className="material-symbols-outlined text-sm">
              {collapsed ? 'expand_more' : 'expand_less'}
            </span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-outline-variant/20 flex flex-wrap items-center gap-2">
          <span className="text-secondary font-medium text-[11px]">Inject Scenario:</span>

          <button
            onClick={() => triggerScenario('vapors')}
            className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-xs">local_fire_department</span>
            <span>Vapor Plume Spike (MQ-3 880 ppm)</span>
          </button>

          <button
            onClick={() => triggerScenario('combustion')}
            className="bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-xs">propane</span>
            <span>LPG / Combustion Spike (MQ-2 920 ppm)</span>
          </button>

          <button
            onClick={() => triggerScenario('powder')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-xs">category</span>
            <span>YOLO Powder Object Detect</span>
          </button>

          <button
            onClick={() => triggerScenario('purge')}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-xs">air</span>
            <span>Chamber Purge (Dissipate Gas)</span>
          </button>

          <div className="h-4 w-px bg-outline-variant/40 mx-1 hidden sm:block"></div>

          {/* Quick Fan Switch */}
          <button
            onClick={() => setActuator('fan', actuators.fanState === 'ON' ? 'OFF' : 'ON')}
            className={`px-3 py-1 rounded-full font-semibold border flex items-center gap-1 transition-all active:scale-95 ${
              actuators.fanState === 'ON'
                ? 'bg-primary text-on-primary border-primary animate-pulse'
                : 'bg-surface-container text-secondary border-outline-variant/40 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-xs">mode_fan</span>
            <span>5V Fan: {actuators.fanState}</span>
          </button>
        </div>
      )}
    </div>
  );
}
