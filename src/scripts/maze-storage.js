export const MAZE_HIGH_SCORE_KEY = 'burakOs.mazeHighScore.v1';
export const MAZE_MUSIC_ENABLED_KEY = 'burakOs.mazeMusicEnabled.v1';

export const createMazeHighScoreStore = ({ storage, key = MAZE_HIGH_SCORE_KEY } = {}) => {
  let memoryHighScore = 0;

  const readStored = () => {
    try {
      const value = storage?.getItem?.(key);
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
    } catch {
      return memoryHighScore;
    }
  };

  const writeStored = (value) => {
    memoryHighScore = value;

    try {
      storage?.setItem?.(key, String(value));
    } catch {
      // localStorage can be disabled; the in-memory fallback keeps the run playable.
    }
  };

  return {
    get() {
      return Math.max(memoryHighScore, readStored());
    },
    update(score) {
      const nextScore = Math.max(0, Math.floor(Number(score) || 0));
      const current = this.get();
      if (nextScore > current) {
        writeStored(nextScore);
        return nextScore;
      }
      return current;
    },
  };
};

export const createMazeMusicPreferenceStore = ({ storage, key = MAZE_MUSIC_ENABLED_KEY } = {}) => {
  let memoryEnabled = false;

  const readStored = () => {
    try {
      const value = storage?.getItem?.(key);
      if (value === 'true') return true;
      if (value === 'false') return false;
      return memoryEnabled;
    } catch {
      return memoryEnabled;
    }
  };

  const writeStored = (enabled) => {
    memoryEnabled = Boolean(enabled);

    try {
      storage?.setItem?.(key, String(memoryEnabled));
    } catch {
      // localStorage can be disabled; the in-memory preference keeps the control usable.
    }

    return memoryEnabled;
  };

  return {
    get() {
      return readStored();
    },
    set(enabled) {
      return writeStored(enabled);
    },
  };
};
