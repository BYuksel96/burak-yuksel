import {
  QUIZ_CATEGORIES,
  QUIZ_DIFFICULTIES,
  QUIZ_QUESTIONS,
  getCategoryLabel,
} from './quiz-data.js';

const hashSeed = (seed) => {
  const text = String(seed || 'burak-os-quiz');
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const createQuizRandom = (seed = Date.now()) => {
  let state = hashSeed(seed);

  return () => {
    state = Math.imul(state + 0x6d2b79f5, 1);
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = (items, rng) => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

const displayChoiceIds = ['a', 'b', 'c', 'd'];

export const randomizeQuestionChoices = (question, rng = Math.random) => {
  const sourceCorrectChoiceId = question.sourceCorrectChoiceId ?? question.correctChoiceId;
  const randomizedChoices = shuffle(question.choices, rng).map((choice, index) => ({
    ...choice,
    id: displayChoiceIds[index],
    sourceChoiceId: choice.sourceChoiceId ?? choice.id,
  }));
  const correctChoice = randomizedChoices.find((choice) => choice.sourceChoiceId === sourceCorrectChoiceId);

  return {
    ...question,
    choices: randomizedChoices,
    sourceCorrectChoiceId,
    correctChoiceId: correctChoice?.id ?? question.correctChoiceId,
  };
};

export const ARCADE_SCORING = {
  startingLives: 3,
  correctBaseScore: 100,
  correctAnswersPerLevel: 5,
  levelMultiplierStep: 0.15,
  maxLevelMultiplier: 1.6,
  streakMultipliers: [
    { min: 0, max: 2, value: 1 },
    { min: 3, max: 5, value: 1.5 },
    { min: 6, max: Infinity, value: 2 },
  ],
};

export const COACH_SESSION_LENGTH = 12;

const categoryIds = QUIZ_CATEGORIES.map((category) => category.id);

export const createCoachProgress = () => ({
  totalCoachAttempts: 0,
  categories: Object.fromEntries(categoryIds.map((categoryId) => [categoryId, { attempts: 0, correct: 0 }])),
  questions: {},
});

export const getStreakMultiplier = (streak) =>
  ARCADE_SCORING.streakMultipliers.find((range) => streak >= range.min && streak <= range.max)?.value ?? 1;

export const getLevelMultiplier = (level) =>
  Math.min(ARCADE_SCORING.maxLevelMultiplier, 1 + Math.max(0, level - 1) * ARCADE_SCORING.levelMultiplierStep);

export const calculateArcadeAnswerScore = ({ level, streak }) =>
  Math.round(ARCADE_SCORING.correctBaseScore * getLevelMultiplier(level) * getStreakMultiplier(streak));

export const getArcadeDifficultyWeights = (level) => {
  if (level <= 1) return { foundation: 6, intermediate: 2, advanced: 1 };
  if (level === 2) return { foundation: 4, intermediate: 4, advanced: 1 };
  if (level === 3) return { foundation: 2, intermediate: 6, advanced: 2 };
  if (level === 4) return { foundation: 1, intermediate: 5, advanced: 4 };
  return { foundation: 1, intermediate: 4, advanced: 5 };
};

export const createArcadeQuestionDeck = ({ questions = QUIZ_QUESTIONS, level = 1, rng = Math.random } = {}) => {
  const weights = getArcadeDifficultyWeights(level);
  const eligible = questions.filter((question) => question.modes.includes('arcade'));
  const grouped = QUIZ_DIFFICULTIES.reduce((result, difficulty) => {
    result[difficulty] = shuffle(
      eligible.filter((question) => question.difficulty === difficulty),
      rng,
    );
    return result;
  }, {});

  return Object.entries(weights)
    .sort((left, right) => right[1] - left[1])
    .flatMap(([difficulty]) => grouped[difficulty]);
};

const drawArcadeQuestion = ({ questions, level, usedQuestionIds, lastQuestionId, rng }) => {
  const eligible = questions.filter((question) => question.modes.includes('arcade'));
  const unused = eligible.filter((question) => !usedQuestionIds.includes(question.id));
  const reshuffled = unused.length === 0;
  const candidates = reshuffled ? eligible : unused;
  const deck = createArcadeQuestionDeck({ questions: candidates, level, rng });

  if (deck.length > 1 && deck[0].id === lastQuestionId) {
    const swapIndex = deck.findIndex((question) => question.id !== lastQuestionId);
    [deck[0], deck[swapIndex]] = [deck[swapIndex], deck[0]];
  }

  const question = randomizeQuestionChoices(deck[0], rng);

  return {
    question,
    usedQuestionIds: reshuffled ? [question.id] : [...usedQuestionIds, question.id],
  };
};

export const createArcadeRun = ({ questions = QUIZ_QUESTIONS, highScore = 0, rng = Math.random } = {}) => {
  const draw = drawArcadeQuestion({
    questions,
    level: 1,
    usedQuestionIds: [],
    lastQuestionId: null,
    rng,
  });

  return {
    mode: 'arcade',
    status: 'question',
    questions,
    lives: ARCADE_SCORING.startingLives,
    score: 0,
    level: 1,
    correctCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    highestLevel: 1,
    highScore: Math.max(0, Math.floor(Number(highScore) || 0)),
    currentQuestion: draw.question,
    usedQuestionIds: draw.usedQuestionIds,
    lastQuestionId: null,
    feedback: null,
    gameOverReason: null,
    newHighScore: false,
  };
};

export const answerArcadeQuestion = (run, selectedChoiceId) => {
  if (run.status !== 'question' || !run.currentQuestion) return run;

  const isCorrect = selectedChoiceId === run.currentQuestion.correctChoiceId;

  if (!isCorrect) {
    const lives = Math.max(0, run.lives - 1);
    return {
      ...run,
      status: lives === 0 ? 'game-over' : 'feedback',
      lives,
      currentStreak: 0,
      feedback: {
        isCorrect,
        selectedChoiceId,
        correctChoiceId: run.currentQuestion.correctChoiceId,
        scoreAwarded: 0,
        explanation: run.currentQuestion.explanation,
      },
      gameOverReason: lives === 0 ? 'lives' : null,
    };
  }

  const currentStreak = run.currentStreak + 1;
  const correctCount = run.correctCount + 1;
  const level = Math.floor(correctCount / ARCADE_SCORING.correctAnswersPerLevel) + 1;
  const scoreAwarded = calculateArcadeAnswerScore({ level: run.level, streak: currentStreak });
  const score = run.score + scoreAwarded;

  return {
    ...run,
    status: 'feedback',
    score,
    level,
    correctCount,
    currentStreak,
    longestStreak: Math.max(run.longestStreak, currentStreak),
    highestLevel: Math.max(run.highestLevel, level),
    feedback: {
      isCorrect,
      selectedChoiceId,
      correctChoiceId: run.currentQuestion.correctChoiceId,
      scoreAwarded,
      explanation: run.currentQuestion.explanation,
    },
  };
};

export const continueArcadeRun = (run, { rng = Math.random } = {}) => {
  if (run.status !== 'feedback') return run;

  const draw = drawArcadeQuestion({
    questions: run.questions,
    level: run.level,
    usedQuestionIds: run.usedQuestionIds,
    lastQuestionId: run.currentQuestion.id,
    rng,
  });

  return {
    ...run,
    status: 'question',
    currentQuestion: draw.question,
    usedQuestionIds: draw.usedQuestionIds,
    lastQuestionId: run.currentQuestion.id,
    feedback: null,
  };
};

const categoryAccuracy = (progress, categoryId) => {
  const category = progress.categories?.[categoryId] ?? { attempts: 0, correct: 0 };
  return category.attempts > 0 ? category.correct / category.attempts : 0;
};

export const getCoachCategoryInsights = (progress = createCoachProgress()) =>
  QUIZ_CATEGORIES.map((category) => {
    const stats = progress.categories?.[category.id] ?? { attempts: 0, correct: 0 };
    const accuracy = stats.attempts > 0 ? stats.correct / stats.attempts : null;
    let status = 'needs-more-attempts';
    let label = stats.attempts === 0 ? 'Still gathering data' : 'Needs more attempts';

    if (stats.attempts >= 3) {
      if (accuracy >= 0.75) {
        status = 'strong';
        label = 'Strong signal';
      } else if (accuracy < 0.6) {
        status = 'weak';
        label = 'Revisit this area';
      } else {
        status = 'developing';
        label = 'Early indication';
      }
    }

    return {
      categoryId: category.id,
      label: category.label,
      attempts: stats.attempts,
      correct: stats.correct,
      accuracy,
      status,
      statusLabel: label,
    };
  });

const getCoachQuotas = (progress) => {
  const quotas = Object.fromEntries(categoryIds.map((categoryId) => [categoryId, 2]));
  const insights = getCoachCategoryInsights(progress);
  const weakCategories = insights.filter((item) => item.status === 'weak').map((item) => item.categoryId).slice(0, 2);
  const donors = insights
    .filter((item) => !weakCategories.includes(item.categoryId))
    .sort((left, right) => categoryAccuracy(progress, right.categoryId) - categoryAccuracy(progress, left.categoryId))
    .map((item) => item.categoryId);

  weakCategories.forEach((categoryId, index) => {
    const donor = donors[index];
    if (donor && quotas[donor] > 1) {
      quotas[categoryId] += 1;
      quotas[donor] -= 1;
    }
  });

  return quotas;
};

const difficultyPatternForCategory = (categoryIndex, quota) => {
  const basePatterns = [
    ['foundation', 'intermediate'],
    ['foundation', 'intermediate'],
    ['intermediate', 'advanced'],
    ['intermediate', 'advanced'],
    ['foundation', 'intermediate'],
    ['foundation', 'intermediate'],
  ];
  const pattern = [...basePatterns[categoryIndex % basePatterns.length]];

  while (pattern.length < quota) {
    pattern.push(pattern.length % 2 === 0 ? 'intermediate' : 'advanced');
  }

  return pattern.slice(0, quota);
};

const pickQuestionsForCategory = ({ questions, categoryId, quota, categoryIndex, progress, rng, usedIds }) => {
  const categoryQuestions = questions.filter((question) => question.category === categoryId && question.modes.includes('coach'));
  const selected = [];

  difficultyPatternForCategory(categoryIndex, quota).forEach((difficulty) => {
    const pool = categoryQuestions
      .filter((question) => question.difficulty === difficulty && !usedIds.has(question.id))
      .sort((left, right) => {
        const leftSeen = progress.questions?.[left.id]?.seen ?? 0;
        const rightSeen = progress.questions?.[right.id]?.seen ?? 0;
        return leftSeen - rightSeen || rng() - 0.5;
      });
    const fallbackPool = categoryQuestions
      .filter((question) => !usedIds.has(question.id))
      .sort((left, right) => {
        const leftSeen = progress.questions?.[left.id]?.seen ?? 0;
        const rightSeen = progress.questions?.[right.id]?.seen ?? 0;
        return leftSeen - rightSeen || rng() - 0.5;
      });
    const question = pool[0] ?? fallbackPool[0];

    if (question) {
      usedIds.add(question.id);
      selected.push(question);
    }
  });

  return selected;
};

export const createCoachSession = ({ questions = QUIZ_QUESTIONS, progress = createCoachProgress(), rng = Math.random } = {}) => {
  const quotas = getCoachQuotas(progress);
  const usedIds = new Set();
  const selected = categoryIds.flatMap((categoryId, categoryIndex) =>
    pickQuestionsForCategory({
      questions,
      categoryId,
      quota: quotas[categoryId],
      categoryIndex,
      progress,
      rng,
      usedIds,
    }),
  );

  return {
    mode: 'coach',
    status: 'question',
    currentIndex: 0,
    questions: shuffle(selected, rng).slice(0, COACH_SESSION_LENGTH).map((question) => randomizeQuestionChoices(question, rng)),
    answers: [],
  };
};

export const recordCoachAnswer = (progress = createCoachProgress(), question, isCorrect) => {
  const categories = {
    ...createCoachProgress().categories,
    ...(progress.categories ?? {}),
  };
  const currentCategory = categories[question.category] ?? { attempts: 0, correct: 0 };
  const currentQuestion = progress.questions?.[question.id] ?? { seen: 0, correct: 0 };

  return {
    ...progress,
    totalCoachAttempts: (progress.totalCoachAttempts ?? 0) + 1,
    categories: {
      ...categories,
      [question.category]: {
        attempts: currentCategory.attempts + 1,
        correct: currentCategory.correct + (isCorrect ? 1 : 0),
      },
    },
    questions: {
      ...(progress.questions ?? {}),
      [question.id]: {
        seen: currentQuestion.seen + 1,
        correct: currentQuestion.correct + (isCorrect ? 1 : 0),
      },
    },
  };
};

export const createCoachSummary = ({ session, answers, progress = createCoachProgress() }) => {
  const correctCount = answers.filter((answer) => answer.selectedChoiceId === answer.question.correctChoiceId).length;
  const categoryMap = new Map(
    QUIZ_CATEGORIES.map((category) => [
      category.id,
      {
        categoryId: category.id,
        label: category.label,
        attempts: 0,
        correct: 0,
      },
    ]),
  );

  answers.forEach((answer) => {
    const stats = categoryMap.get(answer.question.category);
    stats.attempts += 1;
    stats.correct += answer.selectedChoiceId === answer.question.correctChoiceId ? 1 : 0;
  });

  const categoryPerformance = Array.from(categoryMap.values()).map((stats) => ({
    ...stats,
    percentage: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null,
  }));
  const attempted = categoryPerformance.filter((item) => item.attempts > 0);
  const strongest = attempted
    .slice()
    .sort((left, right) => (right.percentage ?? -1) - (left.percentage ?? -1) || right.correct - left.correct)[0];
  const insights = getCoachCategoryInsights(progress);
  const persistentWeak = insights.filter((item) => item.status === 'weak').map((item) => item.categoryId);
  const revisitCategories = categoryPerformance
    .filter((item) => item.attempts > 0 && (item.correct < item.attempts || persistentWeak.includes(item.categoryId)))
    .map((item) => ({
      ...item,
      label: getCategoryLabel(item.categoryId),
      statusLabel: persistentWeak.includes(item.categoryId) ? 'Revisit this area' : 'Early indication',
    }));

  return {
    correctCount,
    totalQuestions: session.questions.length,
    percentage: Math.round((correctCount / session.questions.length) * 100),
    categoryPerformance,
    strongestCategory: strongest
      ? {
          ...strongest,
          label: getCategoryLabel(strongest.categoryId),
        }
      : null,
    revisitCategories,
    summaryLabel: 'Learning session summary',
  };
};
