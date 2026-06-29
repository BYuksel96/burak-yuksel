import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import {
  QUIZ_CATEGORIES,
  QUIZ_DIFFICULTIES,
  QUIZ_MODES,
  QUIZ_QUESTIONS,
} from './quiz-data.js';
import {
  getQuizChoiceIdFromKey,
  shouldCaptureQuizShortcut,
} from './quiz-game.js';
import {
  ARCADE_SCORING,
  COACH_SESSION_LENGTH,
  answerArcadeQuestion,
  calculateArcadeAnswerScore,
  continueArcadeRun,
  createArcadeQuestionDeck,
  createArcadeRun,
  createCoachProgress,
  createCoachSession,
  createCoachSummary,
  createQuizRandom,
  getArcadeDifficultyWeights,
  getCoachCategoryInsights,
  randomizeQuestionChoices,
  recordCoachAnswer,
} from './quiz-state.js';
import {
  QUIZ_PROGRESS_KEY,
  QUIZ_SCHEMA_VERSION,
  createQuizProgressStore,
} from './quiz-storage.js';

const readSource = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const normalizeText = (value) =>
  String(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const createMemoryStorage = (initialEntries = []) => {
  const values = new Map(initialEntries);

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    get length() {
      return values.size;
    },
    snapshot() {
      return Object.fromEntries(values);
    },
  };
};

const answerCorrectly = (run, rng) => {
  const answered = answerArcadeQuestion(run, run.currentQuestion.correctChoiceId);
  return answered.status === 'game-over' ? answered : continueArcadeRun(answered, { rng });
};

