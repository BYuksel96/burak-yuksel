import { getMonsterProfile } from './maze-state.js';

export const DIRECTIONS = [
  { name: 'north', opposite: 'south', dx: 0, dy: -1 },
  { name: 'east', opposite: 'west', dx: 1, dy: 0 },
  { name: 'south', opposite: 'north', dx: 0, dy: 1 },
  { name: 'west', opposite: 'east', dx: -1, dy: 0 },
];

export const getCellKey = (cell) => `${cell.x},${cell.y}`;

export const getCell = (maze, cell) => maze?.cells?.[cell.y]?.[cell.x] ?? null;

export const isSameCell = (a, b) => Boolean(a && b && a.x === b.x && a.y === b.y);

export const manhattanDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const getOpenDirection = (maze, cell, direction) => {
  const source = getCell(maze, cell);
  if (!source?.open?.[direction.name]) return null;

  const next = {
    x: cell.x + direction.dx,
    y: cell.y + direction.dy,
  };

  return getCell(maze, next) ? next : null;
};

export const getNeighbors = (maze, cell) =>
  DIRECTIONS.map((direction) => getOpenDirection(maze, cell, direction)).filter(Boolean);

export const findPath = (maze, start, goal) => {
  if (!getCell(maze, start) || !getCell(maze, goal)) return [];

  const startKey = getCellKey(start);
  const goalKey = getCellKey(goal);
  const queue = [start];
  const parents = new Map([[startKey, null]]);

  while (queue.length) {
    const current = queue.shift();
    const currentKey = getCellKey(current);

    if (currentKey === goalKey) {
      const path = [];
      let key = currentKey;

      while (key) {
        const [x, y] = key.split(',').map(Number);
        path.push({ x, y });
        key = parents.get(key);
      }

      return path.reverse();
    }

    getNeighbors(maze, current).forEach((neighbor) => {
      const neighborKey = getCellKey(neighbor);
      if (parents.has(neighborKey)) return;

      parents.set(neighborKey, currentKey);
      queue.push(neighbor);
    });
  }

  return [];
};

export const createMonsterMemory = () => ({
  recentCells: [],
  deadEnds: new Set(),
});

const rememberMonsterCell = (memory, cell, isDeadEnd = false) => {
  if (!memory) return;

  const key = getCellKey(cell);
  memory.recentCells = [key, ...(memory.recentCells || []).filter((item) => item !== key)].slice(0, 16);

  if (isDeadEnd) {
    memory.deadEnds?.add?.(key);
  }
};

const weightedPick = (items, rng) => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rng() * total;

  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }

  return items[items.length - 1] ?? null;
};

const scoreMonsterOption = ({ maze, option, player, monster, profile }) => {
  const distance = manhattanDistance(option, player);
  const previousPenalty = isSameCell(option, monster.previousCell) ? 1.4 : 0;
  const recentPenalty = monster.memory?.recentCells?.includes(getCellKey(option)) ? profile.memoryWeight : 0;
  const deadEndPenalty = monster.memory?.deadEnds?.has(getCellKey(option)) ? profile.memoryWeight * 2 : 0;
  const degree = getNeighbors(maze, option).length;
  const deadEndScore = degree <= 1 ? 0.9 : 0;

  return distance + previousPenalty + recentPenalty + deadEndPenalty + deadEndScore;
};

export const chooseMonsterMove = ({ maze, monster, player, level, rng = Math.random, reservedCells = [] }) => {
  const profile = getMonsterProfile(level);
  const neighbors = getNeighbors(maze, monster.cell).filter(
    (neighbor) => !reservedCells.some((reserved) => isSameCell(reserved, neighbor)),
  );

  if (!neighbors.length) {
    return {
      nextCell: monster.cell,
      reason: 'stuck',
    };
  }

  const route = profile.routeLookahead > 0 ? findPath(maze, monster.cell, player) : [];
  const routeNext = route[1];
  const scored = neighbors
    .map((neighbor) => ({
      cell: neighbor,
      score: scoreMonsterOption({ maze, option: neighbor, player, monster, profile }),
    }))
    .sort((a, b) => a.score - b.score);

  const best = scored[0];
  const nonBest = scored.filter((option) => !isSameCell(option.cell, best.cell));
  const canMistake = nonBest.length > 0 && rng() < profile.mistakeChance;

  if (canMistake) {
    const mistake = weightedPick(
      nonBest.map((option) => ({
        cell: option.cell,
        weight: Math.max(0.35, 1 / (option.score + 0.75)),
      })),
      rng,
    );
    rememberMonsterCell(monster.memory, mistake.cell, getNeighbors(maze, mistake.cell).length <= 1);
    return {
      nextCell: mistake.cell,
      reason: 'biased-mistake',
    };
  }

  if (routeNext && neighbors.some((neighbor) => isSameCell(neighbor, routeNext))) {
    rememberMonsterCell(monster.memory, routeNext, getNeighbors(maze, routeNext).length <= 1);
    return {
      nextCell: routeNext,
      reason: profile.strategy,
    };
  }

  const choice = weightedPick(
    scored.map((option) => ({
      cell: option.cell,
      weight: Math.max(0.5, 1 / (option.score + 0.5)),
    })),
    rng,
  );
  rememberMonsterCell(monster.memory, choice.cell, getNeighbors(maze, choice.cell).length <= 1);

  return {
    nextCell: choice.cell,
    reason: profile.strategy,
  };
};
