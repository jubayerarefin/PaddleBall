# DX Ball

A modern brick-breaking arcade game built with vanilla HTML5 Canvas, CSS, and JavaScript.

## Features

- 🎮 **20 levels** with increasing difficulty
- 💥 **Power-ups**: Expand paddle, Multi-ball, Slow motion, Laser, Shrink
- 👾 **Boss levels** every 5 levels
- ✨ **Particle effects** with radial glow
- 🔊 **Sound effects** via Web Audio API
- 📱 **Responsive design** — works on desktop and mobile
- 🖱️ **Multiple controls**: Keyboard, Mouse, Touch

## Controls

| Input | Action |
|-------|--------|
| `←` / `→` | Move paddle |
| `Space` / `Enter` | Launch ball / Start game |
| Mouse | Move paddle |
| Click | Launch ball |

## Quick Start

### Play Online

Visit the live game: [jubayerarefin.github.io/PaddleBall](https://jubayerarefin.github.io/PaddleBall/)

### Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/jubayerarefin/PaddleBall.git
   cd DXBall
   ```

2. Open `index.html` in your browser (or use a local server):
   ```bash
   # Python
   python -m http.server 8080

   # Node
   npx serve
   ```

3. Navigate to `http://localhost:8080`

## Project Structure

```
dx-ball/
├── index.html      # Game HTML + canvas setup
├── dx-ball.js      # Main game engine & loop
├── dx-ball.css     # Styles & responsive layout
├── ball.js         # Ball physics & collision
├── paddle.js       # Paddle movement & controls
├── bricks.js       # Brick & Level management
├── powerups.js     # Power-up system
├── particles.js    # Particle effects
├── sound.js        # Audio via Web Audio API
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages CI/CD
```

## Tech Stack

- **HTML5 Canvas** — 60fps rendering
- **CSS3** — Responsive layout, transitions, media queries
- **Vanilla JavaScript** — No frameworks, no dependencies
- **Web Audio API** — Procedural sound synthesis
- **GitHub Pages** — Hosting via Actions workflow

## Level Design

| Level Range | Description |
|-------------|-------------|
| 1–4 | Standard brick grids (8–11 columns) |
| 5 | Boss fight |
| 6–9 | Larger grids + multi-hit bricks |
| 10 | Boss fight |
| 10+ | Increasing difficulty: more bricks, more hits, faster ball |

## High Score

Scores are saved locally via `localStorage` and displayed on Game Over when beaten.

## License

MIT