test('question bank has valid, balanced, maintainable question data', () => {
  const modes = new Set(QUIZ_MODES);
  const categories = new Set(QUIZ_CATEGORIES.map((category) => category.id));
  const difficulties = new Set(QUIZ_DIFFICULTIES);
  const ids = new Set();
  const prompts = new Set();
  const categoryCounts = Object.fromEntries(QUIZ_CATEGORIES.map((category) => [category.id, 0]));
  const difficultyCounts = Object.fromEntries(QUIZ_DIFFICULTIES.map((difficulty) => [difficulty, 0]));

  assert.ok(QUIZ_QUESTIONS.length >= 30);
  assert.ok(QUIZ_QUESTIONS.length <= 40);

  QUIZ_QUESTIONS.forEach((question) => {
    assert.equal(typeof question.id, 'string');
    assert.ok(question.id.length > 4);
    assert.equal(ids.has(question.id), false, `duplicate id: ${question.id}`);
    ids.add(question.id);

    assert.ok(Array.isArray(question.modes));
    assert.ok(question.modes.length >= 1);
    question.modes.forEach((mode) => assert.ok(modes.has(mode), `invalid mode ${mode}`));

    assert.ok(categories.has(question.category), `invalid category ${question.category}`);
    categoryCounts[question.category] += 1;
    assert.ok(difficulties.has(question.difficulty), `invalid difficulty ${question.difficulty}`);
    difficultyCounts[question.difficulty] += 1;

    assert.equal(typeof question.prompt, 'string');
    assert.ok(question.prompt.trim().length > 20);
    const normalizedPrompt = normalizeText(question.prompt);
    assert.equal(prompts.has(normalizedPrompt), false, `duplicate prompt: ${question.prompt}`);
    prompts.add(normalizedPrompt);

    assert.equal(question.choices.length, 4, `${question.id} should have four choices`);
    const choiceIds = new Set(question.choices.map((choice) => choice.id));
    const choiceTexts = new Set(question.choices.map((choice) => normalizeText(choice.text)));
    assert.equal(choiceIds.size, 4, `${question.id} has duplicate choice ids`);
    assert.equal(choiceTexts.size, 4, `${question.id} has duplicate choice text`);
    assert.ok(choiceIds.has(question.correctChoiceId), `${question.id} correct choice missing`);
    assert.ok(question.explanation.trim().length > 20, `${question.id} explanation is too short`);
    assert.ok(question.whyItMatters.trim().length > 20, `${question.id} whyItMatters is too short`);

    if (question.reference) {
      assert.equal(typeof question.reference.title, 'string');
      assert.match(question.reference.url, /^https:\/\//);
      assert.ok(['primary', 'supporting'].includes(question.reference.type));
    }
  });

  Object.entries(categoryCounts).forEach(([category, count]) => {
    assert.ok(count >= 5, `${category} needs at least five questions`);
  });

  assert.ok(difficultyCounts.foundation >= 8);
  assert.ok(difficultyCounts.intermediate >= 12);
  assert.ok(difficultyCounts.advanced >= 6);
  assert.ok(QUIZ_QUESTIONS.filter((question) => question.modes.includes('arcade')).length >= 28);
  assert.ok(QUIZ_QUESTIONS.filter((question) => question.modes.includes('coach')).length >= 28);
});

test('arcade run starts with three lives and deterministic scoring rules', () => {
  const rng = createQuizRandom('arcade-start');
  let run = createArcadeRun({ questions: QUIZ_QUESTIONS, highScore: 250, rng });

  assert.equal(run.mode, 'arcade');
  assert.equal(run.status, 'question');
  assert.equal(run.lives, 3);
  assert.equal(run.level, 1);
  assert.equal(run.score, 0);
  assert.equal(run.currentStreak, 0);
  assert.equal(run.highScore, 250);
  assert.equal(run.currentQuestion.choices.length, 4);

  run = answerArcadeQuestion(run, run.currentQuestion.correctChoiceId);

  assert.equal(run.status, 'feedback');
  assert.equal(run.feedback.isCorrect, true);
  assert.equal(run.score, ARCADE_SCORING.correctBaseScore);
  assert.equal(run.currentStreak, 1);
  assert.equal(run.lives, 3);
  assert.equal(calculateArcadeAnswerScore({ level: 10, streak: 9 }), 320);
});

test('quiz questions randomize answer positions while preserving the correct answer mapping', () => {
  const question = QUIZ_QUESTIONS.find((item) => item.id === 'stakeholders-risk-003');
  const correctText = question.choices.find((choice) => choice.id === question.correctChoiceId).text;
  const randomized = randomizeQuestionChoices(question, () => 0);

  assert.equal(question.correctChoiceId, 'b');
  assert.equal(randomized.id, question.id);
  assert.deepEqual(randomized.choices.map((choice) => choice.id), ['a', 'b', 'c', 'd']);
  assert.equal(randomized.correctChoiceId, 'a');
  assert.equal(randomized.choices.find((choice) => choice.id === randomized.correctChoiceId).text, correctText);
  assert.deepEqual(
    new Set(randomized.choices.map((choice) => choice.text)),
    new Set(question.choices.map((choice) => choice.text)),
  );

  const rerandomized = randomizeQuestionChoices(randomized, () => 0.99);
  assert.equal(rerandomized.choices.find((choice) => choice.id === rerandomized.correctChoiceId).text, correctText);
});

test('arcade and coach use randomized display labels without changing correctness', () => {
  const baseQuestion = QUIZ_QUESTIONS.find((item) => item.id === 'stakeholders-risk-003');
  const arcadeQuestion = {
    ...baseQuestion,
    modes: ['arcade'],
  };
  let run = createArcadeRun({ questions: [arcadeQuestion], rng: () => 0 });

  assert.equal(run.currentQuestion.correctChoiceId, 'a');
  run = answerArcadeQuestion(run, 'a');
  assert.equal(run.feedback.isCorrect, true);

  const coachQuestions = QUIZ_CATEGORIES.map((category) => ({
    ...baseQuestion,
    id: `${baseQuestion.id}-${category.id}`,
    category: category.id,
    difficulty: 'foundation',
    modes: ['coach'],
  }));
  const session = createCoachSession({
    questions: coachQuestions,
    progress: createCoachProgress(),
    rng: () => 0,
  });

  assert.ok(session.questions.length >= QUIZ_CATEGORIES.length);
  assert.ok(session.questions.every((question) => question.correctChoiceId === 'a'));
});

test('arcade incorrect answers cost a life, reset streak, and end the run at zero lives', () => {
  const rng = createQuizRandom('arcade-wrong');
  let run = createArcadeRun({ questions: QUIZ_QUESTIONS, rng });
  run = answerArcadeQuestion(run, run.currentQuestion.correctChoiceId);
  run = continueArcadeRun(run, { rng });
  assert.equal(run.currentStreak, 1);
  const scoreBeforeWrong = run.score;

  for (let index = 0; index < 3; index += 1) {
    const wrongChoice = run.currentQuestion.choices.find((choice) => choice.id !== run.currentQuestion.correctChoiceId);
    run = answerArcadeQuestion(run, wrongChoice.id);
    assert.equal(run.currentStreak, 0);
    assert.equal(run.score, scoreBeforeWrong);

    if (index < 2) {
      assert.equal(run.status, 'feedback');
      run = continueArcadeRun(run, { rng });
    }
  }

  assert.equal(run.status, 'game-over');
  assert.equal(run.lives, 0);
  assert.equal(run.gameOverReason, 'lives');
});

test('arcade levels increase after every five correct answers without dropping after mistakes', () => {
  const rng = createQuizRandom('arcade-levels');
  let run = createArcadeRun({ questions: QUIZ_QUESTIONS, rng });

  for (let index = 0; index < 5; index += 1) {
    run = answerCorrectly(run, rng);
  }

  assert.equal(run.level, 2);
  assert.equal(run.highestLevel, 2);

  const wrongChoice = run.currentQuestion.choices.find((choice) => choice.id !== run.currentQuestion.correctChoiceId);
  run = answerArcadeQuestion(run, wrongChoice.id);
  assert.equal(run.level, 2);
  assert.equal(run.currentStreak, 0);
});

test('arcade difficulty weighting gets stronger without removing easier questions abruptly', () => {
  assert.deepEqual(getArcadeDifficultyWeights(1), { foundation: 6, intermediate: 2, advanced: 1 });
  assert.deepEqual(getArcadeDifficultyWeights(3), { foundation: 2, intermediate: 6, advanced: 2 });
  assert.deepEqual(getArcadeDifficultyWeights(5), { foundation: 1, intermediate: 4, advanced: 5 });

  const levelOneDeck = createArcadeQuestionDeck({ questions: QUIZ_QUESTIONS, level: 1, rng: createQuizRandom('level-one') });
  const levelFiveDeck = createArcadeQuestionDeck({ questions: QUIZ_QUESTIONS, level: 5, rng: createQuizRandom('level-five') });
  const firstEightLevelOne = levelOneDeck.slice(0, 8).map((question) => question.difficulty);
  const firstEightLevelFive = levelFiveDeck.slice(0, 8).map((question) => question.difficulty);

  assert.ok(firstEightLevelOne.filter((difficulty) => difficulty === 'foundation').length >= 3);
  assert.ok(firstEightLevelFive.filter((difficulty) => difficulty === 'advanced').length >= 3);
  assert.ok(levelFiveDeck.some((question) => question.difficulty === 'foundation'));
});

test('arcade deck avoids repeats until exhausted and avoids immediate repeat after reshuffle', () => {
  const rng = createQuizRandom('arcade-deck');
  let run = createArcadeRun({ questions: QUIZ_QUESTIONS, rng });
  const eligibleCount = QUIZ_QUESTIONS.filter((question) => question.modes.includes('arcade')).length;
  const seen = [];

  for (let index = 0; index < eligibleCount; index += 1) {
    seen.push(run.currentQuestion.id);
    run = answerCorrectly(run, rng);
  }

  assert.equal(new Set(seen).size, eligibleCount);
  assert.notEqual(run.currentQuestion.id, seen.at(-1));
});

test('coach session contains exactly twelve balanced non-repeating questions', () => {
  const progress = createCoachProgress();
  const session = createCoachSession({ questions: QUIZ_QUESTIONS, progress, rng: createQuizRandom('coach-session') });
  const categoryCounts = session.questions.reduce((counts, question) => {
    counts[question.category] = (counts[question.category] || 0) + 1;
    return counts;
  }, {});
  const difficultyCounts = session.questions.reduce((counts, question) => {
    counts[question.difficulty] = (counts[question.difficulty] || 0) + 1;
    return counts;
  }, {});

  assert.equal(session.mode, 'coach');
  assert.equal(session.questions.length, COACH_SESSION_LENGTH);
  assert.equal(new Set(session.questions.map((question) => question.id)).size, COACH_SESSION_LENGTH);
  QUIZ_CATEGORIES.forEach((category) => {
    assert.ok(categoryCounts[category.id] >= 1, `${category.id} should appear`);
    assert.ok(categoryCounts[category.id] <= 3, `${category.id} should not dominate`);
  });
  assert.ok(difficultyCounts.foundation >= 3);
  assert.ok(difficultyCounts.intermediate >= 4);
  assert.ok(difficultyCounts.advanced >= 2);
});

test('coach progress updates category and question stats without ending on incorrect answers', () => {
  let progress = createCoachProgress();
  const session = createCoachSession({ questions: QUIZ_QUESTIONS, progress, rng: createQuizRandom('coach-progress') });
  const first = session.questions[0];
  const second = session.questions.find((question) => question.category !== first.category);

  progress = recordCoachAnswer(progress, first, true);
  progress = recordCoachAnswer(progress, second, false);

  assert.equal(progress.totalCoachAttempts, 2);
  assert.equal(progress.categories[first.category].attempts, 1);
  assert.equal(progress.categories[first.category].correct, 1);
  assert.equal(progress.categories[second.category].attempts, 1);
  assert.equal(progress.questions[first.id].seen, 1);
  assert.equal(progress.questions[first.id].correct, 1);
  assert.equal(progress.questions[second.id].seen, 1);
  assert.equal(progress.questions[second.id].correct, 0);
});

test('coach insight language waits for enough attempts before labelling weak areas', () => {
  let progress = createCoachProgress();
  const agileQuestion = QUIZ_QUESTIONS.find((question) => question.category === 'agile-principles' && question.modes.includes('coach'));
  const scrumQuestion = QUIZ_QUESTIONS.find((question) => question.category === 'scrum' && question.modes.includes('coach'));

  progress = recordCoachAnswer(progress, agileQuestion, false);
  progress = recordCoachAnswer(progress, scrumQuestion, true);
  progress = recordCoachAnswer(progress, scrumQuestion, true);
  progress = recordCoachAnswer(progress, scrumQuestion, true);

  let insights = getCoachCategoryInsights(progress);
  assert.equal(insights.find((item) => item.categoryId === 'agile-principles').status, 'needs-more-attempts');
  assert.equal(insights.find((item) => item.categoryId === 'scrum').status, 'strong');

  progress = recordCoachAnswer(progress, agileQuestion, false);
  progress = recordCoachAnswer(progress, agileQuestion, true);
  insights = getCoachCategoryInsights(progress);

  assert.equal(insights.find((item) => item.categoryId === 'agile-principles').status, 'weak');
});

test('coach session summary reports score, category performance, and revisits without certification language', () => {
  const progress = createCoachProgress();
  const session = createCoachSession({ questions: QUIZ_QUESTIONS, progress, rng: createQuizRandom('coach-summary') });
  const answers = session.questions.map((question, index) => ({
    question,
    selectedChoiceId: index < 8 ? question.correctChoiceId : question.choices.find((choice) => choice.id !== question.correctChoiceId).id,
  }));
  const summary = createCoachSummary({ session, answers, progress });

  assert.equal(summary.correctCount, 8);
  assert.equal(summary.totalQuestions, 12);
  assert.equal(summary.percentage, 67);
  assert.ok(summary.categoryPerformance.length >= QUIZ_CATEGORIES.length);
  assert.ok(summary.strongestCategory);
  assert.ok(Array.isArray(summary.revisitCategories));
  assert.doesNotMatch(summary.summaryLabel, /certification|certified/i);
});

test('coach selection gives weak areas attention without letting them dominate', () => {
  let progress = createCoachProgress();
  const weakQuestion = QUIZ_QUESTIONS.find((question) => question.category === 'stakeholders-risk' && question.modes.includes('coach'));
  const strongQuestion = QUIZ_QUESTIONS.find((question) => question.category === 'scrum' && question.modes.includes('coach'));

  for (let index = 0; index < 5; index += 1) {
    progress = recordCoachAnswer(progress, weakQuestion, index === 4);
    progress = recordCoachAnswer(progress, strongQuestion, true);
  }

  const session = createCoachSession({ questions: QUIZ_QUESTIONS, progress, rng: createQuizRandom('coach-weak') });
  const weakCount = session.questions.filter((question) => question.category === 'stakeholders-risk').length;

  assert.ok(weakCount >= 2);
  assert.ok(weakCount <= 4);
  assert.ok(new Set(session.questions.map((question) => question.category)).size >= 5);
});

test('quiz progress storage is versioned, safe, and resets only Quiz.exe data', () => {
  const storage = createMemoryStorage([
    ['burakOs.mazeHighScore.v1', '999'],
    ['burakOs.mazeMusicEnabled.v1', 'true'],
  ]);
  const store = createQuizProgressStore({ storage });

  assert.equal(QUIZ_SCHEMA_VERSION, 1);
  let progress = store.get();
  assert.equal(progress.schemaVersion, QUIZ_SCHEMA_VERSION);
  assert.equal(progress.arcadeHighScore, 0);

  progress = store.updateArcadeHighScore(1200);
  assert.equal(progress.arcadeHighScore, 1200);
  assert.equal(JSON.parse(storage.getItem(QUIZ_PROGRESS_KEY)).arcadeHighScore, 1200);
  assert.equal(store.updateArcadeHighScore(900).arcadeHighScore, 1200);

  store.reset();
  const resetProgress = store.get();
  assert.equal(resetProgress.arcadeHighScore, 0);
  assert.equal(storage.getItem('burakOs.mazeHighScore.v1'), '999');
  assert.equal(storage.getItem('burakOs.mazeMusicEnabled.v1'), 'true');
});

test('quiz storage falls back to in-memory state when localStorage throws', () => {
  const storage = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
    removeItem() {
      throw new Error('blocked');
    },
    get length() {
      throw new Error('blocked');
    },
  };
  const store = createQuizProgressStore({ storage });

  assert.equal(store.get().arcadeHighScore, 0);
  assert.equal(store.updateArcadeHighScore(450).arcadeHighScore, 450);
  assert.equal(store.get().arcadeHighScore, 450);
  store.reset();
  assert.equal(store.get().arcadeHighScore, 0);
});

