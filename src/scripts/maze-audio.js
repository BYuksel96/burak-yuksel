const NOTE_FREQUENCIES = {
  C3: 130.81,
  E3: 164.81,
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392,
};

const MUSIC_PATTERN = [
  { note: 'C3', beats: 1 },
  { note: 'G3', beats: 1 },
  { note: 'C4', beats: 1 },
  { note: 'G3', beats: 1 },
  { note: 'E3', beats: 1 },
  { note: 'B3', beats: 1 },
  { note: 'D4', beats: 1 },
  { note: 'B3', beats: 1 },
  { note: 'A3', beats: 1 },
  { note: 'E4', beats: 1 },
  { note: 'G4', beats: 1 },
  { note: 'E4', beats: 1 },
  { note: null, beats: 1 },
  { note: 'G3', beats: 1 },
  { note: 'C4', beats: 1 },
  { note: 'D4', beats: 1 },
];

const STEP_SECONDS = 0.18;
const NOTE_VOLUME = 0.035;
const MASTER_VOLUME = 0.42;

export const formatMazeMusicToggleLabel = (enabled) => `MUSIC: ${enabled ? 'ON' : 'OFF'}`;

export const getMazeMusicLifecycleAction = ({ windowOpen, pageVisible }) => (!windowOpen || !pageVisible ? 'stop' : 'none');

const defaultSetTimeout = (...args) => globalThis.setTimeout?.(...args);
const defaultClearTimeout = (...args) => globalThis.clearTimeout?.(...args);

export const createMazeChiptunePlayer = ({
  AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext,
  setTimeout = defaultSetTimeout,
  clearTimeout = defaultClearTimeout,
} = {}) => {
  let audioContext = null;
  let masterGain = null;
  let timerId = 0;
  let stepIndex = 0;
  let sequenceId = 0;
  let playing = false;

  const ensureContext = () => {
    if (audioContext || typeof AudioContext !== 'function') return audioContext;

    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioContext.destination);

    return audioContext;
  };

  const fadeMasterTo = (value, duration = 0.04) => {
    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues?.(now);
    masterGain.gain.setValueAtTime?.(masterGain.gain.value ?? 0, now);
    masterGain.gain.linearRampToValueAtTime?.(value, now + duration);
  };

  const playNote = (step) => {
    if (!step?.note || !audioContext || !masterGain) return;

    const frequency = NOTE_FREQUENCIES[step.note];
    if (!frequency) return;

    const startTime = audioContext.currentTime + 0.012;
    const duration = Math.max(0.08, step.beats * STEP_SECONDS * 0.78);
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(NOTE_VOLUME, startTime + 0.018);
    noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.025);
  };

  const scheduleNext = (activeSequenceId) => {
    if (!playing || activeSequenceId !== sequenceId) return;

    const step = MUSIC_PATTERN[stepIndex % MUSIC_PATTERN.length];
    stepIndex += 1;
    playNote(step);

    timerId = setTimeout(() => scheduleNext(activeSequenceId), step.beats * STEP_SECONDS * 1000);
  };

  const clearScheduledLoop = () => {
    if (!timerId) return;

    clearTimeout(timerId);
    timerId = 0;
  };

  return {
    async start() {
      if (playing) return true;

      const context = ensureContext();
      if (!context) return false;

      try {
        if (context.state === 'suspended') {
          await context.resume();
        }
      } catch {
        return false;
      }

      playing = true;
      sequenceId += 1;
      fadeMasterTo(MASTER_VOLUME, 0.05);
      scheduleNext(sequenceId);
      return true;
    },
    stop() {
      if (!playing && !timerId) return;

      playing = false;
      sequenceId += 1;
      clearScheduledLoop();
      fadeMasterTo(0, 0.05);
    },
    isPlaying() {
      return playing;
    },
  };
};
