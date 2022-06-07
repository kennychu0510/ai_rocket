import { APIOrigin } from './api.js';
import { getDOMElement } from './functions.js';
import { Game } from './game.js';
import { RocketGA } from './rocketGA.js';
import { GameBoundary } from './type.js';

/* QUERY SELECTORS */
const _canvas = document.querySelector('canvas');
if (!_canvas) throw new Error('canvas not found');
const canvas = _canvas;
const currentScore = getDOMElement('#current-score');
const totalScore = getDOMElement('#total-score');
const genStarBtn = getDOMElement('#gen-star');
const genMeteoriteBtn = getDOMElement('#gen-meteor');
const genBlackholeBtn = getDOMElement('#gen-blackhole');
const rocketSpeed = getDOMElement('#rocket-speed') as HTMLInputElement;
const addStarBtn = getDOMElement('#add-star');
const resetBtn = getDOMElement('#reset');
const saveStarsBtn = getDOMElement('#save-stars');
const boundaryModeBtn = getDOMElement('#boundary-mode');
const seedBtn = getDOMElement('#seed');
const canvasContainer = getDOMElement('#canvas-container');
console.log(canvasContainer);

const _scoreboard = document.querySelector('#scoreboard');
if (!_scoreboard) throw new Error('score-board not found');
const scoreboard = _scoreboard as HTMLElement;

/* TIMER */
const timerMilliseconds = getDOMElement('#millisecond');
const timerSeconds = getDOMElement('#second');

/* CANVAS */
const canvasOffset = 120;
canvas.height = window.innerHeight * 0.78;
canvas.width = window.innerHeight * 1.8;
console.log('canvas ratio: ' + canvas.width / canvas.height);

/* VARIABLES */
const starSize = 20;
const boundaryOffset = 20;

const gameBoundaries: GameBoundary = {
  top: boundaryOffset,
  bot: canvas.height - boundaryOffset,
  left: boundaryOffset,
  right: canvas.width - boundaryOffset,
};

/* SET UP NEW GAME */
const game = new Game(canvas, gameBoundaries);

/* RENDER CANVAS */
function animate() {
  requestAnimationFrame(animate);
  game.ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* CHECK IF ALL STARS COLLECTED */
  if (
    game.totalStars === game.rocket.collectedStars &&
    game.gameStarted &&
    !game.startAI
  ) {
    game.statusMessage.updateMsg('Well Done!');
    game.rocket.stop();
    const endTime = new Date();
    console.log(`time taken: ` + (+endTime - +game.startTime) / 1000);
    game.gameStarted = false;
  }

  /* UPDATE TIMER */
  if (game.gameStarted) {
    const timeTaken = Number(new Date()) - +game.startTime;
    timerMilliseconds.textContent = String(timeTaken % 1000).padStart(3, '0');
    timerSeconds.textContent = String(Math.floor(timeTaken / 1000)).padStart(
      2,
      '0',
    );
  }

  game.draw();
  game.update();
  currentScore.textContent = String(game.rocket.collectedStars);
  // console.log(userCar.stats())
}

animate();

/*
----------------------------------------------------------------
EVENT LISTENERS
----------------------------------------------------------------
*/
window.addEventListener('keydown', ({ key }) => {
  if (game.buttons.includes(key)) {
    if (!game.gameStarted && game.stars.length > 0) {
      game.startGame();
    }
    game.rocket.changeDirection(key);
  }
});

addStarBtn.addEventListener('click', () => {
  game.addStarModeOn = !game.addStarModeOn;
  if (game.addStarModeOn) {
    addStarBtn.textContent = 'Done';
  } else {
    addStarBtn.textContent = 'Add Star';
  }
});

resetBtn.addEventListener('click', () => {
  // location.reload();
  game.reset();
  totalScore.textContent = '0';
  currentScore.textContent = '0';
  timerMilliseconds.textContent = '000';
  timerSeconds.textContent = '00';
  rocketSpeed.value = String(Math.round(game.rocket.stats().acceleration));
});

canvas.addEventListener('click', (e) => {
  if (!game.addStarModeOn) return;
  const x = e.clientX - starSize / 2;
  const y = e.clientY - scoreboard.getBoundingClientRect().bottom - starSize;
  const position = { x, y };
  game.addStar(position);
  totalScore.textContent = String(game.stars.length);
});

genStarBtn.addEventListener('click', () => {
  game.generateStars();
  totalScore.textContent = String(game.stars.length);
});

genMeteoriteBtn.addEventListener('click', () => {
  game.generateMeteorite();
});

genBlackholeBtn.addEventListener('click', () => {
  game.generateBlackholePair();
});

// UPDATE ROCKET SPEED DISPLAY VALUE
rocketSpeed.value = String(Math.round(game.rocket.stats().acceleration));

rocketSpeed.addEventListener('change', () => {
  if (Number(rocketSpeed.value) <= 0) return;
  game.rocket.changeAcceleration(Number(rocketSpeed.value));
});

boundaryModeBtn.addEventListener('click', () => {
  if (game.boundary.getBoundaryMode()) {
    game.boundary.turnOffBoundary();
    boundaryModeBtn.textContent = 'Turn On Boundary';
  } else {
    game.boundary.turnOnBoundary();
    boundaryModeBtn.textContent = 'Turn Off Boundary';
  }
});

saveStarsBtn.addEventListener('click', () => {
  const listOfStarsPercentage = game.stars.map((star) => {
    const newX = star.getX() / canvas.width;
    const newY = star.getY() / canvas.height;
    return { x: newX, y: newY };
  });
  const starMap = {
    count: game.stars.length,
    coordinates: JSON.stringify(listOfStarsPercentage),
  };
  fetch(APIOrigin + '/star-map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      starMap,
    }),
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      console.log(json.id);
    });
});

seedBtn.addEventListener('click', () => {
  game.seed();
  game.startGame();
});

window.addEventListener('resize', () => {
  canvas.height = window.innerHeight * 0.78;
  canvas.width = window.innerHeight * 1.8;
});
