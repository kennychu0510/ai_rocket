import Swal from 'sweetalert2';
import { APIOrigin } from './api.js';
import { Blackhole } from './blackhole.js';
import { genTeleportMap, getDOMElement } from './functions.js';
import { Game } from './game.js';
import { Meteorite, meteoriteSizeRatio } from './meteorite.js';
import { Star, starSizeRatio } from './star.js';
import { GameBoundary, gameDOMelements } from './type.js';
const { random, floor, round } = Math;

/* QUERY SELECTORS */
const _canvas = document.querySelector('canvas');
if (!_canvas) throw new Error('canvas not found');
const canvas = _canvas;
const currentScore = getDOMElement('#current-score');
const totalScore = getDOMElement('#total-score');
const addMeteoriteBtn = getDOMElement('#add-meteor');
const addBlackholeBtn = getDOMElement('#add-blackhole');
const rocketSpeed = getDOMElement('#rocket-speed') as HTMLInputElement;
const population = getDOMElement('#population') as HTMLInputElement;
const moves = getDOMElement('#moves') as HTMLInputElement;
const survivalRate = getDOMElement('#survival-rate') as HTMLInputElement;
const mutationRate = getDOMElement('#mutation-rate') as HTMLInputElement;
const starsReward = getDOMElement('#stars-reward') as HTMLInputElement;
const healthReward = getDOMElement('#health-reward') as HTMLInputElement;
const stepsReward = getDOMElement('#steps-reward') as HTMLInputElement;
const turnReward = getDOMElement('#turn-reward') as HTMLInputElement;
const forwardReward = getDOMElement('#forward-reward') as HTMLInputElement;
const addStarBtn = getDOMElement('#add-star');
const resetBtn = getDOMElement('#reset');
const rankingsBtn = getDOMElement('#rankings');
const saveObjBtn = getDOMElement('#save-obj');
const boundaryModeBtn = getDOMElement('#boundary-mode');
const easyMode = getDOMElement('#easy-mode');
const normalMode = getDOMElement('#normal-mode');
const hardMode = getDOMElement('#hard-mode');
const seedBtn = getDOMElement('#seed');
const canvasContainer = getDOMElement('#canvas-container');
const scoreOrRockets = getDOMElement('#score-mode');
const aiStats = getDOMElement('#ai-stats');
const trainBtn = getDOMElement('#train');

const _scoreboard = document.querySelector('#scoreboard');
if (!_scoreboard) throw new Error('score-board not found');
const scoreboard = _scoreboard as HTMLElement;

/* TIMER */
const timerMilliseconds = getDOMElement('#millisecond');
const timerSeconds = getDOMElement('#second');

/* CANVAS */
const canvasOffset = 10;
canvas.height = window.innerHeight * 0.78 - canvasOffset;
canvas.width = window.innerHeight * 1.8;
// console.log(canvas.width, canvas.height);
// console.log('canvas ratio: ' + canvas.width / canvas.height);

/* VARIABLES */
const blackholeSizeRatio = 0.03;
let mapid = 1;
let addStarModeOn = false;
let addMeteoriteModeOn = false;
let addBlackholeModeOn = false;
let gameStarted = false;
// const trackTopBound = boundaryOffset;
// const trackBotBound = canvas.height - boundaryOffset;
// const trackLeftBound = boundaryOffset;
// const trackRightBound = canvas.width - boundaryOffset;
const boundaryOffset = 20;

const domElements: gameDOMelements = {
  totalScore,
  currentScore,
  timerMilliseconds,
  timerSeconds,
  aiStats,
};

const gameBoundaries: GameBoundary = {
  top: boundaryOffset,
  bot: canvas.height - boundaryOffset,
  left: boundaryOffset,
  right: canvas.width - boundaryOffset,
};

/* SET UP NEW GAME */
const game = new Game(canvas, gameBoundaries, domElements);

/* RENDER CANVAS */
function animate() {
  requestAnimationFrame(animate);
  game.ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* CHECK IF ALL STARS COLLECTED */
  // if (game.totalStars === game.userRocket.collectedStars ) {
  //   game.statusMessage.updateMsg('Well Done!');
  //   game.userRocket.stop();
  //   const endTime = new Date();
  //   console.log(`time taken: ` + (+endTime - +game.startTime) / 1000);
  //   game.stopGame;
  //   const timeTaken =
  //     `${timerSeconds.textContent + '.'}` + `${timerMilliseconds.textContent}`;
  //   Swal.fire({
  //     title: 'Submit your Name!',
  //     input: 'text',
  //     text: 'Your Time: ' + timeTaken,
  //     inputAttributes: {
  //       autocapitalize: 'off',
  //     },
  //     showCancelButton: true,
  //     confirmButtonText: 'Submit',
  //     showLoaderOnConfirm: true,
  //     preConfirm: (login) => {
  //       return fetch(APIOrigin + '/scores', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           id: mapid,
  //           user: login,
  //           timeTaken,
  //         }),
  //       })
  //         .then((response) => {
  //           if (!response.ok) {
  //             throw new Error(response.statusText);
  //           }
  //           return response.json();
  //         })
  //         .catch((error) => {
  //           Swal.showValidationMessage(`Request failed: ${error}`);
  //         });
  //     },
  //     allowOutsideClick: () => !Swal.isLoading(),
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       Swal.fire({
  //         title: 'Your record has been saved!',
  //         imageUrl: './media/champion.png',
  //       });
  //     }
  //   });
  // }

  game.update();
  game.draw();

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
    
    if (!game.gameOnGoing && game.stars.length > 0 && !game.gameEnd) {
      game.startGame();
    }
    game.userRocket.changeDirection(key);
  }
});

