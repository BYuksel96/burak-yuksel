import {
  canToggleGateway,
  generateMaze,
  getCellKey,
  getCellRing,
  markGatewayWarning,
  setGatewayOpen,
} from './maze-generation.js';
import { getDirectionFromKey, shouldCaptureMazeKey } from './maze-input.js';
import { chooseMonsterMove, createMonsterMemory, getCell, isSameCell } from './maze-pathfinding.js';
import { createSeededRandom } from './maze-rng.js';
import { createMazeHighScoreStore } from './maze-storage.js';
import { calculateCollectibleScore, calculateLevelCompletionScore, getMonsterProfile } from './maze-state.js';
import { drawMazeScene } from './maze-renderer.js';

const COUNTDOWN_VALUES = ['3', '2', '1'];
const GATEWAY_WARNING_MS = 850;
const GATEWAY_INTERVAL_MS = 3600;
const PLAYER_TOUCH_REPEAT_MS = 150;

const directionFromName = {
  north: { dx: 0, dy: -1, name: 'north' },
  east: { dx: 1, dy: 0, name: 'east' },
  south: { dx: 0, dy: 1, name: 'south' },
  west: { dx: -1, dy: 0, name: 'west' },
};

const setHidden = (element, hidden) => {
  if (!element) return;

  element.hidden = hidden;
  element.setAttribute('aria-hidden', String(hidden));
};

const setText = (root, selector, text) => {
  const element = root.querySelector(selector);
  if (element) element.textContent = text;
};

const isWindowActive = (root) => {
  const windowElement = root.closest('[data-os-window]');
  return Boolean(windowElement && !windowElement.hidden && windowElement.getAttribute('data-window-state') === 'open' && !document.hidden);
};

export const getMazeLifecycleTransition = ({ status, windowOpen, pageVisible }) => {
  if (!windowOpen && ['countdown', 'playing', 'paused', 'game-over'].includes(status)) return 'stop';
  if (!pageVisible && ['countdown', 'playing'].includes(status)) return 'pause';
  if (windowOpen && pageVisible && status === 'paused') return 'resume';
  return 'none';
};

const resizeCanvas = (canvas) => {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.floor(rect.width * scale));
  const height = Math.max(280, Math.floor(rect.height * scale));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
};

const createRuntimeState = (highScore) => ({
  status: 'idle',
  level: 1,
  score: 0,
  highScore,
  highestLevelReached: 1,
  maze: null,
  player: null,
  collectedKeys: new Set(),
  monsters: [],
  countdownText: '',
  newHighScore: false,
});

