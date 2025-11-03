
export type GameState = 'selecting_year' | 'playing' | 'results';

export interface SimulationData {
  ridership: number;
  profit: number;
  satisfaction: number;
}

export interface ResultsData {
  totalRevenue: number;
  ridership: number;
  satisfaction: number;
  profit: number;
  outcomeMessage: string;
}