test('quiz keyboard shortcuts map answers only while an active question can accept input', () => {
  assert.equal(getQuizChoiceIdFromKey('1'), 'a');
  assert.equal(getQuizChoiceIdFromKey('4'), 'd');
  assert.equal(getQuizChoiceIdFromKey('A'), 'a');
  assert.equal(getQuizChoiceIdFromKey('d'), 'd');
  assert.equal(getQuizChoiceIdFromKey('ArrowLeft'), null);

  assert.equal(shouldCaptureQuizShortcut({ key: '1', screen: 'play', feedbackVisible: false, windowActive: true }), true);
  assert.equal(shouldCaptureQuizShortcut({ key: 'B', screen: 'play', feedbackVisible: false, windowActive: true }), true);
  assert.equal(shouldCaptureQuizShortcut({ key: '1', screen: 'start', feedbackVisible: false, windowActive: true }), false);
  assert.equal(shouldCaptureQuizShortcut({ key: '1', screen: 'play', feedbackVisible: true, windowActive: true }), false);
  assert.equal(shouldCaptureQuizShortcut({ key: '1', screen: 'play', feedbackVisible: false, windowActive: false }), false);
  assert.equal(shouldCaptureQuizShortcut({ key: '1', screen: 'play', feedbackVisible: false, windowActive: true, osBlocked: true }), false);
});

