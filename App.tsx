
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GameState, ResultsData } from './types';
import { YEARS, SCENARIOS, ECONOMIC_PARAMS, INITIAL_FARE } from './constants';
import ControlPanel from './components/ControlPanel';
import ResultsModal from './components/ResultsModal';
import { SoundOnIcon, SoundOffIcon } from './components/icons';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('selecting_year');
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>(YEARS);
  const [fare, setFare] = useState<number>(INITIAL_FARE);
  const [results, setResults] = useState<ResultsData | null>(null);
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

  const calculateMetrics = useCallback((currentFare: number) => {
    const { baseRidership, elasticity, baseFare, fixedCost } = ECONOMIC_PARAMS;
    
    let ridership = baseRidership * (1 + elasticity * ((currentFare - baseFare) / baseFare));
    ridership = Math.max(0, ridership);

    const profit = (currentFare * ridership) - fixedCost;
    
    let satisfaction = 100 - (30 * Math.pow(currentFare - 1.2, 2));
    satisfaction = Math.max(0, Math.min(100, satisfaction));

    return { ridership, profit, satisfaction };
  }, []);

  const handleYearSelect = async (year: number) => {
    setCurrentYear(year);
    setFare(INITIAL_FARE);
    setIsGenerating(true);
    setGameState('playing');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-flash-latest';
        const historicalContext = SCENARIOS[year];
        const prompt = `You are a simulation master for 'SMRT Economy', an economic game about Singapore's MRT system. Generate a short, immersive, one-paragraph intelligence briefing for the year ${year}. Your tone must be like a sci-fi mission control. Hint at the economic climate and public mood without giving exact numbers. Weave in this key context: "${historicalContext}". Keep it to 2-3 sentences.`;
        
        const response = await ai.models.generateContent({ model, contents: prompt });
        setAiScenario(response.text);
    } catch (error) {
        console.error("AI scenario generation failed:", error);
        setAiScenario(SCENARIOS[year] || "Economic conditions are uncertain. Proceed with caution.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleConfirmFare = async () => {
    if (currentYear === null) return;
    const metrics = calculateMetrics(fare);
    setIsProcessing(true);

    const totalRevenue = fare * metrics.ridership;
    let outcomeMessage = 'The network remains stable, but there is room for optimization.'; // Fallback

    try {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         const model = 'gemini-flash-latest';
         const prompt = `You are an economic advisor AI in the 'SMRT Economy' simulation. The Transport Director has finished year ${currentYear}.

         - Fare Set: S$${fare.toFixed(2)}
         - Resulting Ridership: ${metrics.ridership.toLocaleString()}
         - Resulting Profit: S$${metrics.profit.toLocaleString()}
         - Public Satisfaction: ${metrics.satisfaction.toFixed(1)}%

         Write a concise, one-paragraph performance review (2-4 sentences). Your tone is a futuristic AI assistant. Analyze the results. If performance was good (high satisfaction & profit), be encouraging. If bad (financial loss or public outrage), be critical but constructive.`;

        const response = await ai.models.generateContent({ model, contents: prompt });
        outcomeMessage = response.text;
    } catch (error) {
        console.error("AI report generation failed:", error);
        // Use the old logic as a fallback
        if (metrics.satisfaction > 85 && metrics.profit > 250000 && metrics.ridership > 950000) {
          outcomeMessage = 'Excellent management. The network thrives under your leadership.';
        } else if (fare > 1.8) {
          outcomeMessage = 'Overpriced transport sparks commuter outrage.';
        } else if (metrics.profit < 0) {
          outcomeMessage = 'Underpriced network runs at a loss.';
        }
    }

    const finalResults: ResultsData = {
      totalRevenue,
      ridership: metrics.ridership,
      satisfaction: metrics.satisfaction,
      profit: metrics.profit,
      outcomeMessage,
    };

    setResults(finalResults);
    setIsProcessing(false);
    setGameState('results');
  };
  
  const handlePlayAgain = () => {
    if(currentYear) {
      setAvailableYears(prev => prev.filter(y => y !== currentYear));
    }
    setGameState('selecting_year');
    setCurrentYear(null);
    setResults(null);
  };

  const handleRestart = () => {
    setAvailableYears(YEARS);
    setGameState('selecting_year');
    setCurrentYear(null);
    setResults(null);
  };

  return (
    <div className="bg-black text-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] opacity-30"></div>
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
            {isProcessing && (
                <div className="z-40 text-center">
                    <h2 className="text-2xl text-red-400 animate-pulse">SYSTEM PROCESSING...</h2>
                    <p>Analyzing Economic Impact...</p>
                </div>
            )}

            {gameState === 'selecting_year' && !isProcessing && (
                <div className="text-center animate-fadeIn">
                    <h2 className="text-2xl mb-4 text-gray-200">Welcome, Transport Director.</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-400">Select a year to begin your term. Adjust the fares to balance profit and public trust.</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {availableYears.map(year => (
                            <button key={year} onClick={() => handleYearSelect(year)} className="p-6 bg-gray-900/70 border border-red-500/50 rounded-lg text-2xl font-bold text-red-400 hover:bg-red-500/20 hover:shadow-glow-red transition-all duration-300">
                                {year}
                            </button>
                        ))}
                    </div>
                     {availableYears.length === 0 && (
                        <div className="col-span-full text-center mt-8">
                            <p className="text-xl text-green-400 mb-4">Simulation Complete. You have served a full decade.</p>
                            <button onClick={handleRestart} className="px-6 py-3 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg shadow-glow-red transition-all">
                                Restart Simulation
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {gameState === 'playing' && isGenerating && (
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
                    />
                </div>
            )}
            
            {gameState === 'results' && results && (
                <ResultsModal 
                    results={results}
                    onPlayAgain={handlePlayAgain}
                    onRestart={handleRestart}
                    isLastYear={availableYears.length === 0}
                />
            )}
        </main>
    </div>
  );
};

export default App;
