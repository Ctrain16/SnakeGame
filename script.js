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

const handleResize = function () {
  let w = window.innerWidth * 0.6; // -2 accounts for the border
  let h = window.innerHeight * 0.6;
  w > h ? (w = h) : (h = w);

  canvas.width = w;
  canvas.height = h;

  width = canvas.width;
  height = canvas.height;
  tileSize = width / grid.length;

  drawGame();
};

const drawGame = function () {
  //Draw Grid
  ctx.fillStyle = 'black';
  ctx.clearRect(0, 0, width, height);
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'green';
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      ctx.strokeRect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }

  //Draw Snake
  for (const snakePart of snake) {
    ctx.fillStyle = 'white';
    ctx.fillRect(
      snakePart.x * tileSize,
      snakePart.y * tileSize,
      tileSize,
      tileSize
    );
  }

  //Draw Food
  ctx.fillStyle = food.color;
  ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
};

const updateSnake = function () {
  for (let i = snake.length - 1; i >= 0; i--) {
    if (growSnake) {
      snake.push({
        x: snake[snake.length - 1].x,
        y: snake[snake.length - 1].y,
      });
      for (const score of scoreLabels) {
        score.textContent = snake.length - 1;
      }
      growSnake = false;
    }

    if (i === 0) {
      switch (moving) {
        case 'up':
          if (snake[i].y === 0) {
            gameOver = true;
          } else {
            --snake[i].y;
          }
          break;
        case 'down':
          if (snake[i].y === gridSize - 1) {
            gameOver = true;
          } else {
            ++snake[i].y;
          }
          break;
        case 'right':
          if (snake[i].x === gridSize - 1) {
            gameOver = true;
          } else {
            ++snake[i].x;
          }
          break;
        case 'left':
          if (snake[i].x === 0) {
            gameOver = true;
          } else {
            --snake[i].x;
          }
          break;
        case 'none':
          moving = moving;
          break;
      }
    } else {
      snake[i] = Object.assign({}, snake[i - 1]);
    }
  }

  const snakeHead = snake[0];
  for (let i = 1; i < snake.length; i++) {
    const snakePart = snake[i];
    if (snakeHead.x === snakePart.x && snakeHead.y === snakePart.y) {
      gameOver = true;
      break;
    }
  }

  if (snake[0].x === food.x && snake[0].y === food.y) {
    growSnake = true;
    food.spawnFood();
  }
};

const gameOverPhase = function () {
  overlay.classList.remove('hidden');
  resetGameModal.classList.remove('hidden');

  const snakeLength = snake.length - 1;
  if (snakeLength > Number(highscoreLabels[0].textContent)) {
    for (const highscore of highscoreLabels) {
      highscore.textContent = snakeLength;
    }
  }
};

const resetGame = function () {
  overlay.classList.add('hidden');
  resetGameModal.classList.add('hidden');

  for (const score of scoreLabels) {
    score.textContent = 0;
  }

  while (snake.length) snake.pop();
  snake.push({ x: snakeStartX, y: snakeStartY });
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

const calcClickPosition = function (canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
};

const calcSnakeHeadPos = function () {
  const x = snake[0].x * tileSize + tileSize / 2;
  const y = snake[0].y * tileSize + tileSize / 2;
  return { x, y };
};

const calcDiagonalQuadrant = function (snakePos, clickPos, movX, movY) {
  if (Math.abs(snakePos.x - clickPos.x) > Math.abs(snakePos.y - clickPos.y)) {
    if (movX === 'left') {
      if (moving !== 'right') moving = movX;
    } else {
      if (moving !== 'left') moving = movX;
    }
  } else {
    if (movY === 'up') {
      if (moving !== 'down') moving = movY;
    } else {
      if (moving !== 'up') moving = movY;
    }
  }
};

const calcClickDirection = function (event) {
  const clickPos = calcClickPosition(canvas, event);
  const snakePos = calcSnakeHeadPos();

  if (clickPos.x > snakePos.x && clickPos.y >= snakePos.y) {
    // bottom right
    calcDiagonalQuadrant(snakePos, clickPos, 'right', 'down');
  } else if (clickPos.x >= snakePos.x && clickPos.y < snakePos.y) {
    // top right
    calcDiagonalQuadrant(snakePos, clickPos, 'right', 'up');
  } else if (clickPos.x < snakePos.x && clickPos.y <= snakePos.y) {
    // top left
    calcDiagonalQuadrant(snakePos, clickPos, 'left', 'up');
  } else {
    // bottom left
    calcDiagonalQuadrant(snakePos, clickPos, 'left', 'down');
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

const gridSize = 16;
const grid = createGrid(gridSize);
let width = canvas.width;
let height = canvas.height;
let tileSize = width / grid.length;

const snakeStartX = gridSize / 4;
const snakeStartY = gridSize / 2;
const snakeStartMoving = 'none';
const snake = [{ x: snakeStartX, y: snakeStartY }];
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

      for (const { x: snakeX, y: snakeY } of snake) {
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
handleResize();

window.addEventListener('resize', handleResize);
document.addEventListener('keydown', keypress);
startGameButton.addEventListener('click', startGame);
resetGameButton.addEventListener('click', resetGame);
canvas.addEventListener('mousedown', calcClickDirection);
