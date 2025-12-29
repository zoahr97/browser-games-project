/*
  File: catch.js
  Purpose: Implements the "Falling Objects" catch game.
  Description:
  - Player moves horizontally to catch falling objects.
  - Good objects increase score, bad objects reduce lives.
  - Game supports multiple difficulty levels.
  - Results are saved to LocalStorage per user.
*/

/* =========================
   FALLING OBJECTS – Catch Game
========================= */

/* ---------- DOM ---------- */
/*
  References to all required DOM elements used by the game.
*/
const playfield = document.getElementById("playfield");
const player = document.getElementById("player");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const livesEl = document.getElementById("lives");
const messageEl = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const difficultySelect = document.getElementById("difficulty");
const levelLabel = document.getElementById("levelLabel");

/* ---------- Levels ---------- */
/*
  Supported difficulty levels and their order.
*/
const difficultyOrder = ["easy", "medium", "hard"];

/*
  Game configuration per difficulty:
  - duration: game time in seconds
  - spawnMs: interval between falling objects
  - speedMin / speedMax: falling speed range
  - badChance: probability of spawning a bad object
*/
const settingsByDifficulty = {
  easy:   { duration: 60, spawnMs: 900, speedMin: 2,   speedMax: 3.2, badChance: 0.15 },
  medium: { duration: 45, spawnMs: 650, speedMin: 2.6, speedMax: 4.1, badChance: 0.22 },
  hard:   { duration: 35, spawnMs: 480, speedMin: 3.2, speedMax: 5.2, badChance: 0.30 }
};

/* ---------- Constants ---------- */
/*
  Fixed gameplay constants.
*/
const PLAYER_SPEED = 7;
const DROP_SIZE = 24;

/* ---------- State ---------- */
/*
  Runtime state variables for the game session.
*/
let score = 0;
let lives = 3;
let timeLeft = 0;
let isRunning = false;

let timerId = null;
let spawnId = null;
let rafId = null;

let playerX = 0;
let leftHeld = false;
let rightHeld = false;

/*
  Active falling objects:
  { el, x, y, speed, type }
*/
let drops = [];

/* ---------- Events ---------- */
/*
  UI and keyboard event listeners.
*/
startBtn.addEventListener("click", startGame);

difficultySelect.addEventListener("change", () => {
  if (!isRunning) renderLevelLabel();
});

document.addEventListener("keydown", e => {
  if (!isRunning) return;
  if (e.key === "ArrowLeft") leftHeld = true;
  if (e.key === "ArrowRight") rightHeld = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") leftHeld = false;
  if (e.key === "ArrowRight") rightHeld = false;
});

/* ---------- Init ---------- */
/*
  Initial UI setup.
*/
renderLevelLabel();
centerPlayer();

/* =========================
   Game Flow
========================= */
/*
  Starts a new game session.
*/
function startGame() {
  if (isRunning) return;

  clearAll();

  score = 0;
  lives = 3;

  const level = difficultySelect.value;
  const cfg = settingsByDifficulty[level];
  timeLeft = cfg.duration;

  scoreEl.textContent = score;
  livesEl.textContent = lives;
  timeEl.textContent = timeLeft;

  isRunning = true;
  startBtn.disabled = true;
  messageEl.textContent = "GO! Catch green drops, avoid pink drops.";

  renderLevelLabel();
  centerPlayer();

  // Countdown timer
  timerId = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame(true);
  }, 1000);

  // Falling object spawner
  spawnId = setInterval(() => spawnDrop(cfg), cfg.spawnMs);

  // Main animation loop
  rafId = requestAnimationFrame(loop);
}

/*
  Ends the game and updates user statistics.
*/
function endGame(timeUp) {
  isRunning = false;
  startBtn.disabled = false;

  clearInterval(timerId);
  clearInterval(spawnId);
  cancelAnimationFrame(rafId);

  drops.forEach(d => d.el.remove());
  drops = [];

  // Save results to LocalStorage
  updateCatchGameResult(score);

  if (timeUp && lives > 0) {
    messageEl.textContent = "Time's up! Well done 🎉";
  } else {
    messageEl.textContent = `Game Over! Final Score: ${score}`;
  }
}