addStarBtn.addEventListener('click', () => {
  addStarModeOn = !addStarModeOn;
  resetOtherBtnStates('stars');
  changeButtonModes();
});

addMeteoriteBtn.addEventListener('click', () => {
  addMeteoriteModeOn = !addMeteoriteModeOn;
  resetOtherBtnStates('meteorite');
  changeButtonModes();
});

addBlackholeBtn.addEventListener('click', () => {
  addBlackholeModeOn = !addBlackholeModeOn;
  resetOtherBtnStates('blackhole');
  changeButtonModes();
});

function changeButtonModes() {
  addStarBtn.textContent = addStarModeOn ? 'Done' : 'Add Star';
  addMeteoriteBtn.textContent = addMeteoriteModeOn ? 'Done' : 'Add Meteorite';
  addBlackholeBtn.textContent = addBlackholeModeOn ? 'Done' : 'Add Blackhole';
}

function resetOtherBtnStates(mode: string) {
  if (mode === 'stars') {
    addMeteoriteModeOn = false;
    addBlackholeModeOn = false;
  } else if (mode === 'meteorite') {
    addStarModeOn = false;
    addBlackholeModeOn = false;
  } else if (mode === 'blackhole') {
    addMeteoriteModeOn = false;
    addStarModeOn = false;
  }
}

resetBtn.addEventListener('click', () => {
  location.reload();
  // game.reset();
  // totalScore.textContent = '0';
  // currentScore.textContent = '0';
  // timerMilliseconds.textContent = '000';
  // timerSeconds.textContent = '00';
  // rocketSpeed.value = String(Math.round(game.userRocket.stats().acceleration));
});

trainBtn.addEventListener('click', () => {
  game.rocketGA.train();
  // for (let i = 0; i < 100000/2; i++) {
  //   game.update();
  // }
});

canvas.addEventListener('click', (e) => {
  const leftOffset = canvas.getBoundingClientRect().left;
  const botOffset = scoreboard.getBoundingClientRect().bottom;
  if (addStarModeOn) {
    const x = e.clientX - leftOffset - (starSizeRatio * canvas.width) / 2;
    const y = e.clientY - botOffset - starSizeRatio * canvas.width;
    const position = { x, y };
    game.addStar(position);
  } else if (addMeteoriteModeOn) {
    const x = e.clientX - leftOffset - (meteoriteSizeRatio * canvas.width) / 2;
    const y = e.clientY - botOffset - (meteoriteSizeRatio * canvas.width) / 1.5;
    const position = { x, y };
    game.addMeteorite(position);
  } else if (addBlackholeModeOn) {
    const x = e.clientX - leftOffset - (blackholeSizeRatio * canvas.width) / 2;
    const y = e.clientY - botOffset - (blackholeSizeRatio * canvas.width) / 1.4;
    const position = { x, y };
    game.addBlackhole(position);
    game.genTeleportMap(game.blackholes.length);
  }
});

/*
----------------------------------------------------------------
GAME SETTINGS
----------------------------------------------------------------
*/
// rocketSpeed.value = String(Math.round(game.userRocket.stats().acceleration));
game.userRocket.changeAcceleration(Number(rocketSpeed.value));
// population.value = String(game.rocketGA.populationSize);
game.rocketGA.populationSize = Number(population.value);
moves.value = String(game.rocketGA.moves);
game.rocketGA.moves = Number(moves.value);
// survivalRate.value = String(game.rocketGA.survivalRate);
game.rocketGA.survivalRate = Number(survivalRate.value);
// mutationRate.value = String(game.rocketGA.mutationRate);
game.rocketGA.mutationRate = Number(mutationRate.value);
// starsReward.value = String(game.rocketGA.starsReward);
game.rocketGA.starsReward = Number(starsReward.value);
// healthReward.value = String(game.rocketGA.healthReward);
game.rocketGA.healthReward = Number(healthReward.value);
// stepsReward.value = String(game.rocketGA.stepsReward);
game.rocketGA.stepsReward = Number(stepsReward.value);
// turnReward.value = String(game.rocketGA.turnReward);
game.rocketGA.turnReward = Number(turnReward.value);
// forwardReward.value = String(game.rocketGA.forwardReward);
game.rocketGA.forwardReward = Number(forwardReward.value);

