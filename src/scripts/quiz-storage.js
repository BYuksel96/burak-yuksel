import { createCoachProgress, recordCoachAnswer } from './quiz-state.js';

export const QUIZ_SCHEMA_VERSION = 1;
export const QUIZ_PROGRESS_KEY = 'burakOs.quiz.progress.v1';
export const QUIZ_KEY_PREFIX = 'burakOs.quiz.';

export const createQuizProgress = () => ({
  schemaVersion: QUIZ_SCHEMA_VERSION,
  arcadeHighScore: 0,
  lastSelectedMode: null,
  ...createCoachProgress(),
});

const normalizeProgress = (value) => {
  const base = createQuizProgress();

  if (!value || typeof value !== 'object' || value.schemaVersion !== QUIZ_SCHEMA_VERSION) {
    return base;
  }

  return {
    ...base,
    ...value,
    arcadeHighScore: Math.max(0, Math.floor(Number(value.arcadeHighScore) || 0)),
    categories: {
      ...base.categories,
      ...(value.categories ?? {}),
    },
    questions: value.questions && typeof value.questions === 'object' ? value.questions : {},
  };
};

export const createQuizProgressStore = ({ storage, key = QUIZ_PROGRESS_KEY } = {}) => {
  let memoryProgress = createQuizProgress();

  const readStored = () => {
    try {
      const raw = storage?.getItem?.(key);
      if (!raw) return memoryProgress;
      return normalizeProgress(JSON.parse(raw));
    } catch {
      return memoryProgress;
    }
  };

  const writeStored = (progress) => {
    memoryProgress = normalizeProgress(progress);

    try {
      storage?.setItem?.(key, JSON.stringify(memoryProgress));
    } catch {
      // localStorage can be blocked; memory progress keeps Quiz.exe playable during this page session.
    }

    return memoryProgress;
  };

  const clearQuizKeys = () => {
    try {
      const keys = [];
      for (let index = 0; index < (storage?.length ?? 0); index += 1) {
        const itemKey = storage.key(index);
        if (itemKey?.startsWith(QUIZ_KEY_PREFIX)) keys.push(itemKey);
      }
      if (!keys.includes(key)) keys.push(key);
      keys.forEach((itemKey) => storage?.removeItem?.(itemKey));
    } catch {
      try {
        storage?.removeItem?.(key);
      } catch {
        // Ignore storage reset failures and keep the in-memory reset below.
      }
    }
  };

  return {
    get() {
      memoryProgress = normalizeProgress(readStored());
      return memoryProgress;
    },
    set(progress) {
      return writeStored(progress);
    },
    updateArcadeHighScore(score) {
      const current = this.get();
      const nextScore = Math.max(0, Math.floor(Number(score) || 0));
      if (nextScore <= current.arcadeHighScore) return current;
      return writeStored({
        ...current,
        arcadeHighScore: nextScore,
      });
    },
    recordCoachAnswer(question, isCorrect) {
      const current = this.get();
      return writeStored({
        ...current,
        ...recordCoachAnswer(current, question, isCorrect),
      });
    },
    setLastSelectedMode(mode) {
      const current = this.get();
      return writeStored({
        ...current,
        lastSelectedMode: mode,
      });
    },
    reset() {
      memoryProgress = createQuizProgress();
      clearQuizKeys();
      return memoryProgress;
    },
  };
};
