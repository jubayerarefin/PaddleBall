class Brick {
  constructor(x, y, width, height, color, value, hits) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.value = value;
    this.hits = hits || 1;
    this.maxHits = this.hits;
    this.active = true;
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(this.x, this.y, this.width, 3);
    ctx.shadowBlur = 0;

    // Damage indicator for multi-hit bricks
    if (this.hits < this.maxHits) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  hit() {
    this.hits--;
    return this.hits <= 0;
  }

  collide(ball) {
    if (!this.active) return false;

    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    return ballRight > this.x && ballLeft < this.x + this.width &&
           ballBottom > this.y && ballTop < this.y + this.height;
  }
}

class LevelManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.bricks = [];
    this.boss = null;
  }

  createBrickGrid(level) {
    this.bricks = [];
    const cols = Math.min(8 + level, 14);
    const rows = Math.min(3 + Math.floor(level / 2), 8);
    const padding = 5;
    const brickWidth = (this.canvasWidth - padding * (cols + 1)) / cols;
    const brickHeight = 20;
    const startY = 60;

    const colors = [
      '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
      '#ff6b9d', '#c084fc', '#fb923c', '#22d3ee'
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = colors[(r + c) % colors.length];
        const value = rows - r;
        const hits = (level >= 3 && Math.random() < 0.3) ? 2 : 1;

        const brick = new Brick(
          padding + c * (brickWidth + padding),
          startY + r * (brickHeight + padding),
          brickWidth,
          brickHeight,
          color,
          value,
          hits
        );
        this.bricks.push(brick);
      }
    }
  }

  createBossLevel(level) {
    this.bricks = [];

    const bossWidth = 200;
    const bossHeight = 60;
    const bossX = (this.canvasWidth - bossWidth) / 2;
    const bossY = 80;

    this.boss = {
      x: bossX,
      y: bossY,
      width: bossWidth,
      height: bossHeight,
      hp: 20 + level * 5,
      maxHp: 20 + level * 5,
      dx: 2 + level * 0.5,
      active: true,
      color: '#ff0000'
    };

    // Decoy bricks
    for (let i = 0; i < 10; i++) {
      const bx = Math.random() * (this.canvasWidth - 100) + 50;
      const by = 150 + Math.random() * 200;
      this.bricks.push(new Brick(bx, by, 40, 20, '#4d96ff', 1, 1));
    }
  }

  updateBoss(ball) {
    if (!this.boss || !this.boss.active) return;

    // Boss follows ball horizontally with delay
    const targetX = ball.x - this.boss.width / 2;
    this.boss.x += (targetX - this.boss.x) * 0.05;

    // Clamp
    this.boss.x = Math.max(0, Math.min(this.canvasWidth - this.boss.width, this.boss.x));
  }

  bossCollide(ball) {
    if (!this.boss || !this.boss.active) return false;

    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    if (ballRight > this.boss.x && ballLeft < this.boss.x + this.boss.width &&
        ballBottom > this.boss.y && ballTop < this.boss.y + this.boss.height) {

      this.boss.hp--;

      // Sharp bounce angle
      let hitPos = (ball.x - this.boss.x) / this.boss.width;
      let angle = (hitPos - 0.5) * Math.PI * 0.5;
      ball.angle = -Math.PI / 2 + angle;
      let spd = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = spd * Math.cos(ball.angle);
      ball.dy = spd * Math.sin(ball.angle);
      ball.y = this.boss.y - ball.radius;

      if (this.boss.hp <= 0) {
        this.boss.active = false;
        score += 500;
      }

      return true;
    }
    return false;
  }

  drawBoss(ctx) {
    if (!this.boss || !this.boss.active) return;

    ctx.fillStyle = this.boss.color;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);
    ctx.shadowBlur = 0;

    // HP bar
    const barWidth = this.boss.width;
    const barHeight = 5;
    const barX = this.boss.x;
    const barY = this.boss.y - 10;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(barX, barY, barWidth * (this.boss.hp / this.boss.maxHp), barHeight);
  }

  draw(ctx) {
    for (const brick of this.bricks) {
      brick.draw(ctx);
    }
    this.drawBoss(ctx);
  }

  update(ball, powerupManager, particleManager, sound) {
    for (const brick of this.bricks) {
      if (brick.active && brick.collide(ball)) {
        const destroyed = brick.hit();
        if (destroyed) {
          brick.active = false;
          score += brick.value;
          particleManager.emit(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 15);
          sound.play('break');

          // 20% chance powerup
          if (Math.random() < 0.2) {
            const types = Object.keys(POWERUP_TYPES);
            const type = types[Math.floor(Math.random() * types.length)];
            powerupManager.add(brick.x + brick.width / 2, brick.y, type);
          }

          this.checkLevelComplete();
        }
        this.resolveCollision(brick, ball);
        break;
      }
    }

    this.updateBoss(ball);
    this.bossCollide(ball);
  }

  resolveCollision(brick, ball) {
    const ballCenterX = ball.x;
    const ballCenterY = ball.y;
    const brickCenterX = brick.x + brick.width / 2;
    const brickCenterY = brick.y + brick.height / 2;

    const overlapX = (brick.width / 2 + ball.radius) - Math.abs(ballCenterX - brickCenterX);
    const overlapY = (brick.height / 2 + ball.radius) - Math.abs(ballCenterY - brickCenterY);

    if (overlapX < overlapY) {
      ball.dx *= -1;
      ball.x += (ballCenterX < brickCenterX) ? -overlapX : overlapX;
    } else {
      ball.dy *= -1;
      ball.y += (ballCenterY < brickCenterY) ? -overlapY : overlapY;
    }
  }

  checkLevelComplete() {
    const allBricksDestroyed = this.bricks.every(b => !b.active);
    if (allBricksDestroyed && (!this.boss || !this.boss.active)) {
      return true;
    }
    return false;
  }

  loadLevel(level) {
    if (level % 5 === 0) {
      this.createBossLevel(level);
    } else {
      this.createBrickGrid(level);
      this.boss = null;
    }
  }
}