test('Quiz.exe markup, styling, and OS integration are wired as a Bin-only game', () => {
  const shell = readSource('../components/os/OsShell.astro');
  const bin = readSource('../components/os/BinFolder.astro');
  const manager = readSource('./os-window-manager.js');
  const quizSource = readSource('../components/os/QuizGame.astro');
  const quizCss = readSource('../styles/quiz-game.css');
  const taskbarBlock = shell.match(/const taskbarItems = \[[\s\S]*?\] as const;/)?.[0] ?? '';
  const desktopBlock = shell.match(/const desktopItems = \[[\s\S]*?\] as const;/)?.[0] ?? '';

  assert.equal(existsSync(new URL('../components/os/QuizGame.astro', import.meta.url)), true);
  assert.match(shell, /import QuizGame from '\.\/QuizGame\.astro';/);
  assert.match(shell, /window\.id === 'quiz'[\s\S]*<QuizGame \/>/);
  assert.match(shell, /Arcade Terminal uses lives, score, levels and streaks/);
  assert.match(shell, /Coach Console uses 12-question learning sessions/);
  assert.match(bin, /Maze\.exe/);
  assert.match(bin, /Quiz\.exe/);
  assert.match(bin, /data-os-target="quiz"/);
  assert.doesNotMatch(taskbarBlock, /quiz/i);
  assert.doesNotMatch(desktopBlock, /quiz/i);
  assert.match(manager, /GAME_APPS\s*=\s*\['maze',\s*'quiz'\]/);
  assert.match(quizSource, /data-quiz-game/);
  assert.match(quizSource, /Arcade Terminal/);
  assert.match(quizSource, /Coach Console/);
  assert.match(quizSource, /data-quiz-reset-progress/);
  assert.match(quizSource, /data-os-game-exit/);
  assert.match(quizSource, /aria-live="polite"/);
  assert.match(quizCss, /\.quiz-game\b/);
  assert.match(quizCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(quizCss, /@media\s*\(max-width:\s*760px\)/);
});

test('Quiz.exe mobile answer and feedback layout prevents overlap after answering', () => {
  const quizSource = readSource('../components/os/QuizGame.astro');
  const quizCss = readSource('../styles/quiz-game.css');
  const quizScript = readSource('./quiz-game.js');
  const answersIndex = quizSource.indexOf('data-quiz-answers');
  const feedbackIndex = quizSource.indexOf('data-quiz-feedback');

  assert.ok(answersIndex > -1);
  assert.ok(feedbackIndex > -1);
  assert.ok(answersIndex < feedbackIndex, 'feedback should be rendered after answer D');
  assert.doesNotMatch(quizCss, /grid-template-rows:\s*auto\s+minmax\(0,\s*auto\)\s+auto/);
  assert.match(quizCss, /\.quiz-game__question-shell\s*\{[\s\S]*grid-template-rows:\s*auto\s+auto\s+auto/);
  assert.match(quizCss, /\.quiz-game__answer\s*\{[\s\S]*align-items:\s*start/);
  assert.match(quizCss, /\.quiz-game__answer strong\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(quizScript, /scrollIntoView\(\{[\s\S]*block:\s*'start'/);
});

test('Quiz.exe mobile start screen keeps the recovered-program heading visible', () => {
  const quizCss = readSource('../styles/quiz-game.css');
  const mobileStartBlock =
    quizCss.match(/@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?\.quiz-game__screen--start\s*\{(?<block>[\s\S]*?)\n\s*\}/)?.groups
      ?.block ?? '';

  assert.match(mobileStartBlock, /align-content:\s*start/);
  assert.match(mobileStartBlock, /scroll-padding-block-start/);
});

test('Quiz.exe mobile summary screens keep arcade and coach results visible', () => {
  const quizCss = readSource('../styles/quiz-game.css');
  const mobileSummaryBlock =
    quizCss.match(/@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?\.quiz-game__screen--summary\s*\{(?<block>[\s\S]*?)\n\s*\}/)?.groups
      ?.block ?? '';

  assert.match(mobileSummaryBlock, /align-content:\s*start/);
  assert.match(mobileSummaryBlock, /justify-items:\s*center/);
  assert.match(mobileSummaryBlock, /scroll-padding-block-start/);
});

test('Quiz.exe browser lifecycle is idempotent and watches OS window visibility', () => {
  const quizScript = readSource('./quiz-game.js');

  assert.match(quizScript, /dataset\.quizGameReady/);
  assert.match(quizScript, /MutationObserver/);
  assert.match(quizScript, /attributeFilter:\s*\['hidden',\s*'data-window-state'\]/);
  assert.match(quizScript, /pagehide/);
  assert.match(quizScript, /getQuizChoiceIdFromKey/);
  assert.match(quizScript, /shouldCaptureQuizShortcut/);
});
