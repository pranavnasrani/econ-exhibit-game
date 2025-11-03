
import React from 'react';

interface ControlPanelProps {
  year: number;
  scenario: string;
  fare: number;
  onFareChange: (fare: number) => void;
  onConfirm: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ year, scenario, fare, onFareChange, onConfirm }) => {
  return (
    <div className="h-full p-6 bg-gray-900/50 border border-red-500/50 rounded-lg shadow-glow-red flex flex-col justify-between">
      <div>
        <h2 className="text-4xl font-bold text-red-400">YEAR: {year}</h2>
        <p className="text-gray-300 mt-4 text-md h-24">{scenario}</p>
      </div>

      <div className="my-8">
        <label htmlFor="fare-slider" className="block text-xl mb-2 text-center text-gray-300">
          Set Fare
        </label>
        <div className="flex items-center justify-center space-x-4">
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

      <button
        onClick={onConfirm}
        className="w-full py-4 text-xl font-bold text-white bg-red-600/80 rounded-lg hover:bg-red-500 hover:shadow-glow-red transition-all duration-300"
      >
        CONFIRM FARE
      </button>
    </div>
  );
};

export default ControlPanel;
