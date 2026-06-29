import { DIRECTIONS, getCell, isSameCell } from './maze-pathfinding.js';

const directionVectors = Object.fromEntries(DIRECTIONS.map((direction) => [direction.name, direction]));
const VIEWPORT_MARGIN_TILES = 2;

export const getExitIndicatorAlpha = ({ timeMs = 0, reducedMotion = false } = {}) => {
  if (reducedMotion) return 1;

  return Math.floor(timeMs / 460) % 2 === 0 ? 1 : 0.58;
};

const drawDoorwayMarker = (ctx, { x, y, tile, direction }) => {
  const left = x + tile * 0.24;
  const right = x + tile * 0.76;
  const top = y + tile * 0.24;
  const bottom = y + tile * 0.76;
  const depth = tile * 0.58;

  ctx.beginPath();

  if (direction === 'north') {
    ctx.moveTo(left, y - tile * 0.08);
    ctx.lineTo(left, y - depth);
    ctx.lineTo(right, y - depth);
    ctx.lineTo(right, y - tile * 0.08);
  } else if (direction === 'south') {
    ctx.moveTo(left, y + tile + tile * 0.08);
    ctx.lineTo(left, y + tile + depth);
    ctx.lineTo(right, y + tile + depth);
    ctx.lineTo(right, y + tile + tile * 0.08);
  } else if (direction === 'west') {
    ctx.moveTo(x - tile * 0.08, top);
    ctx.lineTo(x - depth, top);
    ctx.lineTo(x - depth, bottom);
    ctx.lineTo(x - tile * 0.08, bottom);
  } else {
    ctx.moveTo(x + tile + tile * 0.08, top);
    ctx.lineTo(x + tile + depth, top);
    ctx.lineTo(x + tile + depth, bottom);
    ctx.lineTo(x + tile + tile * 0.08, bottom);
  }

  ctx.stroke();
};

export const drawExitIndicator = (ctx, { exit, tile, lineWidth, timeMs = 0, reducedMotion = false }) => {
  if (!exit?.cell) return;

  const x = exit.cell.x * tile;
  const y = exit.cell.y * tile;
  const alpha = getExitIndicatorAlpha({ timeMs, reducedMotion });

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = '#f7f7f7';
  ctx.lineWidth = Math.max(2, lineWidth);
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  drawDoorwayMarker(ctx, { x, y, tile, direction: exit.direction });
  ctx.restore();
};

export const calculateViewport = ({ canvasWidth, canvasHeight, maze, player }) => {
  const hudSpace = 0;
  const marginSize = VIEWPORT_MARGIN_TILES * 2;
  const maxTileForFit = Math.floor(Math.min(canvasWidth / (maze.width + marginSize), (canvasHeight - hudSpace) / (maze.height + marginSize)));
  const tile = Math.max(6, Math.min(26, maxTileForFit || 6));
  const viewColumns = Math.max(9, Math.floor(canvasWidth / tile) - marginSize);
  const viewRows = Math.max(9, Math.floor((canvasHeight - hudSpace) / tile) - marginSize);
  const cameraX = Math.min(Math.max(0, player.x - Math.floor(viewColumns / 2)), Math.max(0, maze.width - viewColumns));
  const cameraY = Math.min(Math.max(0, player.y - Math.floor(viewRows / 2)), Math.max(0, maze.height - viewRows));

  return {
    tile,
    cameraX: maze.width <= viewColumns ? 0 : cameraX,
    cameraY: maze.height <= viewRows ? 0 : cameraY,
    offsetX: maze.width <= viewColumns ? Math.floor((canvasWidth - maze.width * tile) / 2) : VIEWPORT_MARGIN_TILES * tile,
    offsetY: maze.height <= viewRows ? Math.floor((canvasHeight - maze.height * tile) / 2) : VIEWPORT_MARGIN_TILES * tile,
    viewColumns,
    viewRows,
  };
};

export const drawMazeScene = (ctx, state) => {
  const { canvas, maze, player, monsters = [], collectedKeys = new Set(), timeMs = 0, reducedMotion = false } = state;
  if (!ctx || !canvas || !maze || !player) return;

  const viewport = calculateViewport({
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    maze,
    player,
  });
  const { tile, cameraX, cameraY, offsetX, offsetY, viewColumns, viewRows } = viewport;
  const lineWidth = Math.max(2, Math.floor(tile * 0.12));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(offsetX - cameraX * tile, offsetY - cameraY * tile);
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'square';
  ctx.strokeStyle = '#f7f7f7';

  const minX = Math.max(0, cameraX - 1);
  const minY = Math.max(0, cameraY - 1);
  const maxX = Math.min(maze.width - 1, cameraX + viewColumns + 1);
  const maxY = Math.min(maze.height - 1, cameraY + viewRows + 1);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const cell = getCell(maze, { x, y });
      const px = x * tile;
      const py = y * tile;

      ctx.beginPath();
      if (!cell.open.north) {
        ctx.moveTo(px, py);
        ctx.lineTo(px + tile, py);
      }
      if (!cell.open.east) {
        ctx.moveTo(px + tile, py);
        ctx.lineTo(px + tile, py + tile);
      }
      if (!cell.open.south) {
        ctx.moveTo(px, py + tile);
        ctx.lineTo(px + tile, py + tile);
      }
      if (!cell.open.west) {
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + tile);
      }
      ctx.stroke();
    }
  }

  drawExitIndicator(ctx, {
    exit: maze.exit,
    tile,
    lineWidth: Math.max(lineWidth + 1, 3),
    timeMs,
    reducedMotion,
  });

  maze.dynamicGateways.forEach((gateway) => {
    if (!gateway.warning) return;

    const direction = directionVectors[gateway.direction];
    if (!direction) return;

    const px = gateway.a.x * tile;
    const py = gateway.a.y * tile;
    ctx.strokeStyle = '#f7f7f7';
    ctx.lineWidth = Math.max(lineWidth + 2, 4);
    ctx.setLineDash([tile * 0.18, tile * 0.12]);
    ctx.beginPath();
    if (direction.name === 'east') {
      ctx.moveTo(px + tile, py);
      ctx.lineTo(px + tile, py + tile);
    } else if (direction.name === 'south') {
      ctx.moveTo(px, py + tile);
      ctx.lineTo(px + tile, py + tile);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  });

  ctx.fillStyle = '#f7f7f7';
  maze.collectibles.forEach((collectible) => {
    if (collectedKeys.has(`${collectible.x},${collectible.y}`)) return;
    ctx.fillRect(
      collectible.x * tile + tile * 0.38,
      collectible.y * tile + tile * 0.38,
      Math.max(3, tile * 0.24),
      Math.max(3, tile * 0.24),
    );
  });

  ctx.fillStyle = '#f7f7f7';
  ctx.fillRect(player.x * tile + tile * 0.24, player.y * tile + tile * 0.24, tile * 0.52, tile * 0.52);

  monsters.forEach((monster) => {
    if (isSameCell(monster.cell, player)) return;
    ctx.fillStyle = '#050505';
    ctx.fillRect(monster.cell.x * tile + tile * 0.18, monster.cell.y * tile + tile * 0.18, tile * 0.64, tile * 0.64);
    ctx.strokeStyle = '#f7f7f7';
    ctx.lineWidth = Math.max(2, lineWidth);
    ctx.strokeRect(monster.cell.x * tile + tile * 0.18, monster.cell.y * tile + tile * 0.18, tile * 0.64, tile * 0.64);
  });

  ctx.restore();
};
