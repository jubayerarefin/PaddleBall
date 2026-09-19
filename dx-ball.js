// === DX BALL — Main Game Engine ===

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// === GLOBAL STATE ===
let gameState = 'start'; // 'start', 'playing', 'gameOver', 'levelComplete', 'victory'
let score = 0;
let lives = 3;
let currentLevel = 1;
let paddle;
let ball;
let balls = [];
let levelManager;
let powerupManager;
let particleManager;
let sound;
let hasLaser = false;
let laserTimer = 0;

// === INPUT ===
const keys = {};
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') e.preventDefault();
  keys[e.key] = true;
  if (e.key === ' ') {
    if (['start', 'gameOver', 'levelComplete', 'victory'].includes(gameState)) {
      handleScreenAction();
    } else if (gameState === 'playing' && ball && ball.stuck) {
      ball.launch();
    }
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// === MOUSE INPUT ===
let mouseX = canvas.width / 2;
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
});
canvas.addEventListener('mouseenter', () => {
  paddle.mouseControlled = true;
});
canvas.addEventListener('mouseleave', () => {
  paddle.mouseControlled = false;
});

// === TOUCH INPUT (Mobile) ===
let touchActive = false;
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchActive = true;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
  if (ball && ball.stuck) ball.launch();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
}, { passive: false });
canvas.addEventListener('touchend', () => {
  touchActive = false;
});

// === UI HELPERS ===
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  if (name === 'start') {
    document.getElementById('start-screen').classList.add('active');
  } else if (name === 'gameOver') {
    document.getElementById('game-over-screen').classList.add('active');
    addHighScoreMessage();
  } else if (name === 'levelComplete') {
    document.getElementById('level-complete-screen').classList.add('active');
  } else if (name === 'victory') {
    document.getElementById('victory-screen').classList.add('active');
  }
  gameState = name;
}

function updateHUD() {
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = currentLevel;
  document.getElementById('lives').textContent = lives;
}

function addHighScoreMessage() {
  const high = getHighScore();
  if (score >= high && score > 0) {
    let el = document.getElementById('highscore-msg');
    if (!el) {
      el = document.createElement('p');
      el.id = 'highscore-msg';
      el.style.cssText = 'color: #ffd93d; font-size: 22px; margin-top: 10px;';
      document.getElementById('game-over-screen').appendChild(el);
    }
    el.textContent = `High Score: ${high}`;
  }
}

function getHighScore() {
  return parseInt(localStorage.getItem('dxball_highscore') || '0');
}

function setHighScore(s) {
  const high = getHighScore();
  if (s > high) {
    localStorage.setItem('dxball_highscore', s);
  }
}

function handleScreenAction() {
  if (gameState === 'start') {
    startGame();
  } else if (gameState === 'gameOver') {
    startGame();
  } else if (gameState === 'levelComplete') {
    nextLevel();
  } else if (gameState === 'victory') {
    startGame();
  }
}

// === GAME FLOW ===
function startGame() {
  // Remove old highscore msg
  const oldMsg = document.getElementById('highscore-msg');
  if (oldMsg) oldMsg.remove();

  score = 0;
  lives = 3;
  currentLevel = 1;
  hasLaser = false;
  laserTimer = 0;

  paddle = new Paddle(canvas.width, canvas.height);
  ball = new Ball(canvas.width, canvas.height);
  ball.stickToPaddle(paddle);
  balls = [ball];

  levelManager = new LevelManager(canvas.width, canvas.height);
  levelManager.loadLevel(1);

  powerupManager = new PowerupManager();
  particleManager = new ParticleManager();
  sound = new SoundManager();

  updateHUD();
  showScreen('playing');
}

function nextLevel() {
  const oldMsg = document.getElementById('highscore-msg');
  if (oldMsg) oldMsg.remove();

  currentLevel++;

  if (currentLevel > 20) {
    // Victory
    setHighScore(score);
    sound.play('win');
    showScreen('victory');
    return;
  }

  levelManager.loadLevel(currentLevel);
  ball.speed = 4;
  ball.reset();
  ball.stickToPaddle(paddle);
  balls = [ball];
  hasLaser = false;
  laserTimer = 0;

  updateHUD();
  showScreen('playing');
}

function levelComplete() {
  gameState = 'levelComplete';
  sound.play('win');
  showScreen('levelComplete');
}

function gameOver() {
  gameState = 'gameOver';
  setHighScore(score);
  sound.play('lose');
  showScreen('gameOver');
}

// === DRAW ===
function draw() {
  // Clear background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState !== 'playing') return;

  // Draw bricks and boss
  levelManager.draw(ctx);

  // Draw paddle
  paddle.draw(ctx);

  // Draw all balls
  for (const b of balls) {
    b.draw(ctx);
  }

  // Draw powerups
  powerupManager.draw(ctx);

  // Draw particles
  particleManager.draw(ctx);

  // Draw laser
  if (hasLaser && laserTimer > 0) {
    ctx.fillStyle = 'rgba(255, 107, 157, 0.8)';
    ctx.shadowColor = '#ff6b9d';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x + paddle.width / 2 - 2, 0, 4, paddle.y);
    ctx.shadowBlur = 0;
  }
}

// === UPDATE ===
function update() {
  if (gameState !== 'playing') return;

  // Update paddle
  paddle.update(keys, canvas.width, mouseX);

  // Update laser timer
  if (hasLaser) {
    laserTimer--;
    if (laserTimer <= 0) {
      hasLaser = false;
    }
    // Fire laser at top of frame
    // Laser hits bricks
    for (const brick of levelManager.bricks) {
      if (brick.active &&
          brick.x < paddle.x + paddle.width / 2 + 5 &&
          brick.x + brick.width > paddle.x + paddle.width / 2 - 5) {
        if (brick.hit()) {
          brick.active = false;
          score += brick.value;
          particleManager.emit(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 15);
          sound.play('break');
          if (Math.random() < 0.2) {
            const types = Object.keys(POWERUP_TYPES);
            powerupManager.add(brick.x + brick.width / 2, brick.y, types[Math.floor(Math.random() * types.length)]);
          }
          levelManager.checkLevelComplete();
        }
        break;
      }
    }
  }

  // Update all balls
  let activeBalls = 0;
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    const result = b.update(paddle, keys);
    if (result === 'lost') {
      balls.splice(i, 1);
      continue;
    }
    activeBalls++;
  }

  // Update level
  levelManager.update(powerupManager, particleManager, sound);

  // Boss movement
  levelManager.bossUpdateAll(ball);

  // Boss collision
  for (const b of balls) {
    levelManager.bossCollide(b);
  }

  // Update powerups
  powerupManager.update(paddle);

  // Update particles
  particleManager.update();

  // Check level complete
  if (levelManager.checkLevelComplete()) {
    levelComplete();
    return;
  }

  // Check ball loss
  if (balls.length === 0) {
    lives--;
    updateHUD();
    if (lives <= 0) {
      gameOver();
    } else {
      ball.speed = 4;
      ball.reset();
      ball.stickToPaddle(paddle);
      balls = [ball];
    }
  }
}

// === GAME LOOP ===
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
