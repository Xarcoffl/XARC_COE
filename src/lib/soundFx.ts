'use client';

class SoundFxEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private listeners: ((enabled: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arvr_spatial_sound');
      this.isEnabled = stored !== null ? stored === 'true' : true;
    }
  }

  private initCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('arvr_spatial_sound', enabled ? 'true' : 'false');
    }
    this.listeners.forEach((l) => l(enabled));
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled);
    if (this.isEnabled) {
      this.playHoloActivate();
    }
    return this.isEnabled;
  }

  public subscribe(fn: (enabled: boolean) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  // 1. Subtle spatial UI hover blip (VisionOS style soft sine chirp)
  public playSpatialHover() {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // AudioContext policy catch
    }
  }

  // 2. High-precision cyber tactile click
  public playSpatialClick() {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.055);
    } catch {
      // AudioContext policy catch
    }
  }

  // 3. Hologram / 3D Activation chime
  public playHoloActivate() {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.04);

        gain.gain.setValueAtTime(0.03, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.04 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.2);
      });
    } catch {
      // AudioContext policy catch
    }
  }

  // 4. Mode switcher warp sound (2D <-> 3D or Wireframe toggle)
  public playModeSwitch() {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      // Lowpass filter for smooth warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.085);
    } catch {
      // AudioContext policy catch
    }
  }

  // 5. Success Chime for form submissions
  public playSuccessChime() {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880]; // A major
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.035, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.06 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.3);
      });
    } catch {
      // AudioContext policy catch
    }
  }

  // 6. 3D Positional Audio Spatializer with HRTF Panning
  public playSpatialPanned(x: number, y: number, z: number = 0) {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createPanner();

      panner.panningModel = 'HRTF';
      panner.distanceModel = 'exponential';
      panner.positionX.setValueAtTime(Math.max(-5, Math.min(5, x)), ctx.currentTime);
      panner.positionY.setValueAtTime(Math.max(-5, Math.min(5, y)), ctx.currentTime);
      panner.positionZ.setValueAtTime(Math.max(-5, Math.min(5, z)), ctx.currentTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.045);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      this.playSpatialHover();
    }
  }
}

export const soundFx = new SoundFxEngine();
