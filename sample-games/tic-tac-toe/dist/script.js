const boardElement = document.getElementById("board");
const turnLabelElement = document.getElementById("turnLabel");
const resultLabelElement = document.getElementById("resultLabel");
const scoreLabelElement = document.getElementById("scoreLabel");
const resetRoundButton = document.getElementById("resetRoundButton");
const resetMatchButton = document.getElementById("resetMatchButton");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let score = { X: 0, O: 0 };
let winningCells = [];
const matchStartedAt = Date.now();

function render() {
  boardElement.innerHTML = "";

  board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.textContent = value;
    cell.disabled = Boolean(value) || gameOver;
    cell.setAttribute("aria-label", `Cell ${index + 1}`);

    if (value) {
      cell.classList.add(value.toLowerCase());
    }

    if (winningCells.includes(index)) {
      cell.classList.add("win");
    }

    cell.addEventListener("click", () => playMove(index));
    boardElement.appendChild(cell);
  });

  turnLabelElement.textContent = gameOver ? "Round complete" : `Player ${currentPlayer}`;
  scoreLabelElement.textContent = `X ${score.X} - ${score.O} O`;
}

function updateResult(message) {
  resultLabelElement.textContent = message;
}

function checkWinner() {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winningCells = line;
      return board[a];
    }
  }

  return null;
}

function playMove(index) {
  if (board[index] || gameOver) {
    return;
  }

  board[index] = currentPlayer;
  const winner = checkWinner();

  if (winner) {
    gameOver = true;
    score[winner] += 1;
    updateResult(`Player ${winner} wins`);
    postMatchResult(winner);
    render();
    return;
  }

  if (board.every(Boolean)) {
    gameOver = true;
    updateResult("Draw");
    render();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateResult("In progress");
  render();
}

function postMatchResult(winner) {
  const durationSeconds = Math.max(1, Math.round((Date.now() - matchStartedAt) / 1000));
  const scoreValue = winner === "X" ? 100 : 90;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "caskill:finish",
        score: scoreValue,
        durationSeconds,
        clientMeta: {
          game: "tic-tac-toe-duel",
          winner,
          scoreboard: score,
        },
      },
      "*",
    );
  }
}

function resetRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  winningCells = [];
  updateResult("In progress");
  render();
}

function resetMatch() {
  score = { X: 0, O: 0 };
  resetRound();
}

resetRoundButton.addEventListener("click", resetRound);
resetMatchButton.addEventListener("click", resetMatch);

resetRound();
