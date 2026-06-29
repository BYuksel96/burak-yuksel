import {
  applyGatewayShift,
  chooseLocalGatewayShift,
  generateMaze,
  getCellKey,
  getLocalGatewayRadius,
  isGatewayShiftSafe,
  markGatewayShiftWarning,
} from './maze-generation.js';
import { createMazeChiptunePlayer, formatMazeMusicToggleLabel, getMazeMusicLifecycleAction } from './maze-audio.js';
import { getDirectionFromKey, shouldCaptureMazeKey } from './maze-input.js';
import { chooseMonsterMove, createMonsterMemory, findPath, getCell, getCellKey as getPathCellKey, isSameCell } from './maze-pathfinding.js';
import { createSeededRandom } from './maze-rng.js';
import { createMazeHighScoreStore, createMazeMusicPreferenceStore } from './maze-storage.js';
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

const isOsBlockingContext = (root) => {
  const screen = root.closest('[data-os-screen]');
  if (!screen) return false;

  const helpDialog = screen.querySelector('[data-os-help-dialog]');
  const downloadConfirm = screen.querySelector('[data-os-download-confirm]');
  const lockScreen = screen.querySelector('[data-os-lock-screen]');

  return Boolean(
    screen.hasAttribute('data-os-locked') ||
      (helpDialog && !helpDialog.hidden) ||
      (downloadConfirm && !downloadConfirm.hidden) ||
      (lockScreen && !lockScreen.hidden),
  );
};

export const getMazeLifecycleTransition = ({ status, windowOpen, pageVisible }) => {
  if (!windowOpen && ['countdown', 'playing', 'paused', 'game-over'].includes(status)) return 'stop';
  if (!pageVisible && ['countdown', 'playing'].includes(status)) return 'pause';
  if (windowOpen && pageVisible && status === 'paused') return 'resume';
  return 'none';
};

export const shouldCaptureMazeShortcut = ({ key, isActive, status, osBlocked = false } = {}) =>
  !osBlocked && shouldCaptureMazeKey({ key, isActive, status });

export const isExitTraversal = ({ maze, player, directionName }) =>
  Boolean(maze?.exit?.cell && isSameCell(player, maze.exit.cell) && directionName === maze.exit.direction);

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

const MONSTER_SPAWN_DISTANCE = 5;

export const getCentralSpawnCells = (maze) => {
  const { minX, maxX, minY, maxY } = maze.centerBounds;
  const cells = [];

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      cells.push({ x, y });
    }
  }

  return cells;
};

const getPathDistance = (maze, start, goal) => {
  const path = findPath(maze, start, goal);
  return path.length > 0 ? path.length - 1 : Number.POSITIVE_INFINITY;
};

export const getPathDistanceFromCentralSpawn = (maze, cell) =>
  Math.min(...getCentralSpawnCells(maze).map((spawnCell) => getPathDistance(maze, spawnCell, cell)));

export const canSpawnMonstersForPlayer = ({ maze, player, profile, status = 'playing', monsters = [], minimumDistance = MONSTER_SPAWN_DISTANCE }) => {
  if (!maze || !player || !profile || status !== 'playing') return false;
  if (profile.count === 0 || monsters.length >= profile.count) return false;

  return getPathDistanceFromCentralSpawn(maze, player) >= minimumDistance;
};

const getRouteFirstStepKey = (maze, start, goal) => {
  const route = findPath(maze, start, goal);
  return route[1] ? getPathCellKey(route[1]) : '';
};

export const createMonsterSpawns = (maze, count, player = null) => {
  const candidates = getCentralSpawnCells(maze)
    .map((cell) => ({
      cell,
      distanceToPlayer: player ? getPathDistance(maze, cell, player) : 0,
      routeKey: player ? getRouteFirstStepKey(maze, cell, player) : getPathCellKey(cell),
      centerDistance: Math.abs(cell.x - maze.playerStart.x) + Math.abs(cell.y - maze.playerStart.y),
    }))
    .filter((candidate) => !player || candidate.distanceToPlayer > 1)
    .sort((a, b) => b.distanceToPlayer - a.distanceToPlayer || b.centerDistance - a.centerDistance || a.cell.y - b.cell.y || a.cell.x - b.cell.x);

  const selected = [];
  const usedCellKeys = new Set();
  const usedRouteKeys = new Set();

  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (usedCellKeys.has(getPathCellKey(candidate.cell))) continue;
    if (usedRouteKeys.has(candidate.routeKey) && candidates.some((item) => !usedRouteKeys.has(item.routeKey))) continue;

    selected.push(candidate.cell);
    usedCellKeys.add(getPathCellKey(candidate.cell));
    if (candidate.routeKey) usedRouteKeys.add(candidate.routeKey);
  }

  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (usedCellKeys.has(getPathCellKey(candidate.cell))) continue;

    selected.push(candidate.cell);
    usedCellKeys.add(getPathCellKey(candidate.cell));
  }

  return selected;
};

