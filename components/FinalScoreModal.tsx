import React from 'react';
import { FinalScoreData, ResultsData } from '../types';
import Dashboard from './Dashboard';
import PerformanceMatrix from './PerformanceMatrix';
import HistoricalChart from './HistoricalChart';

interface FinalScoreModalProps {
  scoreData: FinalScoreData;
  onStartNewTerm: () => void;
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

const FinalScoreModal: React.FC<FinalScoreModalProps> = ({ scoreData, onStartNewTerm }) => {
  const avgResultsForDashboard: Omit<ResultsData, 'year' | 'fare'| 'outcomeMessage'> = {
      ridership: scoreData.avgRidership,
      profit: scoreData.avgProfit,
      satisfaction: scoreData.avgSatisfaction,
      totalRevenue: scoreData.results.reduce((sum, r) => sum + r.totalRevenue, 0) / 3,
      costs: scoreData.results.reduce((sum, r) => sum + r.costs, 0) / 3,
  };

  const termYears = scoreData.results.map(r => r.year);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl bg-gray-900 border-2 border-red-500/70 rounded-lg shadow-glow-red animate-fadeIn relative max-h-[95vh] flex flex-col">
        <div className="p-4 sm:p-6 overflow-y-auto">
          <h2 className="text-2xl md:text-3xl text-center font-bold text-red-400 mb-4">3-YEAR TERM REVIEW: {termYears[0]}, {termYears[1]}, {termYears[2]}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex-shrink-0 text-center">
                    <ScoreCircle score={scoreData.score} />
                    <p className="text-gray-300 mt-2 font-bold">Overall Score</p>
                </div>
                <div className="text-center sm:text-left flex-grow">
                  <h3 className="text-2xl font-bold text-white tracking-wider mb-2">{scoreData.directorTitle}</h3>
                  <p className="font-bold text-red-400 block mb-2">AI ADVISOR ANALYSIS:</p>
                  <p className="text-lg text-gray-200 italic">"{scoreData.finalReport}"</p>
                </div>
            </div>
             <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <PerformanceMatrix data={scoreData.results} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
             <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <HistoricalChart data={scoreData.results}/>
            </div>
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                 <h3 className="text-lg text-center text-gray-300 mb-2 font-bold">3-Year Average Performance</h3>
                 <Dashboard data={avgResultsForDashboard} />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={onStartNewTerm} className="px-8 py-4 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg shadow-glow-red transition-all text-xl">
              BEGIN NEW TERM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalScoreModal;