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
  if (level < 11) {
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

  if (level < 16) {
    return {
      count: 1,
      strategy: 'local-biased',
      mistakeChance: 0.38,
      memoryWeight: 0.1,
      routeLookahead: 0,
      decisionIntervalMs: 780,
      moveIntervalMs: 620,
      speedScale: 0.82,
    };
  }

  if (level < 21) {
    return {
      count: 1,
      strategy: 'memory-biased',
      mistakeChance: 0.22,
      memoryWeight: 0.42,
      routeLookahead: 1,
      decisionIntervalMs: 620,
      moveIntervalMs: 540,
      speedScale: 0.9,
    };
  }

  if (level < 25) {
    return {
      count: 2,
      strategy: 'coordinated-biased',
      mistakeChance: 0.18,
      memoryWeight: 0.5,
      routeLookahead: 2,
      decisionIntervalMs: 560,
      moveIntervalMs: 520,
      speedScale: 0.92,
    };
  }

  if (level < 30) {
    return {
      count: 2,
      strategy: 'route-evaluation',
      mistakeChance: 0.1,
      memoryWeight: 0.65,
      routeLookahead: 4,
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