export const createMonsterSpawns = (maze, count) => {
  const { minX, maxX, minY, maxY } = maze.centerBounds;
  const candidates = [
    { x: Math.floor((minX + maxX) / 2), y: Math.floor((minY + maxY) / 2) },
    { x: minX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
    { x: maxX, y: minY },
  ];

  return candidates.slice(0, count);
};

export const initMazeGame = (root, options = {}) => {
  if (!root || root.dataset.mazeGameReady === 'true') return;

  root.dataset.mazeGameReady = 'true';

  const canvas = root.querySelector('[data-maze-canvas]');
  const context = canvas?.getContext?.('2d');
  const highScoreStore = createMazeHighScoreStore({
    storage: options.storage ?? (typeof window !== 'undefined' ? window.localStorage : null),
  });
  const rng = createSeededRandom(options.seed || Date.now());
  let state = createRuntimeState(highScoreStore.get());
  let frameId = 0;
  let countdownTimer = 0;
  let monsterTimer = 0;
  let gatewayTimer = 0;
  let touchTimer = 0;
  let warnedGatewayId = '';

  const render = () => {
    root.dataset.mazeStatus = state.status;
    setText(root, '[data-maze-level]', String(state.level));
    setText(root, '[data-maze-score]', String(state.score));
    setText(root, '[data-maze-high-score]', String(state.highScore));
    setText(root, '[data-maze-countdown-value]', state.countdownText);
    setHidden(root.querySelector('[data-maze-start-screen]'), state.status !== 'idle');
    setHidden(root.querySelector('[data-maze-countdown]'), state.status !== 'countdown');
    setHidden(root.querySelector('[data-maze-game-over]'), state.status !== 'game-over');
    setHidden(root.querySelector('[data-maze-paused]'), state.status !== 'paused');

    if (state.status === 'game-over') {
      setText(root, '[data-maze-final-score]', String(state.score));
      setText(root, '[data-maze-highest-level]', String(state.highestLevelReached));
      setText(root, '[data-maze-game-over-high-score]', String(state.highScore));
      setText(root, '[data-maze-new-high-score]', state.newHighScore ? 'New high score achieved' : '');
    }

    if (context && canvas && state.maze && state.player) {
      resizeCanvas(canvas);
      drawMazeScene(context, {
        canvas,
        maze: state.maze,
        player: state.player,
        monsters: state.monsters,
        collectedKeys: state.collectedKeys,
      });
    }
  };

  const animationLoop = () => {
    render();
    frameId = window.requestAnimationFrame(animationLoop);
  };

  const clearTimers = () => {
    window.clearInterval(countdownTimer);
    window.clearInterval(monsterTimer);
    window.clearInterval(gatewayTimer);
    window.clearInterval(touchTimer);
    window.clearTimeout(warnedGatewayId);
    countdownTimer = 0;
    monsterTimer = 0;
    gatewayTimer = 0;
    touchTimer = 0;
    warnedGatewayId = '';
  };

  const stopRun = () => {
    clearTimers();
    state.status = 'idle';
    state.maze = null;
    state.player = null;
    state.monsters = [];
    state.collectedKeys = new Set();
    state.countdownText = '';
    render();
  };

  const endGame = () => {
    clearTimers();
    const previousHighScore = state.highScore;
    state.highScore = highScoreStore.update(state.score);
    state.newHighScore = state.highScore > previousHighScore;
    state.status = 'game-over';
    render();
  };

  const checkCollision = () => {
    if (state.monsters.some((monster) => isSameCell(monster.cell, state.player))) {
      endGame();
      return true;
    }

    return false;
  };

  const maybeSpawnMonsters = () => {
    const profile = getMonsterProfile(state.level);
    if (!state.maze || profile.count === 0 || state.monsters.length >= profile.count) return;
    if (getCellRing(state.player, state.maze.centerBounds) < 2) return;

    state.monsters = createMonsterSpawns(state.maze, profile.count).map((cell, index) => ({
      id: `monster-${index + 1}`,
      cell,
      previousCell: null,
      memory: createMonsterMemory(),
    }));
  };

  const moveMonster = () => {
    if (state.status !== 'playing' || !state.maze || !state.player) return;

    maybeSpawnMonsters();

    const reservedCells = [];
    state.monsters = state.monsters.map((monster) => {
      const decision = chooseMonsterMove({
        maze: state.maze,
        monster,
        player: state.player,
        level: state.level,
        rng,
        reservedCells,
      });
      reservedCells.push(decision.nextCell);
      return {
        ...monster,
        previousCell: monster.cell,
        cell: decision.nextCell,
      };
    });

    checkCollision();
    render();
  };

  const scheduleMonsters = () => {
    window.clearInterval(monsterTimer);
    const profile = getMonsterProfile(state.level);
    if (profile.count === 0) return;

    monsterTimer = window.setInterval(moveMonster, profile.moveIntervalMs);
  };

  const chooseGateway = () => {
    if (!state.maze?.dynamicGateways.length) return null;

    const entities = {
      player: state.player,
      monsters: state.monsters.map((monster) => monster.cell),
    };

    return state.maze.dynamicGateways.find((gateway) => canToggleGateway(state.maze, gateway.id, entities)) ?? null;
  };

  const warnAndToggleGateway = () => {
    if (state.status !== 'playing') return;
    const gateway = chooseGateway();
    if (!gateway) return;

    state.maze = markGatewayWarning(state.maze, gateway.id, true);
    render();

    warnedGatewayId = window.setTimeout(() => {
      if (state.status !== 'playing' || !canToggleGateway(state.maze, gateway.id, {
        player: state.player,
        monsters: state.monsters.map((monster) => monster.cell),
      })) {
        state.maze = markGatewayWarning(state.maze, gateway.id, false);
        render();
        return;
      }

      state.maze = setGatewayOpen(state.maze, gateway.id, !gateway.open);
      render();
    }, GATEWAY_WARNING_MS);
  };

  const scheduleGateways = () => {
    window.clearInterval(gatewayTimer);
    if (!state.maze?.dynamicGateways.length) return;

    gatewayTimer = window.setInterval(warnAndToggleGateway, Math.max(2200, GATEWAY_INTERVAL_MS - state.level * 45));
  };

  const startGameplay = () => {
    state.status = 'playing';
    state.countdownText = '';
    scheduleMonsters();
    scheduleGateways();
    render();
  };

  const startLevel = () => {
    clearTimers();
    state.maze = generateMaze({ level: state.level, seed: `${Date.now()}-${state.level}-${rng()}` });
    state.player = { ...state.maze.playerStart };
    state.collectedKeys = new Set();
    state.monsters = [];
    state.highestLevelReached = Math.max(state.highestLevelReached, state.level);
    state.status = 'countdown';
    let countdownIndex = 0;
    state.countdownText = COUNTDOWN_VALUES[countdownIndex];
    render();

    countdownTimer = window.setInterval(() => {
      countdownIndex += 1;
      if (countdownIndex >= COUNTDOWN_VALUES.length) {
        window.clearInterval(countdownTimer);
        startGameplay();
        return;
      }

      state.countdownText = COUNTDOWN_VALUES[countdownIndex];
      render();
    }, 1000);
  };

  const startRun = () => {
    clearTimers();
    state = createRuntimeState(highScoreStore.get());
    startLevel();
  };

  const completeLevel = () => {
    const collectedAll = state.collectedKeys.size === state.maze.collectibles.length;
    state.score += calculateLevelCompletionScore(state.level, collectedAll);
    state.level += 1;
    state.highestLevelReached = Math.max(state.highestLevelReached, state.level);
    startLevel();
  };

  const collectAtPlayer = () => {
    const collectible = state.maze.collectibles.find((item) => item.x === state.player.x && item.y === state.player.y);
    if (!collectible) return;

    const key = getCellKey(collectible);
    if (state.collectedKeys.has(key)) return;

    state.collectedKeys.add(key);
    state.score += calculateCollectibleScore();
  };

  const tryMovePlayer = (direction) => {
    if (state.status !== 'playing' || !state.maze || !state.player) return;

    if (isSameCell(state.player, state.maze.exit.cell) && direction.name === state.maze.exit.direction) {
      completeLevel();
      return;
    }

    const current = getCell(state.maze, state.player);
    if (!current?.open?.[direction.name]) return;

    const nextCell = {
      x: state.player.x + direction.dx,
      y: state.player.y + direction.dy,
    };
    if (!getCell(state.maze, nextCell)) return;

    state.player = nextCell;
    collectAtPlayer();
    maybeSpawnMonsters();
    checkCollision();
    render();
  };

  const pauseIfInactive = () => {
    const windowElement = root.closest('[data-os-window]');
    const transition = getMazeLifecycleTransition({
      status: state.status,
      windowOpen: Boolean(windowElement && !windowElement.hidden && windowElement.getAttribute('data-window-state') === 'open'),
      pageVisible: !document.hidden,
    });

    if (transition === 'stop') {
      stopRun();
      return;
    }

    if (transition === 'pause') {
      clearTimers();
      state.status = state.maze ? 'paused' : 'idle';
      render();
      return;
    }

    if (transition === 'resume') {
      state.status = 'countdown';
      state.countdownText = '3';
      let index = 0;
      countdownTimer = window.setInterval(() => {
        index += 1;
        if (index >= COUNTDOWN_VALUES.length) {
          window.clearInterval(countdownTimer);
          startGameplay();
          return;
        }
        state.countdownText = COUNTDOWN_VALUES[index];
        render();
      }, 1000);
      render();
    }
  };

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('[data-maze-play]') || target.closest('[data-maze-restart]')) {
      event.preventDefault();
      startRun();
      return;
    }

    const directionButton = target.closest('[data-maze-direction]');
    if (directionButton) {
      event.preventDefault();
      const direction = directionFromName[directionButton.getAttribute('data-maze-direction')];
      if (direction) tryMovePlayer(direction);
    }
  });

  root.addEventListener('pointerdown', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-maze-direction]') : null;
    if (!button) return;

    const direction = directionFromName[button.getAttribute('data-maze-direction')];
    if (!direction) return;

    event.preventDefault();
    window.clearInterval(touchTimer);
    tryMovePlayer(direction);
    touchTimer = window.setInterval(() => tryMovePlayer(direction), PLAYER_TOUCH_REPEAT_MS);
  });

  root.addEventListener('pointerup', () => window.clearInterval(touchTimer));
  root.addEventListener('pointercancel', () => window.clearInterval(touchTimer));
  root.addEventListener('pointerleave', () => window.clearInterval(touchTimer));

  window.addEventListener('keydown', (event) => {
    if (!shouldCaptureMazeKey({ key: event.key, isActive: isWindowActive(root), status: state.status })) return;

    event.preventDefault();
    tryMovePlayer(getDirectionFromKey(event.key));
  });

  document.addEventListener('visibilitychange', pauseIfInactive);

  const windowElement = root.closest('[data-os-window]');
  if (windowElement) {
    const observer = new MutationObserver(pauseIfInactive);
    observer.observe(windowElement, {
      attributes: true,
      attributeFilter: ['hidden', 'data-window-state'],
    });
  }

  window.addEventListener('resize', render);
  window.addEventListener('pagehide', () => {
    clearTimers();
    window.cancelAnimationFrame(frameId);
  });

  animationLoop();
  render();
};

export const initMazeGames = (documentRoot = document) => {
  documentRoot.querySelectorAll('[data-maze-game]').forEach(initMazeGame);
};

if (typeof window !== 'undefined') {
  const setup = () => initMazeGames(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
