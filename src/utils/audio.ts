// Custom Web Audio API Cartoon Sound Synthesizer for "My Second Asshole"
// Zero external asset dependencies - 100% reliable and instantaneous!

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Tactile button click
  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  // Straining push sound (comic low groan/pulse)
  playStrain(intensity: number = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    subOsc.type = 'sine';

    const baseFreq = 70 + intensity * 35;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq + (Math.random() * 20 - 10), now + 0.08);

    subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);

    gain.gain.setValueAtTime(0.1 + intensity * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    // Subtle low-pass filter to make it squishy rather than harsh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320 + intensity * 200, now);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.13);
    subOsc.stop(now + 0.13);
  }

  // Cute squishy emergence squeak
  playSqueak(pitch: number = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 300 * pitch;
    const endFreq = 650 * pitch;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.8, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  // High tension warning tick
  playTensionWarning() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // THE SNIP! Sharp scissor cut / clean pinch sound
  playSnip() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Metallic snip component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    // High frequency white-noise snip whoosh
    const bufferSize = ctx.sampleRate * 0.07;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2200, now);
    noiseFilter.Q.setValueAtTime(3, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.1);
    noise.stop(now + 0.08);
  }

  // Satisfying water splash / PLOP
  playPlop(sizeRatio: number = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Deep water body thump
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    const baseF = Math.max(70, 160 - sizeRatio * 40);
    osc1.frequency.setValueAtTime(baseF, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.25);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    // Water droplet bubble "bloop"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(300, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(800, now + 0.16);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.2, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.04);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.25);
  }

  // Sad premature break / rubber snap
  playSnapBreak() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Victory fanfare chords
  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25]; // C, E, G, C (Major Chord)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.18, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + idx * 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + 1.0);
    });
  }

  // Heavy thunk impact SFX on toilet bowl (porcelain ceramic clunk + visceral sub-bass splash)
  playHeavyThunk(sizeRatio: number = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const clampedRatio = Math.max(0.5, Math.min(3.0, sizeRatio));

    // 1. Sub-bass visceral room rumble (30Hz - 90Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

    const subVol = Math.min(0.7, 0.35 + clampedRatio * 0.15);
    subGain.gain.setValueAtTime(subVol, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // 2. Ceramic porcelain "THUNK" resonance (hollow porcelain thud)
    const thunkOsc = ctx.createOscillator();
    const thunkGain = ctx.createGain();
    thunkOsc.type = 'triangle';
    thunkOsc.frequency.setValueAtTime(190, now);
    thunkOsc.frequency.exponentialRampToValueAtTime(55, now + 0.14);

    thunkGain.gain.setValueAtTime(0.45, now);
    thunkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    thunkOsc.connect(thunkGain);
    thunkGain.connect(ctx.destination);
    thunkOsc.start(now);
    thunkOsc.stop(now + 0.18);

    // 3. Water body impact slap (filtered burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450 + clampedRatio * 200, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.25);

    // 4. Secondary water droplet ring
    const dropOsc = ctx.createOscillator();
    const dropGain = ctx.createGain();
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(260, now + 0.06);
    dropOsc.frequency.exponentialRampToValueAtTime(900, now + 0.18);

    dropGain.gain.setValueAtTime(0, now);
    dropGain.gain.setValueAtTime(0.2, now + 0.06);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    dropOsc.connect(dropGain);
    dropGain.connect(ctx.destination);
    dropOsc.start(now + 0.06);
    dropOsc.stop(now + 0.25);
  }

  // Cheek spread sound: rubbery elastic stretch + release whoosh
  playCheekSpread() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.1);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Quick snip razor pinch
  playQuickSnip() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // High velocity metallic snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2100, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Hilarious brassy cartoon fart boost sound (modulating saw + pressure squeal)
  playFartBoost() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Modulated rasp / rumble oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const baseFreq = 85 + Math.random() * 30;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + 0.1);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.38);

    // Filter to give it brassy bathroom acoustics
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(380, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // 2. High squeak flutter
    const squeak = ctx.createOscillator();
    const squeakGain = ctx.createGain();
    squeak.type = 'sine';
    squeak.frequency.setValueAtTime(320, now);
    squeak.frequency.exponentialRampToValueAtTime(140, now + 0.25);
    squeakGain.gain.setValueAtTime(0.2, now);
    squeakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    squeak.connect(squeakGain);
    squeakGain.connect(ctx.destination);

    osc.start(now);
    squeak.start(now);
    osc.stop(now + 0.42);
    squeak.stop(now + 0.3);
  }

  // Squish sound for bending soft-body segments
  playSquish() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Toilet flush with vortex rushing water and comical drain suction pop
  playFlush(withSuctionPop: boolean = true) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = withSuctionPop ? 2.2 : 1.5;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Resonant swirling low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(140, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);

    // Deep vortex whirlpool hum
    const swirlOsc = ctx.createOscillator();
    const swirlGain = ctx.createGain();
    swirlOsc.type = 'sine';
    swirlOsc.frequency.setValueAtTime(130, now);
    swirlOsc.frequency.linearRampToValueAtTime(85, now + 1.2);
    swirlOsc.frequency.exponentialRampToValueAtTime(40, now + duration);

    swirlGain.gain.setValueAtTime(0.22, now);
    swirlGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    swirlOsc.connect(swirlGain);
    swirlGain.connect(ctx.destination);
    swirlOsc.start(now);
    swirlOsc.stop(now + duration);

    // Final drain suction pop "SLURP!"
    if (withSuctionPop) {
      const popTime = now + 1.4;
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(650, popTime);
      popOsc.frequency.exponentialRampToValueAtTime(90, popTime + 0.16);

      popGain.gain.setValueAtTime(0, popTime);
      popGain.gain.setValueAtTime(0.35, popTime + 0.01);
      popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.2);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(popTime);
      popOsc.stop(popTime + 0.22);
    }
  }
}

// Haptic feedback trigger for tactile devices
export function triggerHaptic(pattern: number[] = [70, 40, 140, 50, 220, 60, 350]) {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Graceful fallback for environments without Vibration API
  }
}

export const sounds = new SoundEngine();
