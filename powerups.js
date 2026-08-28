const POWERUP_TYPES = {
  EXPAND: { color: '#6bcb77', symbol: '>', label: 'EXPAND' },
  SHRINK: { color: '#ff6b6b', symbol: '<', label: 'SHRINK' },
  MULTI: { color: '#ffd93d', symbol: '*', label: 'MULTI' },
  SLOW: { color: '#4d96ff', symbol: 'S', label: 'SLOW' },
  LASER: { color: '#ff6b9d', symbol: '|', label: 'LASER' }
};

class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = type;
    this.dy = 2;
    this.active = true;
  }

  update() {
    this.y += this.dy;
    if (this.y > canvas.height) this.active = false;
  }

  draw(ctx) {
    const config = POWERUP_TYPES[this.type];
    ctx.fillStyle = config.color;
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(config.symbol, this.x + this.width / 2, this.y + 14);
  }
}

class PowerupManager {
  constructor() {
    this.powerups = [];
    this.activeEffects = [];
  }

  add(x, y, type) {
    this.powerups.push(new Powerup(x, y, type));
  }

  update(paddle) {
    for (const powerup of this.powerups) {
      powerup.update();

      if (powerup.active &&
          powerup.x < paddle.x + paddle.width &&
          powerup.x + powerup.width > paddle.x &&
          powerup.y < paddle.y + paddle.height &&
          powerup.y + powerup.height > paddle.y) {

        this.applyEffect(powerup.type, paddle);
        sound.play('powerup');
        powerup.active = false;
      }
    }

    this.powerups = this.powerups.filter(p => p.active);
  }

  applyEffect(type, paddle) {
    switch(type) {
      case 'EXPAND':
        paddle.width = Math.min(120, paddle.width + 20);
        break;
      case 'SHRINK':
        paddle.width = Math.max(40, paddle.width - 20);
        break;
      case 'MULTI':
        // Spawn 2 extra balls with slightly different angles
        if (balls.length < 5) {
          for (let i = 0; i < 2; i++) {
            const b = new Ball(canvas.width, canvas.height);
            b.stuck = false;
            b.angle = -Math.PI / 2 + (Math.random() - 0.5) * 1;
            b.dx = b.speed * Math.cos(b.angle);
            b.dy = b.speed * Math.sin(b.angle);
            b.x = paddle.x + paddle.width / 2 + (i === 0 ? -20 : 20);
            b.y = paddle.y - 10;
            balls.push(b);
          }
        }
        break;
      case 'SLOW':
        ball.speed = Math.max(2, ball.speed - 1);
        break;
      case 'LASER':
        hasLaser = true;
        laserTimer = 600; // 10 seconds at 60fps
        break;
    }
  }

  draw(ctx) {
    for (const powerup of this.powerups) {
      powerup.draw(ctx);
    }
  }
}
