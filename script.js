'use strict';

// ================ Functions ================ //
const createGrid = function (size) {
  const grid = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(0);
    }
    grid.push(row);
  }
  return grid;
};

const keypress = function (event) {
  switch (event.keyCode) {
    case 83:
    case 40:
      if (moving !== 'up') moving = 'down';
      break;
    case 87:
    case 38:
      if (moving !== 'down') moving = 'up';
      break;
    case 68:
    case 39:
      if (moving !== 'left') moving = 'right';
      break;
    case 65:
    case 37:
      if (moving !== 'right') moving = 'left';
      break;
    case 13:
      if (gameOver) resetGame();
      break;
  }
};

const drawGame = function () {
  //Draw Grid
  ctx.fillStyle = 'black';
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = 'green';
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      ctx.strokeRect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }

  //Draw Snake
  for (const [x, y] of snake) {
    ctx.fillStyle = 'white';
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }

  //Draw Food
  ctx.fillStyle = food.color;
  ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
};

const updateSnake = function () {
  if (snake[0][0] === food.x && snake[0][1] === food.y) {
    growSnake = true;
    food.spawnFood();
  }

  for (let i = snake.length - 1; i >= 0; i--) {
    if (growSnake) {
      snake.push([snake[snake.length - 1][0], snake[snake.length - 1][1]]);
      growSnake = false;
    }

    if (i === 0) {
      switch (moving) {
        case 'up':
          if (snake[i][1] === 0) {
            gameOver = true;
          } else {
            snake[i] = [snake[i][0], snake[i][1] - 1];
          }
          break;
        case 'down':
          if (snake[i][1] === gridSize - 1) {
            gameOver = true;
          } else {
            snake[i] = [snake[i][0], snake[i][1] + 1];
          }
          break;
        case 'right':
          if (snake[i][0] === gridSize - 1) {
            gameOver = true;
          } else {
            snake[i] = [snake[i][0] + 1, snake[i][1]];
          }
          break;
        case 'left':
          if (snake[i][0] === 0) {
            gameOver = true;
          } else {
            snake[i] = [snake[i][0] - 1, snake[i][1]];
          }
          break;
        case 'none':
          moving = moving;
          break;
      }
    } else {
      snake[i] = snake[i - 1];
    }
  }

  const snakeHead = snake[0];
  for (let i = 1; i < snake.length; i++) {
    const snakePart = snake[i];
    if (snakeHead[0] === snakePart[0] && snakeHead[1] === snakePart[1]) {
      gameOver = true;
      break;
    }
  }
};

const gameOverPhase = function () {
  overlay.classList.remove('hidden');
  resetGameModal.classList.remove('hidden');

  const snakeLength = snake.length;
  for (const score of scoreLabels) {
    score.textContent = snakeLength;
  }

  if (snakeLength > Number(highscoreLabels[0].textContent)) {
    for (const highscore of highscoreLabels) {
      highscore.textContent = snakeLength;
    }
  }
};

const resetGame = function () {
  overlay.classList.add('hidden');
  resetGameModal.classList.add('hidden');

  while (snake.length) snake.pop();
  snake.push([snakeStartX, snakeStartY]);
  moving = snakeStartMoving;

  food.spawnFood();
  gameOver = false;
};

const startGame = function () {
  overlay.classList.add('hidden');
  startGameModal.classList.add('hidden');
  setInterval(updateGame, 1000 / 8);
};

const updateGame = function () {
  if (!gameOver) {
    updateSnake();
    gameOver ? gameOverPhase() : drawGame();
  } else {
    gameOverPhase();
  }
};

// ================ Variables ================ //
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const startGameModal = document.querySelector('.startModal');
const startGameButton = document.querySelector('.start-game');
const resetGameModal = document.querySelector('.resetModal');
const resetGameButton = document.querySelector('.reset-game');
const overlay = document.querySelector('.overlay');
const scoreLabels = document.querySelectorAll('.score');
const highscoreLabels = document.querySelectorAll('.highscore');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const gridSize = 16;
const grid = createGrid(gridSize);
const tileSize = WIDTH / grid.length;

const snakeStartX = gridSize / 4;
const snakeStartY = gridSize / 2;
const snakeStartMoving = 'none';
const snake = [[snakeStartX, snakeStartY]];
let growSnake = false;
let moving = snakeStartMoving;

const food = {
  x: 0,
  y: 0,
  color: 'yellow',

  spawnFood: function () {
    let invalidSpawn = true;
    while (invalidSpawn) {
      invalidSpawn = false;
      this.x = Math.trunc(Math.random() * gridSize);
      this.y = Math.trunc(Math.random() * gridSize);

      for (const [snakeX, snakeY] of snake) {
        if (this.x === snakeX && this.y === snakeY) {
          invalidSpawn = true;
          break;
        }
      }
    }
  },
};
food.spawnFood();

let gameOver = false;
drawGame();

document.addEventListener('keydown', keypress);
startGameButton.addEventListener('click', startGame);
resetGameButton.addEventListener('click', resetGame);
