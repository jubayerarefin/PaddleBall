class SoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  play(type) {
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch(type) {
        case 'hit':
          osc.type = 'sine';
          osc.frequency.value = 400;
          gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.08);
          break;
        case 'break':
          osc.type = 'square';
          osc.frequency.setValueAtTime(600, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.15);
          break;
        case 'powerup':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.12);
          break;
        case 'lose':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.4);
          break;
        case 'win':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, this.ctx.currentTime);
          osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, this.ctx.currentTime + 0.2);
          osc.frequency.setValueAtTime(1047, this.ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.5);
          break;
      }
    } catch(e) {}
  }
}
