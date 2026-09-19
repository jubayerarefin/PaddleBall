class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.width = 80;
    this.height = 15;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - 30;
    this.speed = 6;
    this.dx = 0;
    this.mouseControlled = false;
  }

  update(keys, canvasWidth, mouseX) {
    if (this.mouseControlled) {
      // Center paddle on mouse X
      this.x = mouseX - this.width / 2;
      if (this.x < 0) this.x = 0;
      if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
    } else {
      this.dx = 0;
      if (keys['ArrowLeft']) this.dx = -this.speed;
      if (keys['ArrowRight']) this.dx = this.speed;
      this.x += this.dx;

      // Clamp to canvas
      if (this.x < 0) this.x = 0;
      if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#00c8ff';
    ctx.shadowColor = '#00c8ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}
