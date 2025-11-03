
export const YEARS = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009];

export const SCENARIOS: { [key: number]: string } = {
  2000: "The new millennium begins with economic optimism. Commuters are hopeful.",
  2001: "A global tech bubble burst sends ripples through the economy. Caution is advised.",
  2002: "The new Circle Line is under construction, increasing operational costs.",
  2003: "SARS outbreak impacts public transport usage significantly. Ridership is volatile.",
  2004: "Economic recovery is underway. Demand for public transport is rising.",
  2005: "Fuel prices surge globally. The cost of energy is at an all-time high.",
  2006: "A new government initiative promotes public transport. Commuter expectations are high.",
  2007: "Competition from budget ride-sharing services begins to emerge.",
  2008: "The Global Financial Crisis hits. Household budgets are tight.",
  2009: "Infrastructure upgrades are needed. The network requires significant investment."
};

export const ECONOMIC_PARAMS = {
  baseRidership: 1_000_000,
  elasticity: -0.3,
  baseFare: 1.20,
  fixedCost: 700_000,
};

export const INITIAL_FARE = 1.20;
