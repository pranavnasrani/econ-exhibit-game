import React from 'react';

interface ControlPanelProps {
  year: number;
  scenario: string;
  fare: number;
  onFareChange: (fare: number) => void;
  onConfirm: () => void;
  termProgress: number;
}

const getFareColor = (fare: number): string => {
    const percentage = fare / 1.0; // Max fare is 1.0
    const red = Math.min(255, Math.floor(255 * percentage * 1.8));
    const green = Math.min(255, Math.floor(255 * (1 - percentage) * 1.8));
    if (fare < 0.4) return '#22c55e'; // green-500
    if (fare > 0.8) return '#ef4444'; // red-500
    return `rgb(${red}, ${green}, 80)`;
};

const ControlPanel: React.FC<ControlPanelProps> = ({ year, scenario, fare, onFareChange, onConfirm, termProgress }) => {
  const fareColor = getFareColor(fare);

  return (
    <div className="h-full p-6 bg-gray-900/50 border border-red-500/50 rounded-lg shadow-glow-red flex flex-col justify-between">
      {/* HEADER */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-baseline">
            <h2 className="text-4xl font-bold text-red-400">YEAR: {year}</h2>
            <span className="text-lg font-semibold text-gray-400">Year {termProgress} of 3</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-grow flex flex-col justify-center gap-6 my-6">
        <div className="border border-gray-700 p-4 rounded-lg bg-black/30 shadow-inner">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">INCOMING TRANSMISSION...</h3>
            <p className="text-green-300 text-lg font-mono tracking-wide min-h-[3em] flex items-center">
              <span className="animate-pulse">&gt; {scenario}</span>
            </p>
        </div>

        <div className="border border-gray-700 p-4 rounded-lg bg-black/20">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2 text-center">Fare Control</h3>
            <p className="text-5xl font-bold text-center mb-4 transition-colors" style={{ color: fareColor }}>
              S${fare.toFixed(2)}
            </p>
            <div className="flex items-center justify-center space-x-4">
                <span className="text-lg text-gray-400 w-16 text-center">S$0.00</span>
                <input
                    id="fare-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fare}
                    onChange={(e) => onFareChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-range"
                />
                <span className="text-lg text-gray-400 w-16 text-center">S$1.00</span>
            </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <div className="flex-shrink-0">
        <button
          onClick={onConfirm}
          className="w-full py-4 text-xl font-bold text-white bg-red-600/80 rounded-lg hover:bg-red-500 hover:shadow-glow-red transition-all duration-300"
        >
          CONFIRM FARE FOR {year}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;