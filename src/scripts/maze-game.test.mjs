import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const readSource = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('maze generation starts with four rings and caps at 49x49', async () => {
  const { generateMaze, getMazeLevelConfig } = await import('./maze-generation.js');

  const levelOne = generateMaze({ level: 1, seed: 'phase-7a-level-1' });
  assert.equal(levelOne.rings, 4);
  assert.equal(levelOne.width, 11);
  assert.equal(levelOne.height, 11);
  assert.deepEqual(levelOne.centerBounds, { minX: 4, maxX: 6, minY: 4, maxY: 6 });
  assert.deepEqual(levelOne.playerStart, { x: 5, y: 5 });

  const lateConfig = getMazeLevelConfig(40);
  const lateMaze = generateMaze({ level: 40, seed: 'phase-7a-late' });
  assert.equal(lateConfig.rings, 23);
  assert.equal(lateMaze.width, 49);
  assert.equal(lateMaze.height, 49);
});

test('generated mazes are solvable, braided, and keep collectibles reachable', async () => {
  const { generateMaze, getAccessibleCellKeys, getCellKey, getExteriorOpenings, hasMazeLoops, isBoundaryExit } = await import('./maze-generation.js');
  const { findPath } = await import('./maze-pathfinding.js');

  const maze = generateMaze({ level: 8, seed: 'phase-7a-solvable' });
  const exitPath = findPath(maze, maze.playerStart, maze.exit.cell);
  const accessible = getAccessibleCellKeys(maze, maze.playerStart);
  const exteriorOpenings = getExteriorOpenings(maze);

  assert.ok(exitPath.length > 0);
  assert.equal(isBoundaryExit(maze, maze.exit), true);
  assert.equal(exteriorOpenings.length, 1);
  assert.deepEqual(exteriorOpenings[0], maze.exit);
  assert.equal(hasMazeLoops(maze), true);
  assert.ok(maze.deadEnds.length >= 6);
  assert.ok(maze.collectibles.length >= 6);
  assert.equal(accessible.has(getCellKey(maze.exit.cell)), true);

  maze.collectibles.forEach((collectible) => {
    assert.equal(accessible.has(getCellKey(collectible)), true);
  });
});

test('dynamic gateways begin at Level 3 and include open and closed internal candidates', async () => {
  const { generateMaze, getMazeLevelConfig, isGatewayInternal } = await import('./maze-generation.js');

  assert.equal(getMazeLevelConfig(2).dynamicGateways, false);
  assert.equal(getMazeLevelConfig(3).dynamicGateways, true);

  const levelTwo = generateMaze({ level: 2, seed: 'phase-7a-before-dynamic' });
  const levelThree = generateMaze({ level: 3, seed: 'phase-7a-dynamic-start' });

  assert.equal(levelTwo.dynamicGateways.length, 0);
  assert.ok(levelThree.dynamicGateways.some((gateway) => gateway.open));
  assert.ok(levelThree.dynamicGateways.some((gateway) => !gateway.open));
  levelThree.dynamicGateways.forEach((gateway) => {
    assert.equal(isGatewayInternal(levelThree, gateway), true);
  });
});

test('dynamic gateways only use internal optional edges and stay safe when closed without touching the exit opening', async () => {
  const { canToggleGateway, generateMaze, getCellKey, getExteriorOpenings, isGatewayInternal, setGatewayOpen } = await import('./maze-generation.js');
  const { findPath } = await import('./maze-pathfinding.js');

  const maze = generateMaze({ level: 6, seed: 'phase-7a-gateways' });
  const initialOpenings = getExteriorOpenings(maze);

  assert.ok(maze.dynamicGateways.length > 0);
  assert.equal(initialOpenings.length, 1);

  maze.dynamicGateways.filter((gateway) => gateway.open).forEach((gateway) => {
    assert.equal(isGatewayInternal(maze, gateway), true);

    const closedMaze = setGatewayOpen(maze, gateway.id, false);
    assert.ok(findPath(closedMaze, closedMaze.playerStart, closedMaze.exit.cell).length > 0);
    assert.deepEqual(getExteriorOpenings(closedMaze), initialOpenings);

    assert.equal(
      canToggleGateway(closedMaze, gateway.id, {
        player: gateway.a,
        monsters: [],
      }),
      false,
    );
    assert.equal(
      canToggleGateway(closedMaze, gateway.id, {
        player: { x: 0, y: 0 },
        monsters: [gateway.b],
      }),
      false,
    );
    assert.equal(getCellKey(gateway.a).includes(','), true);
  });
});

