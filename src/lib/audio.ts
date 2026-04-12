/**
 * Web Audio API synthesised sound effects — no audio files required.
 * All functions are no-ops in environments without AudioContext (SSR).
 */

export function initAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

/** Short sine blip — plays on each negotiation message */
export function playBlip(ctx: AudioContext | null): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

/** Minor chord stab — plays on verdict reveal */
export function playChord(ctx: AudioContext | null): void {
  if (!ctx) return;
  const freqs = [220, 261, 329]; // A minor chord
  freqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  });
}

/** Cha-ching — plays on settlement */
export function playChaChing(ctx: AudioContext | null): void {
  if (!ctx) return;
  // Two quick high tones
  [0, 0.12].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(i === 0 ? 1200 : 1600, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.2);
  });
}

/** Subtle click — plays on button interactions */
export function playClick(ctx: AudioContext | null): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.04);
}
