export const DIRECTIONS_BY_KEY = {
  ArrowUp: { dx: 0, dy: -1, name: 'north' },
  w: { dx: 0, dy: -1, name: 'north' },
  W: { dx: 0, dy: -1, name: 'north' },
  ArrowRight: { dx: 1, dy: 0, name: 'east' },
  d: { dx: 1, dy: 0, name: 'east' },
  D: { dx: 1, dy: 0, name: 'east' },
  ArrowDown: { dx: 0, dy: 1, name: 'south' },
  s: { dx: 0, dy: 1, name: 'south' },
  S: { dx: 0, dy: 1, name: 'south' },
  ArrowLeft: { dx: -1, dy: 0, name: 'west' },
  a: { dx: -1, dy: 0, name: 'west' },
  A: { dx: -1, dy: 0, name: 'west' },
};

export const getDirectionFromKey = (key) => DIRECTIONS_BY_KEY[key] ?? null;

export const shouldCaptureMazeKey = ({ key, isActive, status }) =>
  Boolean(isActive && status === 'playing' && getDirectionFromKey(key));
