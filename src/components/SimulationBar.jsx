import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SimulationBar() {
  const { triggerScenario, calibrate, telemetry, actuators, setActuator } = useApp();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="bg-transparent text-xs px-4 sm:px-6 lg:px-8 xl:px-10 py-1 transition-all w-full">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-secondary">Data Stream:</span>
          {telemetry.hardware_online ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Real Pi 5 Hardware Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Simulation Mode (Pi 5 Offline)
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-secondary hover:text-on-surface font-semibold flex items-center gap-1 text-[11px] transition-colors"
        >
          <span>{collapsed ? 'Test Scenarios' : 'Hide Scenarios'}</span>
          <span className="material-symbols-outlined text-sm">
            {collapsed ? 'expand_more' : 'expand_less'}
          </span>
        </button>
      </div>

      {!collapsed && (
        <div className="w-full mt-2 pt-2 border-t border-outline-variant/20 flex flex-wrap items-center gap-2">
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
            <span className="material-symbols-outlined text-xs">photo_camera</span>
            <span>Simulate Threat (Trigger Camera)</span>
          </button>

          <button
            onClick={() => triggerScenario('purge')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 active:scale-95"
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
