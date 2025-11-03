import React from 'react';

interface ControlPanelProps {
  year: number;
  scenario: string;
  fare: number;
  onFareChange: (fare: number) => void;
  onConfirm: () => void;
  termProgress: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ year, scenario, fare, onFareChange, onConfirm, termProgress }) => {
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
        <div className="border border-gray-700 p-4 rounded-lg bg-black/20">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Intel Briefing</h3>
            <p className="text-gray-300 text-md">{scenario}</p>
        </div>

        <div className="border border-gray-700 p-4 rounded-lg bg-black/20">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2 text-center">Fare Control</h3>
            <div className="flex items-center justify-center space-x-4 mt-4">
                <span className="text-lg text-gray-400">S$0.50</span>
                <input
                    id="fare-slider"
                    type="range"
                    min="0.50"
                    max="2.50"
                    step="0.01"
                    value={fare}
                    onChange={(e) => onFareChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-range"
                />
                <span className="text-lg text-gray-400">S$2.50</span>
            </div>
            <p className="text-5xl font-bold text-center mt-4 text-white">
              S${fare.toFixed(2)}
            </p>
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
