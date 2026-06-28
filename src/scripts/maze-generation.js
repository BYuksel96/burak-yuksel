import { chooseRandom, createSeededRandom, shuffle } from './maze-rng.js';
import { DIRECTIONS, findPath, getCell, getCellKey, getNeighbors } from './maze-pathfinding.js';

export { getCellKey } from './maze-pathfinding.js';

const MAX_RINGS = 23;
const STARTING_RINGS = 4;
const CENTER_SIZE = 3;

export const getMazeLevelConfig = (level) => {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  const rings = Math.min(MAX_RINGS, STARTING_RINGS + safeLevel - 1);
  const size = CENTER_SIZE + rings * 2;

  return {
    level: safeLevel,
    rings,
    width: size,
    height: size,
    dynamicGateways: safeLevel >= 6,
  };
};

const createCells = (width, height) =>
  Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_value, x) => ({
      x,
      y,
      open: {
        north: false,
        east: false,
        south: false,
        west: false,
      },
    })),
  );

const getDirectionBetween = (a, b) => DIRECTIONS.find((direction) => a.x + direction.dx === b.x && a.y + direction.dy === b.y);

const openPassage = (cells, a, direction) => {
  const source = cells[a.y]?.[a.x];
  const target = cells[a.y + direction.dy]?.[a.x + direction.dx];
  if (!source || !target) return false;

  source.open[direction.name] = true;
  target.open[direction.opposite] = true;
  return true;
};

const closePassage = (cells, a, direction) => {
  const source = cells[a.y]?.[a.x];
  const target = cells[a.y + direction.dy]?.[a.x + direction.dx];
  if (!source || !target) return false;

  source.open[direction.name] = false;
  target.open[direction.opposite] = false;
  return true;
};

const carveSpanningMaze = ({ cells, start, rng }) => {
  const visited = new Set([getCellKey(start)]);
  const stack = [start];

  while (stack.length) {
    const current = stack[stack.length - 1];
    const nextDirection = shuffle(DIRECTIONS, rng).find((direction) => {
      const next = {
        x: current.x + direction.dx,
        y: current.y + direction.dy,
      };
      return cells[next.y]?.[next.x] && !visited.has(getCellKey(next));
    });

    if (!nextDirection) {
      stack.pop();
      continue;
    }

    const next = {
      x: current.x + nextDirection.dx,
      y: current.y + nextDirection.dy,
    };

    openPassage(cells, current, nextDirection);
    visited.add(getCellKey(next));
    stack.push(next);
  }
};

const openCentralSpawnArea = (cells, centerBounds) => {
  for (let y = centerBounds.minY; y <= centerBounds.maxY; y += 1) {
    for (let x = centerBounds.minX; x <= centerBounds.maxX; x += 1) {
      DIRECTIONS.forEach((direction) => {
        const next = {
          x: x + direction.dx,
          y: y + direction.dy,
        };

        if (
          next.x >= centerBounds.minX &&
          next.x <= centerBounds.maxX &&
          next.y >= centerBounds.minY &&
          next.y <= centerBounds.maxY
        ) {
          openPassage(cells, { x, y }, direction);
        }
      });
    }
  }
};

const countEdges = (maze) => {
  let edges = 0;

  maze.cells.forEach((row) => {
    row.forEach((cell) => {
      if (cell.open.east) edges += 1;
      if (cell.open.south) edges += 1;
    });
  });

  return edges;
};

const collectClosedInternalEdges = (cells) => {
  const edges = [];

  cells.forEach((row) => {
    row.forEach((cell) => {
      DIRECTIONS.filter((direction) => direction.name === 'east' || direction.name === 'south').forEach((direction) => {
        const target = cells[cell.y + direction.dy]?.[cell.x + direction.dx];
        if (target && !cell.open[direction.name]) {
          edges.push({
            a: { x: cell.x, y: cell.y },
            b: { x: target.x, y: target.y },
            direction: direction.name,
          });
        }
      });
    });
  });

  return edges;
};

const getDeadEnds = (maze) => {
  const deadEnds = [];

  maze.cells.forEach((row) => {
    row.forEach((cell) => {
      if (getNeighbors(maze, cell).length === 1) {
        deadEnds.push({ x: cell.x, y: cell.y });
      }
    });
  });

  return deadEnds;
};

const braidMaze = ({ maze, rng }) => {
  const targetLoops = Math.max(4, Math.floor((maze.width * maze.height) * 0.1));
  const minimumDeadEnds = Math.max(6, Math.floor((maze.width * maze.height) * 0.06));
  const addedEdges = [];

  for (const edge of shuffle(collectClosedInternalEdges(maze.cells), rng)) {
    if (addedEdges.length >= targetLoops) break;

    const direction = DIRECTIONS.find((item) => item.name === edge.direction);
    openPassage(maze.cells, edge.a, direction);

    if (getDeadEnds(maze).length < minimumDeadEnds) {
      closePassage(maze.cells, edge.a, direction);
      continue;
    }

    addedEdges.push({
      ...edge,
      id: `gate-${addedEdges.length + 1}`,
      open: true,
      warning: false,
    });
  }

  return addedEdges;
};