test('level completion is tied to traversing the exterior exit opening', async () => {
  const { generateMaze } = await import('./maze-generation.js');
  const { isExitTraversal } = await import('./maze-game.js');

  const maze = generateMaze({ level: 3, seed: 'phase-7a-exit-completion' });
  const exitDirection = maze.exit.direction;
  const wrongDirection = {
    north: 'east',
    east: 'south',
    south: 'west',
    west: 'north',
  }[exitDirection];

  assert.equal(isExitTraversal({ maze, player: maze.exit.cell, directionName: exitDirection }), true);
  assert.equal(isExitTraversal({ maze, player: maze.exit.cell, directionName: wrongDirection }), false);
  assert.equal(isExitTraversal({ maze, player: maze.playerStart, directionName: exitDirection }), false);
});

test('maze scoring and monster profiles follow the approved Phase 7A thresholds', async () => {
  const { SCORE_RULES, calculateCollectibleScore, calculateLevelCompletionScore, getMonsterProfile } = await import('./maze-state.js');

  assert.deepEqual(SCORE_RULES, {
    collectible: 25,
    levelBase: 100,
    levelMultiplier: 20,
    fullSweepBonus: 100,
  });
  assert.equal(calculateCollectibleScore(), 25);
  assert.equal(calculateLevelCompletionScore(3), 160);

  assert.equal(getMonsterProfile(5).count, 0);
  assert.equal(getMonsterProfile(6).count, 1);
  assert.equal(getMonsterProfile(6).strategy, 'route-aware');
  assert.ok(getMonsterProfile(6).routeLookahead >= 1);
  assert.ok(getMonsterProfile(6).mistakeChance < 0.38);
  assert.equal(getMonsterProfile(11).count, 2);
  assert.equal(getMonsterProfile(11).strategy, 'coordinated-route');
  assert.ok(getMonsterProfile(11).mistakeChance < getMonsterProfile(6).mistakeChance);
  assert.ok(getMonsterProfile(11).memoryWeight > getMonsterProfile(6).memoryWeight);
  assert.ok(getMonsterProfile(11).routeLookahead > getMonsterProfile(6).routeLookahead);
  assert.equal(getMonsterProfile(16).strategy, 'coordinated-memory');
  assert.equal(getMonsterProfile(21).count, 2);
  assert.equal(getMonsterProfile(30).strategy, 'near-optimal');
  assert.ok(getMonsterProfile(30).moveIntervalMs >= 180);
  assert.ok(getMonsterProfile(30).speedScale <= 1);
});

test('monster spawning waits for five path cells from the central spawn area', async () => {
  const { generateMaze } = await import('./maze-generation.js');
  const { findPath } = await import('./maze-pathfinding.js');
  const {
    canSpawnMonstersForPlayer,
    createMonsterSpawns,
    getPathDistanceFromCentralSpawn,
  } = await import('./maze-game.js');
  const { getMonsterProfile } = await import('./maze-state.js');

  const maze = generateMaze({ level: 6, seed: 'phase-7a-delayed-monster' });
  const profile = getMonsterProfile(6);
  const exitPath = findPath(maze, maze.playerStart, maze.exit.cell);
  const nearCell = exitPath.find((cell) => getPathDistanceFromCentralSpawn(maze, cell) === 4);
  const farCell = exitPath.find((cell) => getPathDistanceFromCentralSpawn(maze, cell) >= 5);

  assert.ok(nearCell);
  assert.ok(farCell);
  assert.equal(canSpawnMonstersForPlayer({ maze, player: nearCell, profile, status: 'playing', monsters: [], movementCount: 30 }), false);
  assert.equal(canSpawnMonstersForPlayer({ maze, player: farCell, profile, status: 'countdown', monsters: [] }), false);
  assert.equal(canSpawnMonstersForPlayer({ maze, player: farCell, profile, status: 'playing', monsters: [] }), true);
  assert.equal(canSpawnMonstersForPlayer({ maze, player: nearCell, profile, status: 'playing', monsters: [] }), false);

  const spawns = createMonsterSpawns(maze, profile.count, farCell);
  assert.equal(spawns.length, 1);
  assert.ok(getPathDistanceFromCentralSpawn(maze, spawns[0]) <= 1);
  assert.ok(findPath(maze, spawns[0], farCell).length - 1 > 1);
});

