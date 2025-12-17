const icons = {
    easy: ["🍎", "🍌", "🍇", "🍓", "🍉", "🍍"],
    medium: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
    hard: ["⚽", "🏀", "🏈", "🎾", "🏐", "🎱", "🥊", "🏓", "🏸", "🥋", "⛳", "🏹"]
};

const difficultyOrder = ["easy", "medium", "hard"];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let pairsFound = 0;
let totalPairs = 0;

let timer = 0;
let timerId = null;
let startTime = null;

const difficulties = {
    easy: { pairs: 6, columns: 4 },
    medium: { pairs: 8, columns: 4 },
    hard: { pairs: 12, columns: 6 }
};

const board = document.getElementById("board");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const difficultySelect = document.getElementById("difficulty");
const startBtn = document.getElementById("startBtn");
const messageEl = document.getElementById("message");
const progressBar = document.getElementById("progressBar");

startBtn.addEventListener("click", startGame);

function startGame() {
    resetState();
    setupBoard();
    startTimer();
}

function resetState() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    pairsFound = 0;

    movesEl.textContent = "0";
    pairsEl.textContent = "0";
    timerEl.textContent = "0";
    messageEl.textContent = "";
    progressBar.style.width = "0%";

    clearInterval(timerId);
}

function setupBoard() {
    const level = difficultySelect.value;
    const settings = difficulties[level];

    totalPairs = settings.pairs;
    board.style.gridTemplateColumns = `repeat(${settings.columns}, 80px)`;
    board.innerHTML = "";

    const deck = buildDeck(level);

    deck.forEach(icon => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.value = icon;
        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });
}

function buildDeck(level) {
    let values = [];
    icons[level].forEach(icon => values.push(icon, icon));
    return shuffle(values);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function flipCard(card) {
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
    movesEl.textContent = moves;
    checkMatch();
}

function checkMatch() {
    lockBoard = true;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        pairsFound++;
        pairsEl.textContent = pairsFound;
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
        }, 800);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function startTimer() {
    startTime = Date.now();
    timerId = setInterval(() => {
        timer = Math.floor((Date.now() - startTime) / 1000);
        timerEl.textContent = timer;
    }, 1000);
}

function updateProgress() {
    progressBar.style.width = (pairsFound / totalPairs) * 100 + "%";
}

function levelCompleted() {
    clearInterval(timerId);

    const currentIndex = difficultyOrder.indexOf(difficultySelect.value);

    if (currentIndex === difficultyOrder.length - 1) {
        messageEl.textContent = "🏆 Congratulations! You finished all levels!";
        return;
    }

    messageEl.textContent = "Level completed! Starting next level...";

    setTimeout(() => {
        difficultySelect.value = difficultyOrder[currentIndex + 1];
        startGame();
    }, 2000);
}
