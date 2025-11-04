import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GameState, ResultsData, FinalScoreData } from './types';
import { YEARS, SCENARIOS, ECONOMIC_PARAMS, INITIAL_FARE } from './constants';
import ControlPanel from './components/ControlPanel';
import ResultsModal from './components/ResultsModal';
import FinalScoreModal from './components/FinalScoreModal';
import { SoundOnIcon, SoundOffIcon } from './components/icons';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
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

    if (gameState === 'intro') {
      const timer = setTimeout(() => {
        setGameState('selecting_year');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const playClickSound = useCallback(() => {
    if (!isMuted) {
      const clickAudio = document.getElementById('ui-click') as HTMLAudioElement;
      if (clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(e => console.error("Click sound failed:", e));
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    playClickSound();
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
        const prompt = `You are an advisor for a simulation game. Explain the key event for the year ${year} in simple terms a parent could understand: "${historicalContext}". Briefly mention how it might affect people's jobs or their willingness to travel. Keep it to one sentence and under 20 words.`;
        
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("AI scenario generation failed:", error);
        return SCENARIOS[year]?.description || "Economic conditions are uncertain. Proceed with caution.";
    }
  };

  const startTerm = async () => {
    playClickSound();
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
  
  const calculateMetrics = useCallback((currentFare: number, year: number, previousFare: number) => {
    const { baseRidership, elasticity, baseFare, operationalCost } = ECONOMIC_PARAMS;
    const scenario = SCENARIOS[year];
    
    if (currentFare < 0.01) { // Free fare scenario
        const ridership = baseRidership * 1.25 * (1 + (Math.random() - 0.5) * scenario.volatility); // 25% ridership boost
        const totalCosts = operationalCost * (1 + (Math.random() - 0.2) * scenario.costModifier);
        return { ridership, profit: -totalCosts, satisfaction: 100, totalRevenue: 0, costs: totalCosts };
    }

    const volatilityFactor = 1 + (Math.random() - 0.5) * scenario.volatility;
    const costFactor = 1 + (Math.random() - 0.2) * scenario.costModifier;
    
    let ridership = baseRidership * (1 + elasticity * ((currentFare - baseFare) / baseFare)) * volatilityFactor;
    ridership = Math.max(0, ridership);
    
    const totalCosts = operationalCost * costFactor;
    const totalRevenue = currentFare * ridership;
    const profit = totalRevenue - totalCosts;

    // Stricter, more realistic satisfaction logic, adjusted for $0-$1 fare range
    const baseSatisfaction = 100 - (80 * Math.pow(Math.max(0, currentFare - 0.85), 1.5));
    const fareDelta = currentFare - previousFare;
    let fareChangeImpact = 0;

    if (fareDelta > 0) { // Price increased
      const contextualMultiplier = 1 + (scenario.volatility * 2.5);
      const basePenalty = -(fareDelta * 90);
      fareChangeImpact = basePenalty * contextualMultiplier;
    } else if (fareDelta < 0) { // Price decreased
      fareChangeImpact = Math.abs(fareDelta) * 25;
    }
    
    const finalSatisfaction = baseSatisfaction + fareChangeImpact;
    const satisfaction = Math.max(0, Math.min(100, finalSatisfaction));

    return { ridership, profit, satisfaction, totalRevenue, costs: totalCosts };
  }, []);

  const handleConfirmFare = async () => {
    playClickSound();
    const currentYear = termYears[currentYearIndex];
    if (currentYear === null) return;
    
    setIsProcessing(true);

    const previousFare = currentYearIndex > 0 ? termResults[currentYearIndex - 1].fare : INITIAL_FARE;
    const metrics = calculateMetrics(fare, currentYear, previousFare);
    
    let outcomeMessage = "Performance data analyzed.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const scenario = SCENARIOS[currentYear];
        const prompt = `You are a stern economic AI advisor. Analyze this decision for year ${currentYear}: Fare was set to S$${fare.toFixed(2)} from last year's S$${previousFare.toFixed(2)}. The economic event was "${scenario.description}", where the ideal action was to '${scenario.idealAction.replace('_', ' ')}' the fare. Result: Profit S$${metrics.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}, Satisfaction ${metrics.satisfaction.toFixed(1)}%. Write a sharp, one-sentence judgment (max 20 words) on whether the fare decision was sound or misguided given the context.`;
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

    setYearlyResult(newResult);
    setGameState('results_modal');
    setIsProcessing(false);
  };

  const handleContinueFromResults = async () => {
    playClickSound();
    if (!yearlyResult) return;
    const updatedResults = [...termResults, yearlyResult];
    setTermResults(updatedResults);
    setYearlyResult(null);

    if (currentYearIndex < 2) {
      const nextIndex = currentYearIndex + 1;
      setCurrentYearIndex(nextIndex);
      const nextYear = termYears[nextIndex];
      
      setFare(yearlyResult.fare); 
      setIsGenerating(true);
      setGameState('playing');
      const scenario = await getAiScenario(nextYear);
      setAiScenario(scenario);
      setIsGenerating(false);
    } else {
      calculateFinalScore(updatedResults);
    }
  };

  const calculateFinalScore = async (finalResults: ResultsData[]) => {
    setIsProcessing(true);
    const avgProfit = finalResults.reduce((sum, r) => sum + r.profit, 0) / 3;
    const avgSatisfaction = finalResults.reduce((sum, r) => sum + r.satisfaction, 0) / 3;
    const avgRidership = finalResults.reduce((sum, r) => sum + r.ridership, 0) / 3;

    const satisfactionScore = (Math.pow(avgSatisfaction / 100, 2)) * 100;
    const profitBenchmark = 150000;
    const profitScore = Math.max(0, (avgProfit / profitBenchmark) * 100);

    let strategicPoints = 0;
    let strategicSummary = "";
    finalResults.forEach((result, index) => {
        const previousFare = index > 0 ? finalResults[index - 1].fare : INITIAL_FARE;
        const fareDelta = result.fare - previousFare;
        const ideal = SCENARIOS[result.year].idealAction;
        let match = false;
        
        if (ideal === 'decrease' && fareDelta < -0.01) match = true;
        else if (ideal === 'maintain' && Math.abs(fareDelta) <= 0.05) match = true;
        else if (ideal === 'slight_increase' && fareDelta > 0.01 && fareDelta < 0.15) match = true;

        if (match) {
            strategicPoints += 1;
            strategicSummary += `Year ${result.year}: Correctly adhered to '${ideal.replace('_', ' ')}' advice. `;
        } else {
            strategicPoints -= 1;
            strategicSummary += `Year ${result.year}: Ignored advice to '${ideal.replace('_', ' ')}'. `;
        }
    });
    const strategicScore = Math.max(0, ((strategicPoints + 3) / 6) * 100);

    const finalScore = Math.round(
      (satisfactionScore * 0.45) + 
      (profitScore * 0.35) + 
      (strategicScore * 0.20)
    );

    let finalReport = "Term complete. Performance metrics analyzed.";
    let directorTitle = "Director";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const reportPrompt = `You are a senior AI advisor delivering a final term review. Strategic Summary: ${strategicSummary}. Final Score: ${finalScore}. Avg Profit: S$${avgProfit.toFixed(0)}. Avg Satisfaction: ${avgSatisfaction.toFixed(1)}%. Write a single, conclusive summary sentence (max 20 words) evaluating the director's strategic judgment against the economic realities faced.`;
        const titlePrompt = `Based on a final score of ${finalScore}, an average profit of S$${avgProfit.toFixed(0)}, and average public satisfaction of ${avgSatisfaction.toFixed(1)}%, generate a fitting, 1-3 word "Director's Title". Examples: 'Economic Pariah' (low score), 'Public Hero' (high satisfaction, low profit), 'Fiscal Genius' (high profit), 'Master Planner' (high overall).`;
        
        const [reportResponse, titleResponse] = await Promise.all([
           ai.models.generateContent({ model, contents: reportPrompt }),
           ai.models.generateContent({ model, contents: titlePrompt })
        ]);
        
        finalReport = reportResponse.text;
        directorTitle = titleResponse.text.replace(/["']/g, ""); // Remove quotes
    } catch (error) {
        console.error("Final AI report generation failed:", error);
    }

    setFinalScoreData({
        score: finalScore,
        avgProfit,
        avgSatisfaction,
        avgRidership,
        finalReport,
        directorTitle,
        results: finalResults,
    });
    setGameState('final_score');
    setIsProcessing(false);
  }
  
  const handleStartNewTerm = () => {
    playClickSound();
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
            
            {gameState === 'intro' && (
                 <div className="text-center animate-fadeIn">
                    <h2 className="text-2xl text-red-400 animate-pulse">SYSTEM INITIALIZING...</h2>
                    <p className="font-mono text-green-400">LOADING SIMULATION ARCHIVES [2000-2009]</p>
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
                    isFinalYear={currentYearIndex === 2}
                />
            )}
            
            {gameState === 'final_score' && finalScoreData && (
                <FinalScoreModal
                    scoreData={finalScoreData}
                    onStartNewTerm={handleStartNewTerm}
                />
            )}
        </main>
    </div>
  );
};

export default App;