rocketSpeed.addEventListener('change', () => {
  if (Number(rocketSpeed.value) <= 0) return;
  game.userRocket.changeAcceleration(Number(rocketSpeed.value));
});

population.addEventListener('change', () => {
  const n = Number(population.value);
  if (n <= 0) return;
  game.rocketGA.populationSize = n;
});

moves.addEventListener('change', () => {
  const n = Number(moves.value);
  if (n <= 0) return;
  game.rocketGA.moves = n;
});

survivalRate.addEventListener('change', () => {
  const n = Number(survivalRate.value);
  if (n <= 0 || n > 1) return;
  game.rocketGA.survivalRate = n;
});

mutationRate.addEventListener('change', () => {
  const n = Number(mutationRate.value);
  if (n <= 0 || n > 1) return;
  game.rocketGA.mutationRate = n;
});

starsReward.addEventListener('change', () => {
  const n = Number(starsReward.value);
  game.rocketGA.starsReward = n;
});

healthReward.addEventListener('change', () => {
  const n = Number(healthReward.value);
  game.rocketGA.healthReward = n;
});

stepsReward.addEventListener('change', () => {
  const n = Number(stepsReward.value);
  game.rocketGA.stepsReward = n;
});

turnReward.addEventListener('change', () => {
  const n = Number(turnReward.value);
  game.rocketGA.turnReward = n;
});

forwardReward.addEventListener('change', () => {
  const n = Number(forwardReward.value);
  game.rocketGA.forwardReward = n;
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

saveObjBtn.addEventListener('click', () => {
  const stars = game.stars.map((star) => {
    const newX = star.getX() / canvas.width;
    const newY = star.getY() / canvas.height;
    return { x: newX, y: newY };
  });
  const meteorites = game.meteorites.map((meteorite) => {
    const newX = meteorite.getX() / canvas.width;
    const newY = meteorite.getY() / canvas.height;
    return { x: newX, y: newY };
  });
  const blackholes = game.blackholes.map((blackhole) => {
    const newX = blackhole.getX() / canvas.width;
    const newY = blackhole.getY() / canvas.height;
    return { n: newX, y: newY };
  });

  fetch(APIOrigin + '/map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stars,
      meteorites,
      blackholes,
    }),
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      console.log(json.id);
    });
});


    
function genGameMap(
  starsArr: Star[],
  meteoritesArr: Meteorite[],
  blackholesArr: Blackhole[],
) {
  game.reset();
  for (const s of starsArr) {
    const star = {
      x: s.position.x * game.canvasWidth,
      y: s.position.y * game.canvasHeight,
    };
    game.addStar(star);
  }
  for (const m of meteoritesArr) {
    const meteorite = {
      x: m.position.x * game.canvasWidth,
      y: m.position.y * game.canvasHeight,
    };
    game.addMeteorite(meteorite);
  }
  for (const b of blackholesArr) {
    const blackhole = {
      x: b.position.x * game.canvasWidth,
      y: b.position.y * game.canvasHeight,
    };
    game.addBlackhole(blackhole);
  }
  totalScore.textContent = String(starsArr.length);
}
easyMode.addEventListener('click', () => {
  fetch(APIOrigin + '/mode?diff=easy', {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      // console.log(json[0].stars.length);
      genGameMap(json[0].stars, json[0].meteorites, json[0].black_holes);
      mapid = json[0].id;
      console.log(mapid);
      console.log(typeof mapid);
    });
});

normalMode.addEventListener('click', () => {
  fetch(APIOrigin + '/mode?diff=normal', {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      // console.log(json);
      genGameMap(json[0].stars, json[0].meteorites, json[0].black_holes);
      mapid = json[0].id;
    });
});

hardMode.addEventListener('click', () => {
  fetch(APIOrigin + '/mode?diff=hard', {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      // console.log(json);
      genGameMap(json[0].stars, json[0].meteorites, json[0].black_holes);
      mapid = json[0].id;
    });
});
seedBtn.addEventListener('click', () => {
  game.seed();
  // game.startGame();
  const rocketImg = new Image();
  rocketImg.src = './media/rocket_1_static.png';
  rocketImg.style.height = '24px';
  scoreOrRockets.innerHTML = '';
  scoreOrRockets.appendChild(rocketImg);
  aiStats.classList.remove('hidden');
  // aiStats.classList.add('active');
});

// window.addEventListener('resize', () => {
//   canvas.height = window.innerHeight * 0.78;
//   canvas.width = window.innerHeight * 1.8;
// });

function disableAddButtons() {
  const buttons = document.querySelectorAll('button.add-objects')
  buttons.forEach((button) => button.setAttribute('disabled', ''));
}
