export const YEARS = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009];

export const SCENARIOS: { [key: number]: { description: string; volatility: number; costModifier: number } } = {
  2000: { description: "The new millennium begins with economic optimism.", volatility: 0.05, costModifier: 0.02 },
  2001: { description: "A global tech bubble burst sends ripples through the economy.", volatility: 0.15, costModifier: 0.05 },
  2002: { description: "The new Circle Line is under construction, increasing operational costs.", volatility: 0.05, costModifier: 0.12 },
  2003: { description: "SARS outbreak impacts public transport usage significantly.", volatility: 0.25, costModifier: 0.08 },
  2004: { description: "Economic recovery is underway, boosting commuter numbers.", volatility: 0.10, costModifier: 0.03 },
  2005: { description: "Fuel prices surge globally, increasing energy costs.", volatility: 0.08, costModifier: 0.18 },
  2006: { description: "A government initiative promotes public transport usage.", volatility: 0.12, costModifier: 0.06 },
  2007: { description: "Competition from budget ride-sharing services begins to emerge.", volatility: 0.15, costModifier: 0.04 },
  2008: { description: "The Global Financial Crisis hits. Household budgets are tight.", volatility: 0.20, costModifier: 0.05 },
  2009: { description: "Major infrastructure upgrades require significant investment.", volatility: 0.05, costModifier: 0.15 }
};

export const ECONOMIC_PARAMS = {
  baseRidership: 1_000_000,
  elasticity: -0.3,
  baseFare: 1.20,
  operationalCost: 800_000,
};

export const INITIAL_FARE = 1.20;
