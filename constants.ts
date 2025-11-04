export const YEARS = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009];

export const SCENARIOS: { [key: number]: { description: string; volatility: number; costModifier: number; idealAction: 'decrease' | 'maintain' | 'slight_increase' } } = {
  2000: { description: "Dot-com boom fuels high GDP growth and economic optimism.", volatility: 0.05, costModifier: 0.02, idealAction: 'maintain' },
  2001: { description: "Post-9/11 recession and the Dot-com bust hit Singapore's export-driven economy hard.", volatility: 0.18, costModifier: 0.05, idealAction: 'decrease' },
  2002: { description: "Slow global recovery continues. Public is highly price-sensitive due to economic uncertainty.", volatility: 0.10, costModifier: 0.04, idealAction: 'maintain' },
  2003: { description: "SARS Outbreak severely impacts tourism and public confidence, causing ridership to plummet.", volatility: 0.25, costModifier: 0.08, idealAction: 'decrease' },
  2004: { description: "Strong economic rebound and a recovering property market significantly boost commuter numbers.", volatility: 0.08, costModifier: 0.03, idealAction: 'maintain' },
  2005: { description: "Approval of Integrated Resorts begins a construction boom, driving up labor and material costs.", volatility: 0.06, costModifier: 0.15, idealAction: 'slight_increase' },
  2006: { description: "Economy grows strongly, but rising global oil prices and inflation squeeze operational margins.", volatility: 0.12, costModifier: 0.18, idealAction: 'slight_increase' },
  2007: { description: "The economy is at its pre-crisis peak with high employment, but asset bubbles are forming.", volatility: 0.10, costModifier: 0.10, idealAction: 'maintain' },
  2008: { description: "The Global Financial Crisis triggers a technical recession in Singapore and widespread job cuts.", volatility: 0.22, costModifier: 0.05, idealAction: 'decrease' },
  2009: { description: "Government stimulus helps begin a slow recovery, but consumer confidence remains fragile.", volatility: 0.15, costModifier: 0.06, idealAction: 'maintain' }
};

export const ECONOMIC_PARAMS = {
  baseRidership: 1_100_000,
  elasticity: -0.3,
  baseFare: 0.80,
  operationalCost: 850_000,
};

export const INITIAL_FARE = 0.80;