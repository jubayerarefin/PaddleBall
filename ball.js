class Ball {
  constructor(canvasWidth, canvasHeight, soundManager) {
    this.radius = 8;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.speed = 4;
    this.sound = soundManager;
    this.reset();
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight - 50;
    this.dx = 0;
    this.dy = 0;
    this.angle = -Math.PI / 4;
    this.stuck = true;
    this.stuckOffsetX = 0;
  }

  stickToPaddle(paddle) {
    this.stuck = true;
    this.x = paddle.x + paddle.width / 2;
    this.y = paddle.y - this.radius;
  }

  launch() {
    this.stuck = false;
    this.angle = -Math.PI / 4 - Math.random() * Math.PI / 4;
    this.dx = this.speed * Math.cos(this.angle);
    this.dy = this.speed * Math.sin(this.angle);
  }

  update(paddle, keys) {
    if (this.stuck) {
      this.stickToPaddle(paddle);
      if ((keys[' '] || keys['Enter']) && !this._spacePressed) {
        this.launch();
        this._spacePressed = true;
      }
      if (!keys[' '] && !keys['Enter']) this._spacePressed = false;
      return;
    }

    this.x += this.dx;
    this.y += this.dy;

    // Wall collisions
    if (this.x - this.radius <= 0) {
      this.dx = Math.abs(this.dx);
      this.x = this.radius;
    }
    if (this.x + this.radius >= this.canvasWidth) {
      this.dx = -Math.abs(this.dx);
      this.x = this.canvasWidth - this.radius;
    }
    if (this.y - this.radius <= 0) {
      this.dy = Math.abs(this.dy);
      this.y = this.radius;
    }

    // Bottom - lose ball
    if (this.y + this.radius >= this.canvasHeight) {
      return 'lost';
    }

    // Paddle collision
    if (this.dy > 0 &&
        this.y + this.radius >= paddle.y &&
        this.y + this.radius <= paddle.y + paddle.height &&
        this.x >= paddle.x &&
        this.x <= paddle.x + paddle.width) {
      
      let hitPos = (this.x - paddle.x) / paddle.width;
      let angle = (hitPos - 0.5) * Math.PI * 0.7;
      this.angle = -Math.PI / 2 + angle;
      let spd = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      this.dx = spd * Math.cos(this.angle);
      this.dy = spd * Math.sin(this.angle);
      this.y = paddle.y - this.radius;
      try { this.sound.play('hit'); } catch(e) {}

      return 'bounced';
    }

    return null;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }
}