const chooseExit = ({ maze, rng }) => {
  const candidates = [];

  for (let x = 1; x < maze.width - 1; x += 1) {
    candidates.push({ cell: { x, y: 0 }, direction: 'north' });
    candidates.push({ cell: { x, y: maze.height - 1 }, direction: 'south' });
  }

  for (let y = 1; y < maze.height - 1; y += 1) {
    candidates.push({ cell: { x: 0, y }, direction: 'west' });
    candidates.push({ cell: { x: maze.width - 1, y }, direction: 'east' });
  }

  return {
    ...chooseRandom(candidates, rng),
    id: 'maze-exit',
  };
};

const openExteriorExit = (maze, exit) => {
  const cell = getCell(maze, exit.cell);
  if (cell) cell.open[exit.direction] = true;
};

const isInsideCenter = (cell, centerBounds) =>
  cell.x >= centerBounds.minX && cell.x <= centerBounds.maxX && cell.y >= centerBounds.minY && cell.y <= centerBounds.maxY;

const placeCollectibles = ({ maze, rng }) => {
  const targetCount = Math.min(28, Math.max(6, Math.floor(maze.width * maze.height * 0.055)));
  const exitKey = getCellKey(maze.exit.cell);
  const deadEndKeys = new Set(maze.deadEnds.map(getCellKey));
  const candidates = [];

  maze.cells.forEach((row) => {
    row.forEach((cell) => {
      const key = getCellKey(cell);
      if (key === exitKey || isInsideCenter(cell, maze.centerBounds)) return;

      candidates.push({
        x: cell.x,
        y: cell.y,
        weight: deadEndKeys.has(key) ? 3 : 1,
      });
    });
  });

  const collectibles = [];
  const used = new Set();

  for (const candidate of shuffle(candidates, rng)) {
    if (collectibles.length >= targetCount) break;
    const key = getCellKey(candidate);
    if (used.has(key)) continue;

    used.add(key);
    collectibles.push({
      id: `collectible-${collectibles.length + 1}`,
      x: candidate.x,
      y: candidate.y,
      collected: false,
    });
  }

  return collectibles;
};

const selectDynamicGateways = ({ maze, braidedEdges, level }) => {
  if (level < 6) return [];

  const count = Math.min(8, Math.max(2, Math.floor(level / 3)));
  return braidedEdges.slice(0, count).map((edge, index) => ({
    id: `gateway-${index + 1}`,
    a: edge.a,
    b: edge.b,
    direction: edge.direction,
    open: true,
    warning: false,
  }));
};

export const getAccessibleCellKeys = (maze, start) => {
  const queue = [start];
  const visited = new Set([getCellKey(start)]);

  while (queue.length) {
    const current = queue.shift();
    getNeighbors(maze, current).forEach((neighbor) => {
      const key = getCellKey(neighbor);
      if (visited.has(key)) return;

      visited.add(key);
      queue.push(neighbor);
    });
  }

  return visited;
};

export const hasMazeLoops = (maze) => countEdges(maze) > maze.width * maze.height - 1;

export const isBoundaryExit = (maze, exit) => {
  if (!exit?.cell) return false;

  const { x, y } = exit.cell;
  return (
    (exit.direction === 'north' && y === 0) ||
    (exit.direction === 'south' && y === maze.height - 1) ||
    (exit.direction === 'west' && x === 0) ||
    (exit.direction === 'east' && x === maze.width - 1)
  );
};

export const getExteriorOpenings = (maze) => {
  const openings = [];

  for (let x = 0; x < maze.width; x += 1) {
    if (maze.cells[0]?.[x]?.open.north) openings.push({ id: 'maze-exit', cell: { x, y: 0 }, direction: 'north' });
    if (maze.cells[maze.height - 1]?.[x]?.open.south) {
      openings.push({ id: 'maze-exit', cell: { x, y: maze.height - 1 }, direction: 'south' });
    }
  }

  for (let y = 0; y < maze.height; y += 1) {
    if (maze.cells[y]?.[0]?.open.west) openings.push({ id: 'maze-exit', cell: { x: 0, y }, direction: 'west' });
    if (maze.cells[y]?.[maze.width - 1]?.open.east) {
      openings.push({ id: 'maze-exit', cell: { x: maze.width - 1, y }, direction: 'east' });
    }
  }

  return openings;
};

export const isGatewayInternal = (maze, gateway) =>
  gateway.a.x > 0 &&
  gateway.a.x < maze.width - 1 &&
  gateway.a.y > 0 &&
  gateway.a.y < maze.height - 1 &&
  gateway.b.x > 0 &&
  gateway.b.x < maze.width - 1 &&
  gateway.b.y > 0 &&
  gateway.b.y < maze.height - 1;