test('Level 11 monster spawning uses the same fair delay and avoids duplicate spawn cells', async () => {
  const { generateMaze } = await import('./maze-generation.js');
  const { findPath, getCellKey } = await import('./maze-pathfinding.js');
  const { canSpawnMonstersForPlayer, createMonsterSpawns, getPathDistanceFromCentralSpawn } = await import('./maze-game.js');
  const { getMonsterProfile } = await import('./maze-state.js');

  const maze = generateMaze({ level: 11, seed: 'phase-7a-second-monster-delay' });
  const profile = getMonsterProfile(11);
  const exitPath = findPath(maze, maze.playerStart, maze.exit.cell);
  const farCell = exitPath.find((cell) => getPathDistanceFromCentralSpawn(maze, cell) >= 5);

  assert.equal(profile.count, 2);
  assert.ok(farCell);
  assert.equal(canSpawnMonstersForPlayer({ maze, player: farCell, profile, status: 'playing', monsters: [] }), true);

  const spawns = createMonsterSpawns(maze, profile.count, farCell);
  assert.equal(spawns.length, 2);
  assert.equal(new Set(spawns.map(getCellKey)).size, 2);
  spawns.forEach((spawn) => {
    assert.ok(getPathDistanceFromCentralSpawn(maze, spawn) <= 1);
    assert.ok(findPath(maze, spawn, farCell).length - 1 > 1);
  });
});

test('monster decisions are route-aware without giving early levels perfect global knowledge', async () => {
  const { generateMaze } = await import('./maze-generation.js');
  const { chooseMonsterMove, createMonsterMemory } = await import('./maze-pathfinding.js');
  const { createSeededRandom } = await import('./maze-rng.js');

  const maze = generateMaze({ level: 6, seed: 'phase-7a-monster' });
  const monster = { id: 'm1', cell: maze.playerStart, previousCell: null, memory: createMonsterMemory() };
  const player = maze.exit.cell;
  const rng = createSeededRandom('force-early-mistake');

  const decisions = Array.from({ length: 12 }, () =>
    chooseMonsterMove({
      maze,
      monster,
      player,
      level: 6,
      rng,
    }),
  );

  assert.ok(decisions.some((decision) => decision.reason === 'biased-mistake'));
  assert.ok(decisions.every((decision) => decision.nextCell));
});

test('Level 11 monsters coordinate by reserving different next cells', async () => {
  const { generateMaze } = await import('./maze-generation.js');
  const { chooseMonsterMove, createMonsterMemory, getCellKey, getNeighbors } = await import('./maze-pathfinding.js');
  const { createSeededRandom } = await import('./maze-rng.js');

  const maze = generateMaze({ level: 11, seed: 'phase-7a-coordinated-monsters' });
  const player = maze.exit.cell;
  const [firstCell, secondCell] = getNeighbors(maze, maze.playerStart).slice(0, 2);
  const rng = createSeededRandom('coordinated-routes');
  const reservedCells = [];
  const first = chooseMonsterMove({
    maze,
    monster: { id: 'm1', cell: firstCell, previousCell: null, memory: createMonsterMemory() },
    player,
    level: 11,
    rng,
    reservedCells,
  });
  reservedCells.push(first.nextCell);
  const second = chooseMonsterMove({
    maze,
    monster: { id: 'm2', cell: secondCell, previousCell: null, memory: createMonsterMemory() },
    player,
    level: 11,
    rng,
    reservedCells,
  });

  assert.notEqual(getCellKey(first.nextCell), getCellKey(second.nextCell));
});

