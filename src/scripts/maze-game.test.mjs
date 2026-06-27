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
  const { generateMaze, getAccessibleCellKeys, getCellKey, hasMazeLoops, isBoundaryExit } = await import('./maze-generation.js');
  const { findPath } = await import('./maze-pathfinding.js');

  const maze = generateMaze({ level: 8, seed: 'phase-7a-solvable' });
  const exitPath = findPath(maze, maze.playerStart, maze.exit.cell);
  const accessible = getAccessibleCellKeys(maze, maze.playerStart);

  assert.ok(exitPath.length > 0);
  assert.equal(isBoundaryExit(maze, maze.exit), true);
  assert.equal(hasMazeLoops(maze), true);
  assert.ok(maze.deadEnds.length >= 6);
  assert.ok(maze.collectibles.length >= 6);

  maze.collectibles.forEach((collectible) => {
    assert.equal(accessible.has(getCellKey(collectible)), true);
  });
});

test('dynamic gateways only use internal optional edges and stay safe when closed', async () => {
  const { canToggleGateway, generateMaze, getCellKey, isGatewayInternal, setGatewayOpen } = await import('./maze-generation.js');
  const { findPath } = await import('./maze-pathfinding.js');

  const maze = generateMaze({ level: 6, seed: 'phase-7a-gateways' });

  assert.ok(maze.dynamicGateways.length > 0);

  maze.dynamicGateways.forEach((gateway) => {
    assert.equal(isGatewayInternal(maze, gateway), true);

    const closedMaze = setGatewayOpen(maze, gateway.id, false);
    assert.ok(findPath(closedMaze, closedMaze.playerStart, closedMaze.exit.cell).length > 0);

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

  assert.equal(getMonsterProfile(10).count, 0);
  assert.equal(getMonsterProfile(11).count, 1);
  assert.equal(getMonsterProfile(11).strategy, 'local-biased');
  assert.ok(getMonsterProfile(11).mistakeChance > getMonsterProfile(16).mistakeChance);
  assert.equal(getMonsterProfile(16).strategy, 'memory-biased');
  assert.equal(getMonsterProfile(21).count, 2);
  assert.equal(getMonsterProfile(30).strategy, 'near-optimal');
  assert.ok(getMonsterProfile(30).moveIntervalMs >= 180);
  assert.ok(getMonsterProfile(30).speedScale <= 1);
});

test('monster decisions are biased without giving early levels perfect global knowledge', async () => {
  const { generateMaze } = await import('./maze-generation.js');
  const { chooseMonsterMove, createMonsterMemory } = await import('./maze-pathfinding.js');
  const { createSeededRandom } = await import('./maze-rng.js');

  const maze = generateMaze({ level: 11, seed: 'phase-7a-monster' });
  const monster = { id: 'm1', cell: maze.playerStart, previousCell: null, memory: createMonsterMemory() };
  const player = maze.exit.cell;
  const rng = createSeededRandom('force-early-mistake');

  const decisions = Array.from({ length: 12 }, () =>
    chooseMonsterMove({
      maze,
      monster,
      player,
      level: 11,
      rng,
    }),
  );

  assert.ok(decisions.some((decision) => decision.reason === 'biased-mistake'));
  assert.ok(decisions.every((decision) => decision.nextCell));
});

test('high-score storage falls back safely when localStorage is unavailable', async () => {
  const { createMazeHighScoreStore } = await import('./maze-storage.js');

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
