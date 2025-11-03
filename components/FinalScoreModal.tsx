

import React from 'react';
import { FinalScoreData, ResultsData } from '../types';
import Dashboard from './Dashboard';

interface FinalScoreModalProps {
  scoreData: FinalScoreData;
  onStartNewTerm: () => void;
  onRestart: () => void;
  isLastTerm: boolean;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const scoreColor = score < 40 ? '#ef4444' : score < 75 ? '#f59e0b' : '#22c55e';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-gray-700"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                    style={{ color: scoreColor, transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{score}</span>
            </div>
        </div>
    );
};

const FinalScoreModal: React.FC<FinalScoreModalProps> = ({ scoreData, onStartNewTerm, onRestart, isLastTerm }) => {
  const avgResultsForDashboard: ResultsData = {
      year: 0,
      ridership: scoreData.avgRidership,
      profit: scoreData.avgProfit,
      satisfaction: scoreData.avgSatisfaction,
      totalRevenue: 0,
      outcomeMessage: ''
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-gray-900 border-2 border-red-500/70 rounded-lg shadow-glow-red animate-fadeIn relative max-h-[90vh] flex flex-col">
        <div className="p-6 sm:p-8 overflow-y-auto">
          <h2 className="text-3xl text-center font-bold text-red-400 mb-4">3-YEAR TERM REVIEW: {scoreData.termYears[0]}-{scoreData.termYears[2]}</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="flex-shrink-0">
                <ScoreCircle score={scoreData.score} />
                <p className="text-center text-gray-300 mt-2 font-bold text-lg">Overall Score</p>
            </div>
            <div className="text-center md:text-left p-4 border border-gray-600 rounded-lg bg-gray-800/50 flex-grow">
              <p className="text-lg text-gray-200">
                <span className="font-bold text-red-400 block mb-2">AI ADVISOR ANALYSIS:</span>
                "{scoreData.finalReport}"
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl text-center text-gray-300 mb-4">3-Year Average Performance</h3>
            <Dashboard data={avgResultsForDashboard} />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {!isLastTerm ?
              <button onClick={onStartNewTerm} className="px-6 py-3 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg shadow-glow-red transition-all">
                Start New Term
              </button>
              :
              <p className="text-lg text-green-400">All terms complete. Final analysis concluded.</p>
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

export default FinalScoreModal;