test('local gateway shifts close one nearby opening and open one nearby closed route safely', async () => {
  const {
    applyGatewayShift,
    chooseLocalGatewayShift,
    generateMaze,
    getExteriorOpenings,
  } = await import('./maze-generation.js');
  const { findPath, getNeighbors, isSameCell, manhattanDistance } = await import('./maze-pathfinding.js');

  const maze = generateMaze({ level: 8, seed: 'phase-7a-local-shift' });
  const playerPath = findPath(maze, maze.playerStart, maze.exit.cell);
  const player = playerPath[Math.min(6, playerPath.length - 2)];
  const beforeOpenings = getExteriorOpenings(maze);
  const shift = chooseLocalGatewayShift({
    maze,
    player,
    entities: { player, monsters: [] },
    radius: 8,
  });

  assert.ok(shift);
  assert.notEqual(shift.closeGateway.id, shift.openGateway.id);
  assert.equal(shift.closeGateway.open, true);
  assert.equal(shift.openGateway.open, false);
  [shift.closeGateway, shift.openGateway].forEach((gateway) => {
    const distance = Math.min(manhattanDistance(player, gateway.a), manhattanDistance(player, gateway.b));
    assert.ok(distance <= 8);
    assert.ok(distance > 1);
  });

  const shiftedMaze = applyGatewayShift(maze, shift);
  const closedGateway = shiftedMaze.dynamicGateways.find((gateway) => gateway.id === shift.closeGateway.id);
  const openedGateway = shiftedMaze.dynamicGateways.find((gateway) => gateway.id === shift.openGateway.id);

  assert.equal(closedGateway.open, false);
  assert.equal(openedGateway.open, true);
  assert.deepEqual(getExteriorOpenings(shiftedMaze), beforeOpenings);
  assert.ok(findPath(shiftedMaze, player, shiftedMaze.exit.cell).length > 0);
  assert.ok(findPath(shiftedMaze, shiftedMaze.playerStart, shiftedMaze.exit.cell).length > 0);
  assert.ok(getNeighbors(shiftedMaze, player).length > 0);
  assert.ok(getNeighbors(shiftedMaze, openedGateway.a).some((neighbor) => isSameCell(neighbor, openedGateway.b)));
});

test('unsafe local gateway shifts are postponed instead of falling back to distant changes', async () => {
  const { chooseLocalGatewayShift, generateMaze, getExteriorOpenings } = await import('./maze-generation.js');
  const { findPath } = await import('./maze-pathfinding.js');

  const maze = generateMaze({ level: 8, seed: 'phase-7a-postpone-unsafe-shift' });
  const playerPath = findPath(maze, maze.playerStart, maze.exit.cell);
  const player = playerPath[Math.min(6, playerPath.length - 2)];
  const occupied = maze.dynamicGateways.flatMap((gateway) => [gateway.a, gateway.b]);
  const beforeOpenings = getExteriorOpenings(maze);
  const shift = chooseLocalGatewayShift({
    maze,
    player,
    entities: { player, monsters: occupied },
    radius: maze.width,
  });

  assert.equal(shift, null);
  assert.deepEqual(getExteriorOpenings(maze), beforeOpenings);
});