export const initMazeGame = (root, options = {}) => {
  if (!root || root.dataset.mazeGameReady === 'true') return;

  root.dataset.mazeGameReady = 'true';

  const canvas = root.querySelector('[data-maze-canvas]');
  const context = canvas?.getContext?.('2d');
  const highScoreStore = createMazeHighScoreStore({
    storage: options.storage ?? (typeof window !== 'undefined' ? window.localStorage : null),
  });
  const musicPreferenceStore = createMazeMusicPreferenceStore({
    storage: options.storage ?? (typeof window !== 'undefined' ? window.localStorage : null),
  });
  const musicPlayer = createMazeChiptunePlayer({
    AudioContext: options.AudioContext ?? (typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : undefined),
  });
  const reducedMotionQuery =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const rng = createSeededRandom(options.seed || Date.now());
  let state = createRuntimeState(highScoreStore.get());
  let musicEnabled = musicPreferenceStore.get();
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
    root.querySelectorAll('[data-maze-music-toggle]').forEach((button) => {
      button.textContent = formatMazeMusicToggleLabel(musicEnabled);
      button.setAttribute('aria-pressed', String(musicEnabled));
    });
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
        timeMs: typeof performance !== 'undefined' ? performance.now() : Date.now(),
        reducedMotion: Boolean(reducedMotionQuery?.matches),
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
    musicPlayer.stop();
    state.status = 'idle';
    state.maze = null;
    state.player = null;
    state.monsters = [];
    state.collectedKeys = new Set();
    state.countdownText = '';
    render();
  };

  const setMusicEnabled = (enabled, { userGesture = false } = {}) => {
    musicEnabled = musicPreferenceStore.set(enabled);
    render();

    if (!musicEnabled) {
      musicPlayer.stop();
      return;
    }

    if (userGesture) {
      void musicPlayer.start();
    }
  };

  const startMusicFromUserGesture = () => {
    if (musicEnabled) {
      void musicPlayer.start();
    }
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
    if (
      !canSpawnMonstersForPlayer({
        maze: state.maze,
        player: state.player,
        profile,
        status: state.status,
        monsters: state.monsters,
      })
    ) {
      return;
    }

    const spawnCount = profile.count - state.monsters.length;
    const existingCount = state.monsters.length;
    const newMonsters = createMonsterSpawns(state.maze, spawnCount, state.player).map((cell, index) => ({
      id: `monster-${existingCount + index + 1}`,
      cell,
      previousCell: null,
      memory: createMonsterMemory(),
    }));

    state.monsters = [...state.monsters, ...newMonsters];
  };

  const getGatewayEntities = () => ({
    player: state.player,
    monsters: state.monsters.flatMap((monster) => [monster.cell, monster.previousCell].filter(Boolean)),
  });

  const chooseGatewayShift = () => {
    if (!state.maze?.dynamicGateways.length || !state.player) return null;

    return chooseLocalGatewayShift({
      maze: state.maze,
      player: state.player,
      entities: getGatewayEntities(),
      radius: getLocalGatewayRadius(state.maze),
    });
  };

  const warnAndToggleGateway = () => {
    if (state.status !== 'playing') return;
    const shift = chooseGatewayShift();
    if (!shift) return;

    state.maze = markGatewayShiftWarning(state.maze, shift, true);
    render();

    warnedGatewayId = window.setTimeout(() => {
      const safe = isGatewayShiftSafe({
        maze: state.maze,
        shift,
        player: state.player,
        entities: getGatewayEntities(),
        radius: getLocalGatewayRadius(state.maze),
      });

      if (state.status !== 'playing' || !safe) {
        state.maze = markGatewayShiftWarning(state.maze, shift, false);
        render();
        return;
      }

      state.maze = applyGatewayShift(state.maze, shift);
      render();
    }, GATEWAY_WARNING_MS);
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

    if (isExitTraversal({ maze: state.maze, player: state.player, directionName: direction.name })) {
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
    const windowOpen = Boolean(windowElement && !windowElement.hidden && windowElement.getAttribute('data-window-state') === 'open');
    const pageVisible = !document.hidden;

    if (getMazeMusicLifecycleAction({ windowOpen, pageVisible }) === 'stop') {
      musicPlayer.stop();
    }

    const transition = getMazeLifecycleTransition({
      status: state.status,
      windowOpen,
      pageVisible,
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

    const musicToggle = target.closest('[data-maze-music-toggle]');
    if (musicToggle) {
      event.preventDefault();
      setMusicEnabled(!musicEnabled, { userGesture: true });
      return;
    }

    if (target.closest('[data-maze-play]') || target.closest('[data-maze-restart]')) {
      event.preventDefault();
      startRun();
      startMusicFromUserGesture();
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
    if (
      !shouldCaptureMazeShortcut({
        key: event.key,
        isActive: isWindowActive(root),
        status: state.status,
        osBlocked: isOsBlockingContext(root),
      })
    ) {
      return;
    }

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
    musicPlayer.stop();
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
