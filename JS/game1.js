/* =========================
   Catch Game – Full Logic
========================= */

// Elements
const gameArea = document.getElementById("game-area");
const player = document.querySelector(".player");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const difficultySelect = document.getElementById("difficulty");

// Game state
let score = 0;
let timeLeft = 60;
let gameInterval = null;
let spawnInterval = null;
let isRunning = false;

// Player position
let playerX = 0;
const playerSpeed = 20;

// Difficulty settings
const difficultySettings = {
  easy: { spawnRate: 1200, fallSpeed: 2 },
  medium: { spawnRate: 800, fallSpeed: 3 },
  hard: { spawnRate: 500, fallSpeed: 4 }
};

/* =========================
   Player Movement
========================= */
document.addEventListener("keydown", (e) => {
  if (!isRunning) return;

  const areaWidth = gameArea.clientWidth;
  const playerWidth = player.offsetWidth;

  if (e.key === "ArrowLeft") {
    playerX = Math.max(0, playerX - playerSpeed);
  }

  if (e.key === "ArrowRight") {
    playerX = Math.min(areaWidth - playerWidth, playerX + playerSpeed);
  }

  player.style.left = playerX + "px";
});

/* =========================
   Start Game
========================= */
startBtn.addEventListener("click", startGame);

function startGame() {
  if (isRunning) return;

  score = 0;
  timeLeft = 60;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;

  gameArea.querySelectorAll(".target").forEach(t => t.remove());

  playerX = gameArea.clientWidth / 2 - player.offsetWidth / 2;
  player.style.left = playerX + "px";

  isRunning = true;
  startBtn.disabled = true;

  const difficulty = difficultySelect.value;
  const settings = difficultySettings[difficulty];

  gameInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  spawnInterval = setInterval(() => {
    createTarget(settings.fallSpeed);
  }, settings.spawnRate);
}

/* =========================
   Create Falling Target
========================= */
function createTarget(speed) {
  const target = document.createElement("div");
  target.classList.add("target");

  const size = 30;
  const areaWidth = gameArea.clientWidth;

  target.style.left = Math.random() * (areaWidth - size) + "px";
  target.style.top = "0px";

  gameArea.appendChild(target);

  let targetY = 0;

  const fall = setInterval(() => {
    if (!isRunning) {
      clearInterval(fall);
      target.remove();
      return;
    }

    targetY += speed;
    target.style.top = targetY + "px";

    if (checkCollision(target, player)) {
      score++;
      scoreEl.textContent = score;
      clearInterval(fall);
      target.remove();
    }

    if (targetY > gameArea.clientHeight) {
      clearInterval(fall);
      target.remove();
    }
  }, 16);
}

/* =========================
   Collision Detection
========================= */
function checkCollision(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();

  return !(
    r1.top > r2.bottom ||
    r1.bottom < r2.top ||
    r1.right < r2.left ||
    r1.left > r2.right
  );
}

/* =========================
   End Game
========================= */
function endGame() {
  isRunning = false;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  startBtn.disabled = false;

  // 🔑 שמירת תוצאה למשתמש
  updateCatchGameResult(score);

  alert(`⏰ הזמן נגמר!\nהניקוד שלך: ${score}`);
}
