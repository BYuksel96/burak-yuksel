import { QUIZ_QUESTIONS, getCategoryLabel } from './quiz-data.js';
import {
  answerArcadeQuestion,
  continueArcadeRun,
  createArcadeRun,
  createCoachSession,
  createCoachSummary,
  createQuizRandom,
  getCoachCategoryInsights,
} from './quiz-state.js';
import { createQuizProgressStore } from './quiz-storage.js';

const choiceLabels = ['a', 'b', 'c', 'd'];

const getWindowElement = (root) => root.closest('[data-os-window]');

const isWindowActive = (root) => {
  const windowElement = getWindowElement(root);
  return Boolean(windowElement && !windowElement.hidden && windowElement.getAttribute('data-window-state') === 'open' && !document.hidden);
};

const setHidden = (element, hidden) => {
  if (!element) return;
  element.hidden = hidden;
  element.setAttribute('aria-hidden', String(hidden));
};

const setText = (root, selector, value) => {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
};

const formatDifficulty = (difficulty) => difficulty.replace(/^\w/, (letter) => letter.toUpperCase());

export const getQuizChoiceIdFromKey = (key) => {
  const normalized = key.toLowerCase();
  if (/^[1-4]$/.test(normalized)) return choiceLabels[Number(normalized) - 1];
  if (choiceLabels.includes(normalized)) return normalized;
  return null;
};

export const shouldCaptureQuizShortcut = ({ key, screen, feedbackVisible, windowActive }) =>
  Boolean(getQuizChoiceIdFromKey(key) && screen === 'play' && !feedbackVisible && windowActive);

const getCurrentQuestion = (state) => {
  if (state.mode === 'arcade') return state.arcadeRun?.currentQuestion ?? null;
  if (state.mode === 'coach') return state.coachSession?.questions[state.coachSession.currentIndex] ?? null;
  return null;
};

