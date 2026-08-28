class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 4 + 2;
    this.dx = (Math.random() - 0.5) * 6;
    this.dy = (Math.random() - 0.5) * 6;
    this.life = 1;
    this.decay = 0.02 + Math.random() * 0.03;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.dy += 0.1;
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

class ParticleManager {
  constructor() {
    this.particles = [];
  }

  emit(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update() {
    this.particles = this.particles.filter(p => {
      p.update();
      return p.life > 0;
    });
  }

  draw(ctx) {
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }
}
