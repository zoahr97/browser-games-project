/*
  File: memory.js
  Purpose: Implements the "Memory Matrix" card matching game.
  Description:
  - Cards are generated based on selected difficulty.
  - Player flips two cards at a time to find matching pairs.
  - Game tracks time, moves, progress, and completed levels.
  - Difficulty increases automatically after each completed level.
  - User score and games played are saved to LocalStorage.
*/

/* ===============================
   ICONS BY DIFFICULTY
================================ */
/*
  Symbol sets used for cards per difficulty level.
*/
const icons = {
  easy:   ["■", "□", "▲", "▼", "◆", "◇"],
  medium: ["✦", "✧", "✶", "✸", "✹", "✺", "✷", "✴"],
  hard:   ["⌖", "⌬", "⎔", "⎈", "⏣", "⏥", "⌁", "⌂", "⌘", "⎋", "⌗", "⌸"]
};

/*
  Difficulty progression order.
*/
const difficultyOrder = ["easy", "medium", "hard"];

/*
  Board configuration per difficulty:
  - pairs: number of matching pairs
  - columns: grid layout width
*/
const difficulties = {
  easy:   { pairs: 6,  columns: 4 },
  medium: { pairs: 8,  columns: 4 },
  hard:   { pairs: 12, columns: 6 }
};

/* ===============================
   GAME STATE
================================ */
/*
  Runtime state variables controlling game logic.
*/
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let pairsFound = 0;
let totalPairs = 0;

let timer = 0;
let timerId = null;
let startTime = null;
let gameRunning = false;

/* ===============================
   DOM ELEMENTS
================================ */
/*
  References to all UI elements used by the game.
*/
const board = document.getElementById("board");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const totalPairsEl = document.getElementById("totalPairs");
const difficultySelect = document.getElementById("difficulty");
const startBtn = document.getElementById("startBtn");
const messageEl = document.getElementById("message");
const progressBar = document.getElementById("progressBar");
const levelLabel = document.getElementById("levelLabel");

/* ===============================
   EVENTS
================================ */
/*
  UI event listeners.
*/
startBtn.addEventListener("click", startGame);

difficultySelect.addEventListener("change", () => {
  if (!gameRunning) renderLevelLabel();
});

/* ===============================
   INIT
================================ */
/*
  Initial UI setup.
*/
renderLevelLabel();

/* ===============================
   GAME FLOW
================================ */
/*
  Starts a new game session.
*/
function startGame() {
  if (gameRunning) return;

  resetState();
  setupBoard();
  startTimer();

  gameRunning = true;
  startBtn.disabled = true;
  messageEl.textContent = "";
}

/*
  Forces the next level to start automatically.
*/
function forceStartNextLevel() {
  resetState();
  setupBoard();
  startTimer();

  gameRunning = true;
  startBtn.disabled = true;
  messageEl.textContent = "";
}

/*
  Resets all game state and UI values.
*/
function resetState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  pairsFound = 0;

  movesEl.textContent = "0";
  pairsEl.textContent = "0";
  timerEl.textContent = "0";
  progressBar.style.width = "0%";
  messageEl.textContent = "";

  clearInterval(timerId);
  timerId = null;
  timer = 0;
  startTime = null;
}

/*
  Builds the game board based on difficulty.
*/
function setupBoard() {
  const level = difficultySelect.value;
  const settings = difficulties[level];

  totalPairs = settings.pairs;
  totalPairsEl.textContent = totalPairs;

  renderLevelLabel();

  board.style.gridTemplateColumns = `repeat(${settings.columns}, 82px)`;
  board.innerHTML = "";

  const deck = buildDeck(level);

  deck.forEach(symbol => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = symbol;
    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });
}

/*
  Updates the difficulty label text.
*/
function renderLevelLabel() {
  levelLabel.textContent = difficultySelect.value.toUpperCase();
}

/* ===============================
   DECK
================================ */
/*
  Creates and shuffles a deck of card values.
*/
function buildDeck(level) {
  const values = [];
  icons[level].forEach(icon => values.push(icon, icon));
  return shuffle(values);
}

/*
  Fisher-Yates shuffle algorithm.
*/
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* ===============================
   CARD LOGIC
================================ */
/*
  Handles card flip interaction.
*/
function flipCard(card) {
  if (!gameRunning) return;
  if (lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  card.textContent = card.dataset.value;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesEl.textContent = String(moves);

  checkMatch();
}

/*
  Checks if the selected cards match.
*/
function checkMatch() {
  lockBoard = true;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    pairsFound++;
    pairsEl.textContent = String(pairsFound);
    updateProgress();

    resetTurn();

    if (pairsFound === totalPairs) {
      levelCompleted();
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      firstCard.textContent = "";
      secondCard.textContent = "";
      resetTurn();
    }, 700);
  }
}

/*
  Resets card selection state.
*/
function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

/* ===============================
   TIMER
================================ */
/*
  Starts the game timer.
*/
function startTimer() {
  startTime = Date.now();
  timerId = setInterval(() => {
    timer = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = String(timer);
  }, 1000);
}

/* ===============================
   PROGRESS
================================ */
/*
  Updates the progress bar according to pairs found.
*/
function updateProgress() {
  progressBar.style.width = (pairsFound / totalPairs) * 100 + "%";
}

/* ===============================
   LEVEL COMPLETE
================================ */
/*
  Handles level completion, scoring, and progression.
*/
function levelCompleted() {
  clearInterval(timerId);
  timerId = null;
  gameRunning = false;
  startBtn.disabled = false;

  // Score by difficulty
  let points = 0;
  if (difficultySelect.value === "easy") points = 10;
  if (difficultySelect.value === "medium") points = 20;
  if (difficultySelect.value === "hard") points = 30;

  // Update user stats
  updateCatchGameResult(points);

  const currentIndex = difficultyOrder.indexOf(difficultySelect.value);

  if (currentIndex === difficultyOrder.length - 1) {
    messageEl.textContent = "🏆 Congratulations! You finished all levels!";
    return;
  }

  messageEl.textContent = "Level completed! Starting next level...";

  setTimeout(() => {
    difficultySelect.value = difficultyOrder[currentIndex + 1];
    renderLevelLabel();
    forceStartNextLevel();
  }, 1400);
}
