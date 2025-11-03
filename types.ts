export type GameState = 'intro' | 'selecting_year' | 'playing' | 'results_modal' | 'final_score';

export interface SimulationData {
  ridership: number;
  profit: number;
  satisfaction: number;
}

export interface ResultsData {
  year: number;
  fare: number;
  totalRevenue: number;
  costs: number;
  ridership: number;
  satisfaction: number;
  profit: number;
  outcomeMessage: string;
}

export interface FinalScoreData {
    score: number;
    avgProfit: number;
    avgSatisfaction: number;
    avgRidership: number;
    finalReport: string;
    directorTitle: string;
    results: ResultsData[];
}