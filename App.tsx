

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GameState, ResultsData, FinalScoreData } from './types';
import { YEARS, SCENARIOS, ECONOMIC_PARAMS, INITIAL_FARE } from './constants';
import ControlPanel from './components/ControlPanel';
import ResultsModal from './components/ResultsModal';
import FinalScoreModal from './components/FinalScoreModal';
import { SoundOnIcon, SoundOffIcon } from './components/icons';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('selecting_year');
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>(YEARS);
  const [fare, setFare] = useState<number>(INITIAL_FARE);
  const [yearlyResult, setYearlyResult] = useState<ResultsData | null>(null);
  const [termResults, setTermResults] = useState<ResultsData[]>([]);
  const [finalScoreData, setFinalScoreData] = useState<FinalScoreData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiScenario, setAiScenario] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioInstance = new Audio("https://cdn.pixabay.com/download/audio/2022/04/17/audio_651c368d4d.mp3");
    audioInstance.loop = true;
    audioInstance.volume = 0.3;
    setAudio(audioInstance);
  }, []);

  const toggleMute = () => {
    if (!audio) return;
    if (isMuted) {
      audio.play().catch(e => console.error("Audio playback failed:", e));
    } else {
      audio.pause();
    }
    setIsMuted(!isMuted);
  };
  
  const getAiScenario = async (year: number) => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const historicalContext = SCENARIOS[year];
        const prompt = `You are a simulation master for 'SMRT Economy', an economic game about Singapore's MRT system. Generate a very short, one-sentence, telegram-style intelligence briefing for the year ${year}. Tone: futuristic mission control. Focus on the main economic event: "${historicalContext}". Max 15 words.`;
        
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("AI scenario generation failed:", error);
        return SCENARIOS[year] || "Economic conditions are uncertain. Proceed with caution.";
    }
  };


  const handleYearSelect = async (year: number) => {
    setCurrentYear(year);
    setFare(INITIAL_FARE);
    setTermResults([]);
    setIsGenerating(true);
    setGameState('playing');
    const scenario = await getAiScenario(year);
    setAiScenario(scenario);
    setIsGenerating(false);
  };
  
  const calculateMetrics = useCallback((currentFare: number) => {
    const { baseRidership, elasticity, baseFare, fixedCost } = ECONOMIC_PARAMS;
    let ridership = baseRidership * (1 + elasticity * ((currentFare - baseFare) / baseFare));
    ridership = Math.max(0, ridership);
    const profit = (currentFare * ridership) - fixedCost;
    let satisfaction = 100 - (30 * Math.pow(currentFare - 1.2, 2));
    satisfaction = Math.max(0, Math.min(100, satisfaction));
    return { ridership, profit, satisfaction };
  }, []);

  const handleConfirmFare = async () => {
    if (currentYear === null) return;
    
    setIsProcessing(true);

    const metrics = calculateMetrics(fare);
    let outcomeMessage = "Performance data analyzed.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const prompt = `You are an AI advisor in the 'SMRT Economy' simulation. The year is ${currentYear}. The fare was set to S$${fare.toFixed(2)}. This resulted in: Profit of S$${metrics.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}, and Public Satisfaction of ${metrics.satisfaction.toFixed(1)}%. The key event this year was: "${SCENARIOS[currentYear]}". Write a very short, one-sentence performance analysis (max 20 words) for the year. Tone: concise, futuristic AI report.`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        outcomeMessage = response.text;
    } catch(e) {
        console.error("Failed to generate yearly outcome", e);
    }


    const newResult: ResultsData = {
        year: currentYear,
        totalRevenue: fare * metrics.ridership,
        ridership: metrics.ridership,
        satisfaction: metrics.satisfaction,
        profit: metrics.profit,
        outcomeMessage: outcomeMessage,
    };

    if (termResults.length < 2) {
        setYearlyResult(newResult);
        setGameState('results_modal');
    } else {
        const finalResults = [...termResults, newResult];
        setTermResults(finalResults);
        calculateFinalScore(finalResults);
    }
    
    setIsProcessing(false);
  };

  const handleContinueFromResults = async () => {
    if (!yearlyResult) return;
    const updatedResults = [...termResults, yearlyResult];
    setTermResults(updatedResults);
    setYearlyResult(null);

    const nextYear = yearlyResult.year + 1;
    setCurrentYear(nextYear);
    setFare(INITIAL_FARE);
    setIsGenerating(true);
    setGameState('playing');
    const scenario = await getAiScenario(nextYear);
    setAiScenario(scenario);
    setIsGenerating(false);
  };

  const calculateFinalScore = async (finalResults: ResultsData[]) => {
    setIsProcessing(true);
    const avgProfit = finalResults.reduce((sum, r) => sum + r.profit, 0) / 3;
    const avgSatisfaction = finalResults.reduce((sum, r) => sum + r.satisfaction, 0) / 3;
    const avgRidership = finalResults.reduce((sum, r) => sum + r.ridership, 0) / 3;

    const minProfit = -200000;
    const maxProfit = 500000;
    const profitScore = Math.max(0, Math.min(100, ((avgProfit - minProfit) / (maxProfit - minProfit)) * 100));
    const finalScore = Math.round((avgSatisfaction * 0.6) + (profitScore * 0.4));

    let finalReport = "Your term is complete. Performance metrics indicate a mixed result. Further analysis is required.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const startYear = finalResults[0].year;
        const endYear = finalResults[2].year;
        const prompt = `You are a senior economic advisor AI in the 'SMRT Economy' simulation. The Transport Director has just completed a 3-year term from ${startYear} to ${endYear}. Their performance summary:
- Average Annual Profit: S$${avgProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}
- Average Public Satisfaction: ${avgSatisfaction.toFixed(1)}%
- Average Annual Ridership: ${avgRidership.toLocaleString(undefined, {maximumFractionDigits: 0})}
Write a concise, one-paragraph performance review (3-4 sentences) for their term. Your tone is a futuristic AI assistant. Analyze the overall strategy and its impact. Provide a concluding remark.`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        finalReport = response.text;
    } catch (error) {
        console.error("Final AI report generation failed:", error);
    }

    setFinalScoreData({
        score: finalScore,
        avgProfit,
        avgSatisfaction,
        avgRidership,
        finalReport,
        termYears: [finalResults[0].year, finalResults[1].year, finalResults[2].year],
    });
    setGameState('final_score');
    setIsProcessing(false);
  }
  
  const handleStartNewTerm = () => {
    if(termResults.length > 0) {
      setAvailableYears(prev => prev.filter(y => y !== termResults[0].year));
    }
    setGameState('selecting_year');
    setCurrentYear(null);
    setTermResults([]);
    setFinalScoreData(null);
  };

  const handleRestart = () => {
    setAvailableYears(YEARS);
    setGameState('selecting_year');
    setCurrentYear(null);
    setTermResults([]);
    setFinalScoreData(null);
  };

  const previousYearResults = termResults.length > 0 ? termResults[termResults.length - 1] : null;

  return (
    <div className="bg-black text-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0)))] opacity-30"></div>
        <div className="absolute top-4 right-4 z-50">
          <button onClick={toggleMute} className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition-colors shadow-glow-white">
            {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
        </div>

        <header className="w-full max-w-6xl text-center mb-8 animate-fadeIn">
            <h1 className="text-3xl md:text-5xl font-bold text-red-400 tracking-widest uppercase shadow-glow-red">SMRT Economy</h1>
            <p className="text-lg md:text-xl text-gray-300 mt-2">Ticket Price Challenge</p>
        </header>

        <main className="w-full max-w-6xl flex-grow flex flex-col items-center justify-center">
            {(isProcessing && gameState !== 'final_score') && (
                <div className="z-40 text-center">
                    <h2 className="text-2xl text-red-400 animate-pulse">SYSTEM PROCESSING...</h2>
                    <p>Analyzing Economic Impact for {currentYear}...</p>
                </div>
            )}

            {gameState === 'selecting_year' && !isProcessing && (
                <div className="text-center animate-fadeIn w-full">
                    <h2 className="text-2xl mb-2 text-red-400/80 tracking-wider">INCOMING TRANSMISSION...</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-400">Select starting year for your 3-year term as Transport Director.</p>
                    <div className="max-w-3xl mx-auto p-4 border border-red-500/30 bg-black/20 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {availableYears.map(year => (
                              <button 
                                key={year} 
                                onClick={() => handleYearSelect(year)} 
                                className="relative p-6 bg-gray-900/70 border border-red-500/50 rounded-lg text-2xl font-bold text-red-400 hover:bg-red-500/20 hover:shadow-glow-red transition-all duration-300 overflow-hidden group">
                                  <span className="relative z-10">{year}</span>
                                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                                    maskImage: 'linear-gradient(to top, transparent, black)',
                                  }}></span>
                                  <span className="absolute top-0 left-0 w-full h-[2px] bg-red-400/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                              </button>
                          ))}
                      </div>
                    </div>
                     {availableYears.length === 0 && (
                        <div className="col-span-full text-center mt-8">
                            <p className="text-xl text-green-400 mb-4">All terms complete. You have served with distinction.</p>
                            <button onClick={handleRestart} className="px-6 py-3 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg shadow-glow-red transition-all">
                                Restart Simulation
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {(gameState === 'playing' && isGenerating) && (
                <div className="z-40 text-center animate-fadeIn">
                    <h2 className="text-2xl text-red-400 animate-pulse">RECEIVING INTEL BRIEFING...</h2>
                    <p>Accessing historical economic data for {currentYear}...</p>
                </div>
            )}

            {gameState === 'playing' && !isGenerating && !isProcessing && (
                 <div className="w-full max-w-2xl mx-auto animate-fadeIn">
                    <ControlPanel
                        year={currentYear!}
                        scenario={aiScenario}
                        fare={fare}
                        onFareChange={setFare}
                        onConfirm={handleConfirmFare}
                        previousYearResults={previousYearResults}
                        termProgress={termResults.length + 1}
                    />
                </div>
            )}

            {gameState === 'results_modal' && yearlyResult && (
                <ResultsModal
                    results={yearlyResult}
                    onContinue={handleContinueFromResults}
                />
            )}
            
            {gameState === 'final_score' && finalScoreData && (
                <FinalScoreModal
                    scoreData={finalScoreData}
                    onStartNewTerm={handleStartNewTerm}
                    onRestart={handleRestart}
                    isLastTerm={availableYears.length === 0 && termResults.length > 0}
                />
            )}
        </main>
    </div>
  );
};

export default App;