test('high-score storage falls back safely when localStorage is unavailable', async () => {
  const { MAZE_MUSIC_ENABLED_KEY, createMazeHighScoreStore, createMazeMusicPreferenceStore } = await import('./maze-storage.js');

  const memoryStore = createMazeHighScoreStore({
    storage: null,
    key: 'test',
  });
  assert.equal(memoryStore.get(), 0);
  assert.equal(memoryStore.update(125), 125);
  assert.equal(memoryStore.update(75), 125);

  const brokenStore = createMazeHighScoreStore({
    storage: {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    },
    key: 'test',
  });
  assert.equal(brokenStore.get(), 0);
  assert.equal(brokenStore.update(80), 80);

  const musicMemoryStore = createMazeMusicPreferenceStore({
    storage: null,
    key: 'music-test',
  });
  assert.equal(MAZE_MUSIC_ENABLED_KEY, 'burakOs.mazeMusicEnabled.v1');
  assert.equal(musicMemoryStore.get(), false);
  assert.equal(musicMemoryStore.set(true), true);
  assert.equal(musicMemoryStore.get(), true);

  const values = new Map();
  const persistedMusicStore = createMazeMusicPreferenceStore({
    storage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    key: 'music-test',
  });
  assert.equal(persistedMusicStore.get(), false);
  persistedMusicStore.set(true);
  assert.equal(values.get('music-test'), 'true');
  assert.equal(persistedMusicStore.get(), true);

  const brokenMusicStore = createMazeMusicPreferenceStore({
    storage: {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    },
    key: 'music-test',
  });
  assert.equal(brokenMusicStore.get(), false);
  brokenMusicStore.set(true);
  assert.equal(brokenMusicStore.get(), true);
});

test('maze music player is user-started, idempotent, and stoppable', async () => {
  const { createMazeChiptunePlayer, formatMazeMusicToggleLabel, getMazeMusicLifecycleAction } = await import('./maze-audio.js');
  const timers = new Map();
  const clearedTimers = [];
  const contexts = [];
  let nextTimerId = 1;

  class FakeGain {
    constructor() {
      this.gain = {
        value: 0,
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        cancelScheduledValues() {},
      };
    }

    connect() {}
  }

  class FakeOscillator {
    constructor() {
      this.frequency = {
        setValueAtTime() {},
      };
      this.type = '';
    }

    connect() {}
    start() {}
    stop() {}
  }

  class FakeAudioContext {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
      this.state = 'suspended';
      contexts.push(this);
    }

    createGain() {
      return new FakeGain();
    }

    createOscillator() {
      return new FakeOscillator();
    }

    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
  }

  const player = createMazeChiptunePlayer({
    AudioContext: FakeAudioContext,
    setTimeout: (callback, delay) => {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => {
      clearedTimers.push(id);
      timers.delete(id);
    },
  });

  assert.equal(player.isPlaying(), false);
  assert.equal(contexts.length, 0);
  assert.equal(formatMazeMusicToggleLabel(false), 'MUSIC: OFF');
  assert.equal(formatMazeMusicToggleLabel(true), 'MUSIC: ON');

  await player.start();
  assert.equal(contexts.length, 1);
  assert.equal(player.isPlaying(), true);
  assert.equal(timers.size, 1);

  await player.start();
  assert.equal(contexts.length, 1);
  assert.equal(timers.size, 1);

  player.stop();
  assert.equal(player.isPlaying(), false);
  assert.equal(clearedTimers.length, 1);

  await player.start();
  assert.equal(contexts.length, 1);
  assert.equal(player.isPlaying(), true);

  assert.equal(getMazeMusicLifecycleAction({ windowOpen: false, pageVisible: true }), 'stop');
  assert.equal(getMazeMusicLifecycleAction({ windowOpen: true, pageVisible: false }), 'stop');
  assert.equal(getMazeMusicLifecycleAction({ windowOpen: true, pageVisible: true }), 'none');
});