export const initQuizGame = (root) => {
  if (!root || root.dataset.quizGameReady === 'true') return;
  root.dataset.quizGameReady = 'true';

  const store = createQuizProgressStore({ storage: window.localStorage });
  const state = {
    mode: null,
    screen: 'start',
    arcadeRun: null,
    coachSession: null,
    coachAnswers: [],
    pendingArcadeSummary: false,
  };

  const screens = Array.from(root.querySelectorAll('[data-quiz-screen]'));
  const answerButtons = Array.from(root.querySelectorAll('[data-quiz-answer]'));
  const feedbackPanel = root.querySelector('[data-quiz-feedback]');
  const referenceLink = root.querySelector('[data-quiz-reference]');
  const resetConfirm = root.querySelector('[data-quiz-reset-confirm]');

  const prefersReducedMotion = () =>
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollFeedbackIntoView = () => {
    if (!(feedbackPanel instanceof HTMLElement) || feedbackPanel.hidden) return;

    feedbackPanel.scrollIntoView({
      block: 'start',
      inline: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const focusFirst = (selector, { preventScroll = true } = {}) => {
    const target = root.querySelector(selector);
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll });
    }
  };

  const announce = (message) => {
    setText(root, '[data-quiz-live]', message);
  };

  const showScreen = (name) => {
    state.screen = name;
    screens.forEach((screen) => setHidden(screen, screen.getAttribute('data-quiz-screen') !== name));
  };

  const getProgress = () => store.get();

  const renderProgressSummary = () => {
    const progress = getProgress();
    const insights = getCoachCategoryInsights(progress);
    const persistentWeak = insights.filter((item) => item.status === 'weak').map((item) => item.label);
    const summary = root.querySelector('[data-quiz-progress-summary]');
    if (!summary) return;

    const learningLabel = progress.totalCoachAttempts < 3 ? 'Still gathering data' : `${progress.totalCoachAttempts} coach attempts`;
    const revisitLabel = persistentWeak.length ? persistentWeak.slice(0, 2).join(', ') : progress.totalCoachAttempts < 3 ? 'Needs more attempts' : 'No persistent weak area';

    summary.innerHTML = `
      <div>Arcade high score<strong>${progress.arcadeHighScore}</strong></div>
      <div>Coach progress<strong>${learningLabel}</strong></div>
      <div>Revisit signal<strong>${revisitLabel}</strong></div>
    `;
  };

  const resetActiveSession = () => {
    state.mode = null;
    state.arcadeRun = null;
    state.coachSession = null;
    state.coachAnswers = [];
    state.pendingArcadeSummary = false;
    answerButtons.forEach((button) => {
      button.disabled = false;
      button.removeAttribute('data-answer-selected');
      button.removeAttribute('data-answer-correct');
      button.removeAttribute('data-answer-incorrect');
    });
    setHidden(feedbackPanel, true);
  };

  const renderStart = ({ focus = false } = {}) => {
    resetActiveSession();
    renderProgressSummary();
    setHidden(resetConfirm, true);
    showScreen('start');
    if (focus) focusFirst('[data-quiz-start-mode]');
  };

  const renderHud = () => {
    const isArcade = state.mode === 'arcade';
    const progress = getProgress();

    setText(root, '[data-quiz-mode-label]', isArcade ? 'Arcade' : 'Coach');
    root.querySelectorAll('[data-quiz-arcade-stat]').forEach((element) => setHidden(element, !isArcade));
    root.querySelectorAll('[data-quiz-coach-stat]').forEach((element) => setHidden(element, isArcade));

    if (isArcade && state.arcadeRun) {
      setText(root, '[data-quiz-lives]', String(state.arcadeRun.lives));
      setText(root, '[data-quiz-level]', String(state.arcadeRun.level));
      setText(root, '[data-quiz-score]', String(state.arcadeRun.score));
      setText(root, '[data-quiz-streak]', String(state.arcadeRun.currentStreak));
    } else if (state.coachSession) {
      setText(root, '[data-quiz-score]', `${state.coachAnswers.filter((answer) => answer.isCorrect).length}/${state.coachAnswers.length}`);
      setText(root, '[data-quiz-coach-index]', String(state.coachSession.currentIndex + 1));
    }

    state.arcadeRun = state.arcadeRun ? { ...state.arcadeRun, highScore: progress.arcadeHighScore } : null;
  };

  const renderQuestion = ({ focus = false } = {}) => {
    const question = getCurrentQuestion(state);
    if (!question) {
      renderStart({ focus });
      return;
    }

    showScreen('play');
    renderHud();
    setHidden(feedbackPanel, true);
    setText(root, '[data-quiz-category]', getCategoryLabel(question.category));
    setText(root, '[data-quiz-difficulty]', formatDifficulty(question.difficulty));
    setText(root, '[data-quiz-prompt]', question.prompt);

    const scenario = root.querySelector('[data-quiz-scenario]');
    if (scenario) {
      scenario.textContent = question.scenarioContext ?? '';
      setHidden(scenario, !question.scenarioContext);
    }

    answerButtons.forEach((button) => {
      const choiceId = button.getAttribute('data-choice-id');
      const choice = question.choices.find((item) => item.id === choiceId);
      const label = button.querySelector('strong');
      if (label) label.textContent = choice?.text ?? '';
      button.disabled = false;
      button.removeAttribute('data-answer-selected');
      button.removeAttribute('data-answer-correct');
      button.removeAttribute('data-answer-incorrect');
    });

    if (focus) focusFirst('[data-quiz-answer]');
  };

  const revealFeedback = ({ question, selectedChoiceId, isCorrect, scoreAwarded = 0 }) => {
    answerButtons.forEach((button) => {
      const choiceId = button.getAttribute('data-choice-id');
      button.disabled = true;
      button.toggleAttribute('data-answer-selected', choiceId === selectedChoiceId);
      button.toggleAttribute('data-answer-correct', choiceId === question.correctChoiceId);
      button.toggleAttribute('data-answer-incorrect', choiceId === selectedChoiceId && !isCorrect);
    });

    setHidden(feedbackPanel, false);
    setText(root, '[data-quiz-feedback-title]', isCorrect ? `Correct${scoreAwarded ? ` +${scoreAwarded}` : ''}` : 'Incorrect');
    setText(root, '[data-quiz-feedback-copy]', question.explanation);
    setText(root, '[data-quiz-why-it-matters]', state.mode === 'coach' ? `Why this matters: ${question.whyItMatters}` : '');

    if (referenceLink) {
      if (question.reference) {
        referenceLink.href = question.reference.url;
        referenceLink.textContent = `${question.reference.title}: ${question.reference.section}`;
        setHidden(referenceLink, false);
      } else {
        setHidden(referenceLink, true);
      }
    }

    const nextButton = root.querySelector('[data-quiz-next]');
    if (nextButton) {
      nextButton.textContent = state.pendingArcadeSummary ? 'Game Over' : state.mode === 'coach' && state.coachSession?.currentIndex === state.coachSession.questions.length - 1 ? 'View Summary' : 'Next';
    }

    announce(isCorrect ? 'Correct answer. Explanation ready.' : 'Incorrect answer. Correct answer and explanation ready.');
    scrollFeedbackIntoView();
    focusFirst('[data-quiz-next]');
  };

  const finalizeArcadeSummary = () => {
    if (!state.arcadeRun) return;

    const previousHighScore = getProgress().arcadeHighScore;
    const progress = store.updateArcadeHighScore(state.arcadeRun.score);
    state.arcadeRun = {
      ...state.arcadeRun,
      highScore: progress.arcadeHighScore,
      newHighScore: state.arcadeRun.score > previousHighScore,
    };

    setText(root, '[data-quiz-final-score]', String(state.arcadeRun.score));
    setText(root, '[data-quiz-highest-level]', String(state.arcadeRun.highestLevel));
    setText(root, '[data-quiz-longest-streak]', String(state.arcadeRun.longestStreak));
    setText(root, '[data-quiz-final-high-score]', String(progress.arcadeHighScore));
    setText(root, '[data-quiz-new-high]', state.arcadeRun.newHighScore ? 'NEW HIGH SCORE' : '');
    showScreen('arcade-summary');
    announce('Arcade run ended.');
    focusFirst('[data-quiz-screen="arcade-summary"] [data-quiz-start-mode]');
  };

  const renderCoachSummary = () => {
    if (!state.coachSession) return;

    const summary = createCoachSummary({
      session: state.coachSession,
      answers: state.coachAnswers.map((answer) => ({
        question: answer.question,
        selectedChoiceId: answer.selectedChoiceId,
      })),
      progress: getProgress(),
    });

    setText(root, '[data-quiz-coach-score]', `${summary.correctCount} correct out of ${summary.totalQuestions} (${summary.percentage}%)`);
    const container = root.querySelector('[data-quiz-coach-summary]');
    if (container) {
      const strongest = summary.strongestCategory?.label ?? 'Still gathering data';
      const revisit = summary.revisitCategories.length
        ? summary.revisitCategories
            .slice(0, 3)
            .map((item) => `${item.label}: ${item.statusLabel}`)
            .join('; ')
        : 'Needs more attempts before persistent weak areas are labelled.';
      container.innerHTML = `
        <div><p>Strongest category</p><strong>${strongest}</strong></div>
        <div><p>Suggested revisit</p><strong>${revisit}</strong></div>
        ${summary.categoryPerformance
          .map(
            (item) =>
              `<div><p>${item.label}</p><strong>${item.attempts ? `${item.correct}/${item.attempts}` : 'Still gathering data'}</strong></div>`,
          )
          .join('')}
      `;
    }

    showScreen('coach-summary');
    announce('Coach session summary ready.');
    focusFirst('[data-quiz-screen="coach-summary"] [data-quiz-start-mode]');
  };

  const answerQuestion = (choiceId) => {
    const question = getCurrentQuestion(state);
    if (!question || state.screen !== 'play' || !isWindowActive(root) || !feedbackPanel?.hidden) return;

    if (state.mode === 'arcade') {
      const answered = answerArcadeQuestion(state.arcadeRun, choiceId);
      state.arcadeRun = answered;
      state.pendingArcadeSummary = answered.status === 'game-over';
      renderHud();
      revealFeedback({
        question,
        selectedChoiceId: choiceId,
        isCorrect: answered.feedback.isCorrect,
        scoreAwarded: answered.feedback.scoreAwarded,
      });
      return;
    }

    if (state.mode === 'coach' && state.coachSession) {
      const isCorrect = choiceId === question.correctChoiceId;
      state.coachAnswers.push({
        question,
        selectedChoiceId: choiceId,
        isCorrect,
      });
      store.recordCoachAnswer(question, isCorrect);
      renderHud();
      revealFeedback({
        question,
        selectedChoiceId: choiceId,
        isCorrect,
      });
    }
  };

  const startMode = (mode) => {
    const rng = createQuizRandom(`${Date.now()}-${mode}-${Math.random()}`);
    store.setLastSelectedMode(mode);
    state.mode = mode;
    state.pendingArcadeSummary = false;

    if (mode === 'arcade') {
      state.arcadeRun = createArcadeRun({
        questions: QUIZ_QUESTIONS,
        highScore: getProgress().arcadeHighScore,
        rng,
      });
      state.coachSession = null;
      state.coachAnswers = [];
    } else {
      state.arcadeRun = null;
      state.coachAnswers = [];
      state.coachSession = createCoachSession({
        questions: QUIZ_QUESTIONS,
        progress: getProgress(),
        rng,
      });
    }

    renderQuestion({ focus: true });
  };

  const nextQuestion = () => {
    if (state.mode === 'arcade') {
      if (state.pendingArcadeSummary) {
        finalizeArcadeSummary();
        return;
      }

      state.arcadeRun = continueArcadeRun(state.arcadeRun, { rng: createQuizRandom(`${Date.now()}-arcade-next`) });
      renderQuestion({ focus: true });
      return;
    }

    if (state.mode === 'coach' && state.coachSession) {
      if (state.coachSession.currentIndex >= state.coachSession.questions.length - 1) {
        renderCoachSummary();
        return;
      }

      state.coachSession = {
        ...state.coachSession,
        currentIndex: state.coachSession.currentIndex + 1,
      };
      renderQuestion({ focus: true });
    }
  };

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const modeButton = target.closest('[data-quiz-start-mode]');
    if (modeButton) {
      event.preventDefault();
      startMode(modeButton.getAttribute('data-quiz-start-mode'));
      return;
    }

    const answerButton = target.closest('[data-quiz-answer]');
    if (answerButton) {
      event.preventDefault();
      answerQuestion(answerButton.getAttribute('data-choice-id'));
      return;
    }

    if (target.closest('[data-quiz-next]')) {
      event.preventDefault();
      nextQuestion();
      return;
    }

    if (target.closest('[data-quiz-mode-select]')) {
      event.preventDefault();
      renderStart({ focus: true });
      return;
    }

    if (target.closest('[data-quiz-reset-progress]')) {
      event.preventDefault();
      setHidden(resetConfirm, false);
      focusFirst('[data-quiz-confirm-reset]');
      return;
    }

    if (target.closest('[data-quiz-confirm-reset]')) {
      event.preventDefault();
      store.reset();
      renderProgressSummary();
      setHidden(resetConfirm, true);
      announce('Quiz progress reset.');
      focusFirst('[data-quiz-start-mode]');
      return;
    }

    if (target.closest('[data-quiz-cancel-reset]')) {
      event.preventDefault();
      setHidden(resetConfirm, true);
      focusFirst('[data-quiz-reset-progress]');
    }
  });

  window.addEventListener('keydown', (event) => {
    if (
      !shouldCaptureQuizShortcut({
        key: event.key,
        screen: state.screen,
        feedbackVisible: !feedbackPanel?.hidden,
        windowActive: isWindowActive(root),
      })
    ) {
      return;
    }

    event.preventDefault();
    answerQuestion(getQuizChoiceIdFromKey(event.key));
  });

  const windowElement = getWindowElement(root);
  if (windowElement) {
    const observer = new MutationObserver(() => {
      if (!isWindowActive(root)) {
        resetActiveSession();
        renderProgressSummary();
        showScreen('start');
      }
    });
    observer.observe(windowElement, {
      attributes: true,
      attributeFilter: ['hidden', 'data-window-state'],
    });
  }

  window.addEventListener('pagehide', resetActiveSession);
  renderStart();
};

export const initQuizGames = (documentRoot = document) => {
  documentRoot.querySelectorAll('[data-quiz-game]').forEach(initQuizGame);
};

if (typeof window !== 'undefined') {
  const setup = () => initQuizGames(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
