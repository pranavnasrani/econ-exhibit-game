import React from 'react';
import { ResultsData } from '../types';
import Dashboard from './Dashboard';

interface ResultsModalProps {
  results: ResultsData;
  onPlayAgain: () => void;
  onRestart: () => void;
  isLastYear: boolean;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ results, onPlayAgain, onRestart, isLastYear }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-gray-900 border-2 border-red-500/70 rounded-lg shadow-glow-red animate-fadeIn relative">
        <div className="p-8">
          <h2 className="text-3xl text-center font-bold text-red-400 mb-6">YEAR-END REPORT</h2>
          
          <div className="mb-6">
            <Dashboard data={results} />
          </div>

          <div className="text-center mb-6 p-4 border border-gray-600 rounded-lg bg-gray-800/50">
            <p className="text-lg text-gray-200">
              <span className="font-bold text-red-400 block mb-2">AI ADVISOR ANALYSIS:</span>
              "{results.outcomeMessage}"
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {!isLastYear && 
              <button onClick={onPlayAgain} className="px-6 py-3 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg shadow-glow-red transition-all">
                Play Another Year
              </button>
            }
            <button onClick={onRestart} className="px-6 py-3 bg-gray-600/80 hover:bg-gray-500 text-white font-bold rounded-lg transition-all">
              Restart Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
