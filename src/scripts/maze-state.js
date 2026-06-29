export const SCORE_RULES = {
  collectible: 25,
  levelBase: 100,
  levelMultiplier: 20,
  fullSweepBonus: 100,
};

export const calculateCollectibleScore = () => SCORE_RULES.collectible;

export const calculateLevelCompletionScore = (level, collectedAll = false) =>
  SCORE_RULES.levelBase + level * SCORE_RULES.levelMultiplier + (collectedAll ? SCORE_RULES.fullSweepBonus : 0);

export const getMonsterProfile = (level) => {
  if (level < 6) {
    return {
      count: 0,
      strategy: 'none',
      mistakeChance: 0,
      memoryWeight: 0,
      routeLookahead: 0,
      decisionIntervalMs: 0,
      moveIntervalMs: 0,
      speedScale: 0,
    };
  }

  if (level < 11) {
    return {
      count: 1,
      strategy: 'route-aware',
      mistakeChance: 0.24,
      memoryWeight: 0.32,
      routeLookahead: 1,
      decisionIntervalMs: 700,
      moveIntervalMs: 620,
      speedScale: 0.82,
    };
  }

  if (level < 21) {
    return {
      count: 2,
      strategy: level < 16 ? 'coordinated-route' : 'coordinated-memory',
      mistakeChance: level < 16 ? 0.14 : 0.1,
      memoryWeight: level < 16 ? 0.56 : 0.64,
      routeLookahead: level < 16 ? 3 : 4,
      decisionIntervalMs: level < 16 ? 600 : 540,
      moveIntervalMs: level < 16 ? 590 : 540,
      speedScale: 0.9,
    };
  }

  if (level < 25) {
    return {
      count: 2,
      strategy: 'coordinated-biased',
      mistakeChance: 0.09,
      memoryWeight: 0.68,
      routeLookahead: 5,
      decisionIntervalMs: 560,
      moveIntervalMs: 520,
      speedScale: 0.92,
    };
  }

  if (level < 30) {
    return {
      count: 2,
      strategy: 'route-evaluation',
      mistakeChance: 0.08,
      memoryWeight: 0.72,
      routeLookahead: 6,
      decisionIntervalMs: 460,
      moveIntervalMs: 460,
      speedScale: 0.96,
    };
  }

  return {
    count: 2,
    strategy: 'near-optimal',
    mistakeChance: 0.06,
    memoryWeight: 0.78,
    routeLookahead: 8,
    decisionIntervalMs: 360,
    moveIntervalMs: 420,
    speedScale: 1,
  };
};

export const createInitialMazeRunState = (highScore = 0) => ({
  status: 'idle',
  level: 1,
  score: 0,
  highScore,
  highestLevelReached: 1,
});
