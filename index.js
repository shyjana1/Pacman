import {
  LEVEL,
  OBJECT_TYPE
} from './setup';
import {
  randomMovement
} from './ghostmoves';

import GameBoard from './GameBoard';
import Pacman from './Pacman';
import Ghost from './Ghost';
// Sounds( all the sounds of the events of the game)
import soundGameStart from './sounds/game_start.wav';
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGhost from './sounds/eat_ghost.wav';
import soundGameOver from './sounds/death.wav';
// Dom Elements (getting all the elements from the html)
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');
// Game constants (10s for the pill, constant speed for the game)
const POWER_PILL_TIME = 10000;
const GLOBAL_SPEED = 80;
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);
// Initial setup of the game (score, timer etc..)
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

//  AUDIO  //
function playAudio(audio) {
  const soundEffect = new Audio(audio);
  soundEffect.play();
}

function gameOver(pacman, grid) {
  playAudio(soundGameOver);

  document.removeEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );

  gameBoard.showGameStatus(gameWin);

  clearInterval(timer);
  // Show startbutton
  startButton.classList.remove('hide');
}
// checking if there has been a collision with pacman & the ghosts
function checkCollision(pacman, ghosts) {
  const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);

  if (collidedGhost) {
    // in case that the pill has been eaten, it will remove the ghost
    // and put it back in the ghost lair. in addition will give 100 points
    if (pacman.powerPill) {
      playAudio(soundGhost);
      gameBoard.removeObject(collidedGhost.pos, [
        OBJECT_TYPE.GHOST,
        OBJECT_TYPE.SCARED,
        collidedGhost.name
      ]);
      // putting the ghost back in the starting position (ghost lair)
      collidedGhost.pos = collidedGhost.startPos;
      score += 100;
      // if the pill has not been eaten or passed the 10s of the pill,
      // game will be over:
    } else {
      gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
      gameBoard.rotateDiv(pacman.pos, 0);
      gameOver(pacman, gameGrid);
    }
  }
}

function gameLoop(pacman, ghosts) {
  // Move Pacman
  gameBoard.moveCharacter(pacman);
  // check Ghost collision on the old positions
  checkCollision(pacman, ghosts);
  // move ghosts
  ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
  // do a new ghost collision check on the new positions
  checkCollision(pacman, ghosts);
  // checking if Pacman eats a dot
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
    playAudio(soundDot);

    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
    // remove a dot
    gameBoard.dotCount--;
    // add Score
    score += 10;
  }
  // check if Pacman eats a power pill
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
    playAudio(soundPill);

    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

    pacman.powerPill = true;
    score += 50;

    clearTimeout(powerPillTimer);
    powerPillTimer = setTimeout(
      () => (pacman.powerPill = false),
      POWER_PILL_TIME
    );
  }
  // change ghost scare mode depending on powerpill
  if (pacman.powerPill !== powerPillActive) {
    powerPillActive = pacman.powerPill;
    ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
  }
  // check if all dots have been eaten
  if (gameBoard.dotCount === 0) {
    gameWin = true;
    gameOver(pacman, gameGrid);
  }
  // show new score
  scoreTable.innerHTML = score;
}
// game starts
function startGame() {
  playAudio(soundGameStart);

  gameWin = false;
  powerPillActive = false;
  score = 0;

  startButton.classList.add('hide');

  // pacman starting point
  gameBoard.createGrid(LEVEL);
  const pacman = new Pacman(2, 290);
  gameBoard.addObject(290, [OBJECT_TYPE.PACMAN]);
  document.addEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );

  const ghosts = [
    new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
    new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
  ];


  timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// game starts
startButton.addEventListener('click', startGame);