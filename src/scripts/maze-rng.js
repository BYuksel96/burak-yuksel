const hashSeed = (seed) => {
  const text = String(seed || 'burak-os-maze');
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const createSeededRandom = (seed = Date.now()) => {
  let state = hashSeed(seed);

  return () => {
    state = Math.imul(state + 0x6d2b79f5, 1);
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomInt = (rng, max) => Math.floor(rng() * max);

export const shuffle = (items, rng) => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(rng, index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

export const chooseRandom = (items, rng) => {
  if (!items.length) return null;
  return items[randomInt(rng, items.length)];
};
