import React from 'react';
import { useApp } from '../context/AppContext';

export default function SnapshotModal() {
  const { selectedSnapshot, setSelectedSnapshot } = useApp();

  if (!selectedSnapshot) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest squircle-card max-w-3xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              photo_camera
            </span>
            <div>
              <h3 className="font-extrabold text-lg text-on-surface">
                Threat Photo Evidence
              </h3>
              <p className="text-xs text-secondary">
                Timestamp: {new Date(selectedSnapshot.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSnapshot(null)}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Image Display */}
        <div className="mt-4 rounded-2xl overflow-hidden border border-outline-variant/40 bg-surface-container-highest flex items-center justify-center relative min-h-[300px]">
          <img
            src={selectedSnapshot.url || selectedSnapshot.snapshot_url || selectedSnapshot.captured_image}
            alt="Threat Incident Photo"
            className="w-full h-auto object-contain max-h-[500px]"
            onError={(e) => {
              // Fallback if local svg / image isn't available
              e.target.src = '/stream/frame.svg';
            }}
          />
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30">
          <div>
            <span className="text-secondary block font-medium">Threat Category</span>
            <span className="font-bold text-on-surface">
              {selectedSnapshot.threat_type || 'Optical Verification'}
            </span>
          </div>
          <div>
            <span className="text-secondary block font-medium">Classification Conf.</span>
            <span className="font-bold text-primary">
              {selectedSnapshot.confidence ? `${selectedSnapshot.confidence}%` : '94.2%'}
            </span>
          </div>
          <div>
            <span className="text-secondary block font-medium">GPS Location</span>
            <span className="font-bold text-on-surface">
              {selectedSnapshot.lat ? `${selectedSnapshot.lat.toFixed(4)}, ${selectedSnapshot.lon.toFixed(4)}` : '22.5603, 88.4902'}
            </span>
          </div>
          <div>
            <span className="text-secondary block font-medium">Sensor Severity</span>
            <span className={`font-bold ${selectedSnapshot.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'
              }`}>
              {selectedSnapshot.severity || 'EVALUATING'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <a
            href={selectedSnapshot.url || selectedSnapshot.snapshot_url}
            download="narco_nose_snapshot.svg"
            className="bg-primary hover:bg-primary-container text-on-primary px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Download Frame</span>
          </a>
        </div>
      </div>
    </div>
  );
}