const cloneMaze = (maze) => ({
  ...maze,
  playerStart: { ...maze.playerStart },
  exit: {
    ...maze.exit,
    cell: { ...maze.exit.cell },
  },
  centerBounds: { ...maze.centerBounds },
  cells: maze.cells.map((row) =>
    row.map((cell) => ({
      x: cell.x,
      y: cell.y,
      open: { ...cell.open },
    })),
  ),
  deadEnds: maze.deadEnds.map((cell) => ({ ...cell })),
  collectibles: maze.collectibles.map((collectible) => ({ ...collectible })),
  dynamicGateways: maze.dynamicGateways.map((gateway) => ({
    ...gateway,
    a: { ...gateway.a },
    b: { ...gateway.b },
  })),
});

export const setGatewayOpen = (maze, gatewayId, isOpen, warning = false) => {
  const nextMaze = cloneMaze(maze);
  const gateway = nextMaze.dynamicGateways.find((item) => item.id === gatewayId);
  if (!gateway) return nextMaze;

  const direction = DIRECTIONS.find((item) => item.name === gateway.direction) ?? getDirectionBetween(gateway.a, gateway.b);
  if (!direction) return nextMaze;

  if (isOpen) {
    openPassage(nextMaze.cells, gateway.a, direction);
  } else {
    closePassage(nextMaze.cells, gateway.a, direction);
  }

  gateway.open = Boolean(isOpen);
  gateway.warning = Boolean(warning);
  nextMaze.deadEnds = getDeadEnds(nextMaze);

  return nextMaze;
};

export const markGatewayWarning = (maze, gatewayId, warning = true) => {
  const nextMaze = cloneMaze(maze);
  const gateway = nextMaze.dynamicGateways.find((item) => item.id === gatewayId);
  if (gateway) gateway.warning = Boolean(warning);
  return nextMaze;
};

export const canToggleGateway = (maze, gatewayId, entities = {}) => {
  const gateway = maze.dynamicGateways.find((item) => item.id === gatewayId);
  if (!gateway) return false;

  const occupied = [entities.player, ...(entities.monsters || [])].filter(Boolean).map(getCellKey);
  if (occupied.includes(getCellKey(gateway.a)) || occupied.includes(getCellKey(gateway.b))) return false;

  if (!gateway.open) return true;

  const closedMaze = setGatewayOpen(maze, gatewayId, false);
  return findPath(closedMaze, closedMaze.playerStart, closedMaze.exit.cell).length > 0;
};

export const getCellRing = (cell, centerBounds) => {
  const dx = cell.x < centerBounds.minX ? centerBounds.minX - cell.x : cell.x > centerBounds.maxX ? cell.x - centerBounds.maxX : 0;
  const dy = cell.y < centerBounds.minY ? centerBounds.minY - cell.y : cell.y > centerBounds.maxY ? cell.y - centerBounds.maxY : 0;
  return Math.max(dx, dy);
};

export const generateMaze = ({ level = 1, seed = Date.now() } = {}) => {
  const config = getMazeLevelConfig(level);
  const rng = createSeededRandom(`${seed}:${config.level}`);
  const cells = createCells(config.width, config.height);
  const center = Math.floor(config.width / 2);
  const playerStart = { x: center, y: center };
  const centerBounds = {
    minX: center - 1,
    maxX: center + 1,
    minY: center - 1,
    maxY: center + 1,
  };

  carveSpanningMaze({ cells, start: playerStart, rng });
  openCentralSpawnArea(cells, centerBounds);

  const maze = {
    level: config.level,
    rings: config.rings,
    width: config.width,
    height: config.height,
    centerBounds,
    playerStart,
    cells,
    exit: null,
    deadEnds: [],
    collectibles: [],
    dynamicGateways: [],
  };

  const braidedEdges = braidMaze({ maze, rng });
  maze.exit = chooseExit({ maze, rng });
  openExteriorExit(maze, maze.exit);
  maze.deadEnds = getDeadEnds(maze);
  maze.collectibles = placeCollectibles({ maze, rng });
  maze.dynamicGateways = selectDynamicGateways({ maze, braidedEdges, level: config.level }).filter((gateway) => {
    const closedMaze = {
      ...maze,
      dynamicGateways: [{ ...gateway, open: true }],
    };
    return isGatewayInternal(maze, gateway) && findPath(setGatewayOpen(closedMaze, gateway.id, false), maze.playerStart, maze.exit.cell).length > 0;
  });

  if (!getCell(maze, maze.exit.cell) || !findPath(maze, maze.playerStart, maze.exit.cell).length) {
    throw new Error('Generated maze is not solvable.');
  }

  return maze;
};