/*
  Clears timers, objects, and input state.
*/
function clearAll() {
  clearInterval(timerId);
  clearInterval(spawnId);
  cancelAnimationFrame(rafId);

  drops.forEach(d => d.el.remove());
  drops = [];

  leftHeld = false;
  rightHeld = false;
}

/* =========================
   Main Loop
========================= */
/*
  Main game loop using requestAnimationFrame.
*/
function loop() {
  if (!isRunning) return;

  movePlayer();
  updateDrops();

  rafId = requestAnimationFrame(loop);
}

/*
  Updates player position based on keyboard input.
*/
function movePlayer() {
  const fieldW = playfield.clientWidth;
  const playerW = player.offsetWidth;

  if (leftHeld) playerX -= PLAYER_SPEED;
  if (rightHeld) playerX += PLAYER_SPEED;

  playerX = clamp(playerX, 0, fieldW - playerW);
  player.style.left = playerX + "px";
}

/*
  Updates falling objects positions and handles collisions.
*/
function updateDrops() {
  const fieldH = playfield.clientHeight;

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.y += d.speed;
    d.el.style.top = d.y + "px";

    if (isColliding(d.el, player)) {
      if (d.type === "bad") {
        lives--;
        livesEl.textContent = lives;
        if (lives <= 0) {
          removeDrop(i);
          endGame(false);
          return;
        }
      } else {
        score++;
        scoreEl.textContent = score;
      }
      removeDrop(i);
      continue;
    }

    if (d.y > fieldH + 40) {
      removeDrop(i);
    }
  }
}

/*
  Removes a falling object from the game.
*/
function removeDrop(i) {
  drops[i].el.remove();
  drops.splice(i, 1);
}

/* =========================
   Drop Spawning
========================= */
/*
  Creates a new falling object based on difficulty settings.
*/
function spawnDrop(cfg) {
  const fieldW = playfield.clientWidth;

  const el = document.createElement("div");
  const isBad = Math.random() < cfg.badChance;
  const type = isBad ? "bad" : "good";

  el.className = `drop ${type}`;

  const x = Math.random() * (fieldW - DROP_SIZE);
  const y = -30;
  const speed = rand(cfg.speedMin, cfg.speedMax);

  el.style.left = x + "px";
  el.style.top = y + "px";

  playfield.appendChild(el);
  drops.push({ el, x, y, speed, type });
}

/* =========================
   User Update (LocalStorage)
========================= */
/*
  Updates the current user's score and games played.
*/
function updateCatchGameResult(points) {
  const users = getUsers();
  const username = getCurrentUser();
  const user = users.find(u => u.username === username);
  if (!user) return;

  user.score = (user.score || 0) + points;
  user.gamesPlayed = (user.gamesPlayed || 0) + 1;

  saveUsers(users);
}

/* =========================
   Utils
========================= */
/*
  Renders the current difficulty label.
*/
function renderLevelLabel() {
  levelLabel.textContent = difficultySelect.value.toUpperCase();
}

/*
  Centers the player horizontally.
*/
function centerPlayer() {
  const fieldW = playfield.clientWidth;
  const playerW = player.offsetWidth;
  playerX = Math.max(0, fieldW / 2 - playerW / 2);
  player.style.left = playerX + "px";
}

/*
  Axis-aligned bounding box collision detection.
*/
function isColliding(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(
    r1.bottom < r2.top ||
    r1.top > r2.bottom ||
    r1.right < r2.left ||
    r1.left > r2.right
  );
}

/*
  Clamps a value between min and max.
*/
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/*
  Returns a random float between min and max.
*/
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/*
  Advances to the next difficulty level if available.
*/
function goToNextLevel() {
  const currentIndex = difficultyOrder.indexOf(difficultySelect.value);

  if (currentIndex === difficultyOrder.length - 1) {
    messageEl.textContent = "🏆 You finished all levels!";
    return;
  }

  difficultySelect.value = difficultyOrder[currentIndex + 1];
  renderLevelLabel();

  setTimeout(() => {
    startGame();
  }, 1200);
}
