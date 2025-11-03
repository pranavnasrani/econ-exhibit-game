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
  const [termYears, setTermYears] = useState<number[]>([]);
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(0);
  const [fare, setFare] = useState<number>(INITIAL_FARE);
  const [yearlyResult, setYearlyResult] = useState<ResultsData | null>(null);
  const [termResults, setTermResults] = useState<ResultsData[]>([]);
  const [finalScoreData, setFinalScoreData] = useState<FinalScoreData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiScenario, setAiScenario] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [glitch, setGlitch] = useState(false);

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
        const historicalContext = SCENARIOS[year].description;
        const prompt = `You are a simulation master for 'SMRT Economy', an economic game about Singapore's MRT system. Generate a very short, one-sentence, telegram-style intelligence briefing for the year ${year}. Tone: futuristic mission control. Focus on the main economic event: "${historicalContext}". Max 15 words.`;
        
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("AI scenario generation failed:", error);
        return SCENARIOS[year]?.description || "Economic conditions are uncertain. Proceed with caution.";
    }
  };

  const startTerm = async () => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 300);

    const shuffledYears = [...YEARS].sort(() => 0.5 - Math.random());
    const selectedYears = shuffledYears.slice(0, 3);
    setTermYears(selectedYears);
    setCurrentYearIndex(0);

    setFare(INITIAL_FARE);
    setTermResults([]);
    setIsGenerating(true);
    setGameState('playing');
    const scenario = await getAiScenario(selectedYears[0]);
    setAiScenario(scenario);
    setIsGenerating(false);
  };
  
  const calculateMetrics = useCallback((currentFare: number, year: number) => {
    const { baseRidership, elasticity, baseFare, operationalCost } = ECONOMIC_PARAMS;
    const scenario = SCENARIOS[year];
    
    // Add volatility
    const volatilityFactor = 1 + (Math.random() - 0.5) * scenario.volatility;
    const costFactor = 1 + (Math.random() - 0.2) * scenario.costModifier;
    
    let ridership = baseRidership * (1 + elasticity * ((currentFare - baseFare) / baseFare)) * volatilityFactor;
    ridership = Math.max(0, ridership);
    
    const totalCosts = operationalCost * costFactor;
    const totalRevenue = currentFare * ridership;
    const profit = totalRevenue - totalCosts;

    // Satisfaction is harshly penalized for high fares
    let satisfaction = 100 - (40 * Math.pow(Math.max(0, currentFare - 1.2), 1.8));
    satisfaction = Math.max(0, Math.min(100, satisfaction));

    return { ridership, profit, satisfaction, totalRevenue, costs: totalCosts };
  }, []);

  const handleConfirmFare = async () => {
    const currentYear = termYears[currentYearIndex];
    if (currentYear === null) return;
    
    setIsProcessing(true);

    const metrics = calculateMetrics(fare, currentYear);
    let outcomeMessage = "Performance data analyzed.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const prompt = `You are an AI advisor in 'SMRT Economy'. Year: ${currentYear}. Fare: S$${fare.toFixed(2)}. Resulted in: Profit of S$${metrics.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}, Public Satisfaction ${metrics.satisfaction.toFixed(1)}%. Key event: "${SCENARIOS[currentYear].description}". Write a very short, one-sentence performance analysis (max 20 words). Tone: concise, futuristic AI report.`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        outcomeMessage = response.text;
    } catch(e) {
        console.error("Failed to generate yearly outcome", e);
    }

    const newResult: ResultsData = {
        year: currentYear,
        fare: fare,
        totalRevenue: metrics.totalRevenue,
        costs: metrics.costs,
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

    const nextIndex = currentYearIndex + 1;
    setCurrentYearIndex(nextIndex);
    const nextYear = termYears[nextIndex];

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

    // Stricter scoring: heavily penalize low satisfaction and negative profit
    const satisfactionScore = (Math.pow(avgSatisfaction / 100, 2)) * 100; // non-linear, rewards high satisfaction
    
    const profitBenchmark = 100000; // A decent profit target
    let profitScore = 0;
    if (avgProfit > 0) {
        profitScore = Math.min(100, (avgProfit / profitBenchmark) * 50);
    } else {
        profitScore = Math.max(-50, (avgProfit / 50000) * 50); // Heavy penalty for losses
    }
    profitScore = Math.max(0, 50 + profitScore); // Base of 50, modified by profit/loss

    const finalScore = Math.round((satisfactionScore * 0.65) + (profitScore * 0.35));

    let finalReport = "Term complete. Performance metrics analyzed.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const prompt = `You are a senior AI advisor. The Director's 3-year term just ended. Key Metrics: Final Score ${finalScore}, Avg Profit S$${avgProfit.toFixed(0)}, Avg Satisfaction ${avgSatisfaction.toFixed(1)}%. Write a single, conclusive, telegram-style summary sentence (max 15 words) evaluating their performance.`;
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
        results: finalResults,
    });
    setGameState('final_score');
    setIsProcessing(false);
  }
  
  const handleStartNewTerm = () => {
    setGameState('selecting_year');
    setTermYears([]);
    setTermResults([]);
    setFinalScoreData(null);
  };

  const handleRestart = () => {
    setGameState('selecting_year');
    setTermYears([]);
    setTermResults([]);
    setFinalScoreData(null);
  };

  const currentYear = termYears.length > 0 ? termYears[currentYearIndex] : null;

  return (
    <div className="bg-black text-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0)))] opacity-30"></div>
        <div className="absolute top-4 right-4 z-50">
          <button onClick={toggleMute} className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition-colors shadow-glow-white">
            {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
        </div>

        <header className="w-full max-w-6xl text-center mb-8 animate-fadeIn">
            <h1 className={`text-3xl md:text-5xl font-bold text-red-400 tracking-widest uppercase shadow-glow-red ${glitch ? 'animate-glitch' : ''}`}>SMRT Economy</h1>
            <p className="text-lg md:text-xl text-gray-300 mt-2">Ticket Price Challenge</p>
        </header>

        <main className="w-full max-w-6xl flex-grow flex flex-col items-center justify-center">
            {isProcessing && gameState !== 'final_score' && (
                <div className="z-40 text-center">
                    <h2 className="text-2xl text-red-400 animate-pulse">SYSTEM PROCESSING...</h2>
                    <p>Analyzing Economic Impact for {currentYear}...</p>
                </div>
            )}

            {gameState === 'selecting_year' && !isProcessing && (
                <div className="text-center animate-fadeIn w-full">
                    <h2 className="text-2xl mb-2 text-red-400/80 tracking-wider">AWAITING COMMAND</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-400">Your 3-year term as Transport Director begins now. The system will assign you three random years from the 2000-2009 archives to manage.</p>
                     <button 
                        onClick={startTerm} 
                        className="px-8 py-4 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg shadow-glow-red transition-all text-xl">
                        BEGIN TERM
                    </button>
                </div>
            )}
            
            {(gameState === 'playing' && isGenerating) && (
                <div className="z-40 text-center animate-fadeIn">
                    <h2 className="text-2xl text-red-400 animate-pulse">RECEIVING INTEL BRIEFING...</h2>
                    <p>Accessing archival data for {currentYear}...</p>
                </div>
            )}

            {gameState === 'playing' && !isGenerating && !isProcessing && currentYear !== null && (
                 <div className="w-full max-w-2xl mx-auto animate-fadeIn">
                    <ControlPanel
                        year={currentYear}
                        scenario={aiScenario}
                        fare={fare}
                        onFareChange={setFare}
                        onConfirm={handleConfirmFare}
                        termProgress={currentYearIndex + 1}
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
                />
            )}
        </main>
    </div>
  );
};

export default App;
