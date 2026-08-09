class UISoundSystem {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.mediaSource = null;
    this.initialized = false;
  }

  init() {
    if (!this.initialized) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 256;
          this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          this.initialized = true;
        }
      } catch (e) {
        console.warn('AudioContext init warning:', e);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  connectMediaElement(audioElement) {
    if (!this.initialized || !this.audioCtx) this.init();
    
    if (!this.mediaSource) {
      try {
        this.mediaSource = this.audioCtx.createMediaElementSource(audioElement);
        this.mediaSource.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      } catch (e) {
        // MediaElementSource already created
      }
    }
  }

  getFrequencyData() {
    if (!this.analyser || !this.dataArray) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  // A soft, delicate glassy "tink" for hovering over images
  playHoverTick() {
    if (!this.initialized || !this.audioCtx) return;
    
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = 'sine';
    // High frequency for a glassy sound
    osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.audioCtx.currentTime + 0.1);
    
    // Very short, sharp envelope
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  // A cinematic deep "whoosh/swell" for opening the envelope
  playCinematicWhoosh() {
    if (!this.initialized || !this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    // Sub-bass frequency swell
    osc.frequency.setValueAtTime(40, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 1.5);
    osc.frequency.exponentialRampToValueAtTime(20, this.audioCtx.currentTime + 3);

    // Filter sweep
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1000, this.audioCtx.currentTime + 1.5);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 3);

    // Volume swell (fade in and out)
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 3);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 3);
  }

  // Classic retro MSN message chime
  playIncomingMsg() {
    if (!this.initialized || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Soft pop sound for sending a message
  playOutgoingMsg() {
    if (!this.initialized || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Iconic retro MSN Nudge rumble chime
  playNudgeSound() {
    if (!this.initialized || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    // Vibrating low dual sine
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = 'square';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(180, now + 0.2);
    osc1.frequency.linearRampToValueAtTime(120, now + 0.4);

    osc2.frequency.setValueAtTime(155, now);
    osc2.frequency.linearRampToValueAtTime(185, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // Retro Win98 Error chord sound
  playErrorBeep() {
    if (!this.initialized || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(160, now);
    osc2.frequency.setValueAtTime(165, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Retro 90s capacitor flash whine sound
  playFlashWhine() {
    if (!this.initialized || !this.audioCtx) this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Mechanical camera shutter click sound
  playCameraShutter() {
    if (!this.initialized || !this.audioCtx) this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // Noise buffer for snap sound
    const bufferSize = this.audioCtx.sampleRate * 0.08;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Click tone
    const click = this.audioCtx.createOscillator();
    const clickGain = this.audioCtx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(300, now);
    click.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    click.connect(clickGain);
    clickGain.connect(this.audioCtx.destination);

    noise.start(now);
    click.start(now);
    click.stop(now + 0.04);
  }
}

export const uiSounds = new UISoundSystem();

