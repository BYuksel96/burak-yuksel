import { DIRECTIONS, getCell, isSameCell } from './maze-pathfinding.js';

const directionVectors = Object.fromEntries(DIRECTIONS.map((direction) => [direction.name, direction]));

const getExitLine = (cell, direction, tile, offsetX, offsetY) => {
  const x = offsetX + cell.x * tile;
  const y = offsetY + cell.y * tile;

  if (direction === 'north') return [x + tile * 0.2, y, x + tile * 0.8, y];
  if (direction === 'south') return [x + tile * 0.2, y + tile, x + tile * 0.8, y + tile];
  if (direction === 'west') return [x, y + tile * 0.2, x, y + tile * 0.8];
  return [x + tile, y + tile * 0.2, x + tile, y + tile * 0.8];
};

export const calculateViewport = ({ canvasWidth, canvasHeight, maze, player }) => {
  const hudSpace = 0;
  const maxTileForFit = Math.floor(Math.min(canvasWidth / maze.width, (canvasHeight - hudSpace) / maze.height));
  const tile = Math.max(6, Math.min(26, maxTileForFit || 6));
  const viewColumns = Math.max(9, Math.floor(canvasWidth / tile));
  const viewRows = Math.max(9, Math.floor((canvasHeight - hudSpace) / tile));
  const cameraX = Math.min(Math.max(0, player.x - Math.floor(viewColumns / 2)), Math.max(0, maze.width - viewColumns));
  const cameraY = Math.min(Math.max(0, player.y - Math.floor(viewRows / 2)), Math.max(0, maze.height - viewRows));

  return {
    tile,
    cameraX: maze.width <= viewColumns ? 0 : cameraX,
    cameraY: maze.height <= viewRows ? 0 : cameraY,
    offsetX: maze.width <= viewColumns ? Math.floor((canvasWidth - maze.width * tile) / 2) : 0,
    offsetY: maze.height <= viewRows ? Math.floor((canvasHeight - maze.height * tile) / 2) : 0,
    viewColumns,
    viewRows,
  };
};

export const drawMazeScene = (ctx, state) => {
  const { canvas, maze, player, monsters = [], collectedKeys = new Set() } = state;
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

  ctx.lineWidth = Math.max(lineWidth + 2, 4);
  ctx.strokeStyle = '#050505';
  ctx.beginPath();
  ctx.moveTo(...getExitLine(maze.exit.cell, maze.exit.direction, tile, 0, 0).slice(0, 2));
  ctx.lineTo(...getExitLine(maze.exit.cell, maze.exit.direction, tile, 0, 0).slice(2));
  ctx.stroke();
  ctx.strokeStyle = '#f7f7f7';
  ctx.lineWidth = Math.max(2, lineWidth);
  ctx.stroke();

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