test('maze input helpers only capture movement keys while gameplay is active', async () => {
  const { getDirectionFromKey, shouldCaptureMazeKey } = await import('./maze-input.js');

  assert.deepEqual(getDirectionFromKey('ArrowUp'), { dx: 0, dy: -1, name: 'north' });
  assert.deepEqual(getDirectionFromKey('w'), { dx: 0, dy: -1, name: 'north' });
  assert.deepEqual(getDirectionFromKey('D'), { dx: 1, dy: 0, name: 'east' });
  assert.equal(getDirectionFromKey('Escape'), null);
  assert.equal(shouldCaptureMazeKey({ key: 'ArrowDown', isActive: true, status: 'playing' }), true);
  assert.equal(shouldCaptureMazeKey({ key: 'ArrowDown', isActive: false, status: 'playing' }), false);
  assert.equal(shouldCaptureMazeKey({ key: 'ArrowDown', isActive: true, status: 'countdown' }), false);
});

test('maze lifecycle stops on window close and pauses on page hide', async () => {
  const { getMazeLifecycleTransition } = await import('./maze-game.js');

  assert.equal(getMazeLifecycleTransition({ status: 'playing', windowOpen: false, pageVisible: true }), 'stop');
  assert.equal(getMazeLifecycleTransition({ status: 'countdown', windowOpen: false, pageVisible: true }), 'stop');
  assert.equal(getMazeLifecycleTransition({ status: 'playing', windowOpen: true, pageVisible: false }), 'pause');
  assert.equal(getMazeLifecycleTransition({ status: 'paused', windowOpen: true, pageVisible: true }), 'resume');
  assert.equal(getMazeLifecycleTransition({ status: 'idle', windowOpen: true, pageVisible: true }), 'none');
});

test('Maze start screen teaches the visible exit, controls, scoring, and level thresholds', () => {
  const mazeSource = readSource('../components/os/MazeGame.astro');

  assert.match(mazeSource, /HOW TO PLAY/);
  assert.match(mazeSource, /opening in the outer wall/);
  assert.match(mazeSource, /Arrow keys/);
  assert.match(mazeSource, /WASD/);
  assert.match(mazeSource, /touch D-pad/);
  assert.match(mazeSource, /Collect items/);
  assert.match(mazeSource, /new random maze/);
  assert.match(mazeSource, /Level 3/);
  assert.match(mazeSource, /Level 6/);
  assert.match(mazeSource, /Level 11/);
  assert.match(mazeSource, /one touch ends the run/);
  assert.match(mazeSource, /3, 2, 1 countdown/);
  assert.match(mazeSource, /data-maze-music-toggle/);
  assert.match(mazeSource, /aria-pressed="false"/);
});

test('maze renderer exposes a real exit indicator with reduced-motion support', () => {
  const rendererSource = readSource('./maze-renderer.js');

  assert.match(rendererSource, /drawExitIndicator/);
  assert.match(rendererSource, /reducedMotion/);
  assert.match(rendererSource, /getExitIndicatorAlpha/);
  assert.match(rendererSource, /doorway/i);
  assert.doesNotMatch(rendererSource, /shortest|solution route|minimap/i);
});

test('OS integration launches Maze.exe from Bin only and does not start quiz phases', () => {
  const shell = readSource('../components/os/OsShell.astro');
  const bin = readSource('../components/os/BinFolder.astro');
  const osWindow = readSource('../components/os/OsWindow.astro');
  const manager = readSource('./os-window-manager.js');
  const osCss = readSource('../styles/os.css');

  assert.equal(existsSync(new URL('../components/os/MazeGame.astro', import.meta.url)), true);
  assert.match(shell, /import MazeGame from '\.\/MazeGame\.astro';/);
  assert.match(shell, /window\.id === 'maze'[\s\S]*<MazeGame \/>/);
  assert.match(bin, /Maze\.exe/);
  assert.match(bin, /data-os-game-file/);
  assert.match(bin, /data-os-target="maze"/);
  assert.match(osWindow, /kind: 'main' \| 'folder' \| 'game'/);
  assert.match(manager, /GAME_APPS\s*=\s*\['maze'\]/);
  assert.match(osCss, /\.os-window--game\s*\{[\s\S]*z-index:\s*24;/);
  assert.doesNotMatch(shell, /QuizGame|AgileQuiz|ScrumQuiz/i);
  assert.doesNotMatch(bin, /Quiz|Scrum/i);
});
