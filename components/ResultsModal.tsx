import React from 'react';
import { ResultsData } from '../types';
import Dashboard from './Dashboard';

interface ResultsModalProps {
  results: ResultsData;
  onContinue: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ results, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-gray-900 border-2 border-blue-500/70 rounded-lg shadow-glow-blue animate-fadeIn max-h-[90vh] flex flex-col">
        <div className="p-6 sm:p-8 overflow-y-auto">
          <h2 className="text-3xl text-center font-bold text-blue-400 mb-4">YEAR {results.year} - END OF YEAR REPORT</h2>
          <div className="mb-6">
            <Dashboard data={results} />
          </div>
          <div className="text-center p-4 border border-gray-600 rounded-lg bg-gray-800/50 mb-6">
            <p className="text-lg text-gray-200">
                <span className="font-bold text-blue-400 block mb-2">AI PERFORMANCE ANALYSIS:</span>
                "{results.outcomeMessage}"
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <button onClick={onContinue} className="px-8 py-3 bg-blue-600/80 hover:bg-blue-500 text-white font-bold rounded-lg shadow-glow-blue transition-all">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;