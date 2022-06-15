import { APIOrigin } from './api.js';
import { Blackhole } from './blackhole.js';
import { saveRocketAI } from './events.js';
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
const launchRocketBtn = getDOMElement('#launch-rocket');
const speedUp = getDOMElement('#speed-up') as HTMLInputElement;
const score = getDOMElement('#score');
const rocketAIdropdown = getDOMElement('#select-rocket') as HTMLSelectElement;
const neuralNetworkMode = getDOMElement('#neural-network') as HTMLInputElement;
const showForces = getDOMElement('#show-forces') as HTMLInputElement;

const _scoreboard = document.querySelector('#scoreboard');
if (!_scoreboard) throw new Error('score-board not found');
const scoreboard = _scoreboard as HTMLElement;

/* TIMER */
const timerMilliseconds = getDOMElement('#millisecond');
const timerSeconds = getDOMElement('#second');

/* CANVAS */
const canvasOffset = 10;
canvas.height =
  Math.floor((window.innerHeight * 0.78 - canvasOffset) / 100) * 100;
canvas.width = canvas.height * 2.2;
// console.log(canvas.width, canvas.height);
// console.log('canvas ratio: ' + canvas.width / canvas.height);

/* VARIABLES */
const blackholeSizeRatio = 0.03;
let addStarModeOn = false;
let addMeteoriteModeOn = false;
let addBlackholeModeOn = false;
const gameStarted = false;
// const trackTopBound = boundaryOffset;
// const trackBotBound = canvas.height - boundaryOffset;
// const trackLeftBound = boundaryOffset;
// const trackRightBound = canvas.width - boundaryOffset;

const boundaryOffset = 0;
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

speedUp.checked = false;
neuralNetworkMode.checked = false;
showForces.checked = false;
/* SET UP NEW GAME */
const game = new Game(canvas, gameBoundaries, domElements);

/* RENDER CANVAS */
function animate() {
  requestAnimationFrame(animate);
  game.ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (speedUp.checked) {
    if (!game.startAI) return;
    for (let i = 0; i < 50 * 100 * 30; i++) {
      game.update();
    }
    game.startAI = false;
    saveRocketAI(game, domElements);
  }

  if (!speedUp.checked) {
    game.update();
    game.draw();
  }

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
      resetAllButtons();
      changeButtonModes();
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
  population.setAttribute('disabled', 'disabled');
  moves.setAttribute('disabled', 'disabled');
  game.rocketTrainer.train();
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
    const y = e.clientY - botOffset - (blackholeSizeRatio * canvas.width) / 2;
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
rocketSpeed.value = String(Math.round(game.userRocket.stats().acceleration));
// game.userRocket.changeAcceleration(Number(rocketSpeed.value));
// population.value = String(game.rocketGA.populationSize);
game.rocketTrainer.populationSize = Number(population.value);
moves.value = String(game.rocketTrainer.moves);
game.rocketTrainer.moves = Number(moves.value);
// survivalRate.value = String(game.rocketGA.survivalRate);
game.rocketTrainer.survivalRate = Number(survivalRate.value);
// mutationRate.value = String(game.rocketGA.mutationRate);
game.rocketTrainer.mutationRate = Number(mutationRate.value);
// starsReward.value = String(game.rocketGA.starsReward);
game.rocketTrainer.starsReward = Number(starsReward.value);
// healthReward.value = String(game.rocketGA.healthReward);
game.rocketTrainer.healthReward = Number(healthReward.value);
// stepsReward.value = String(game.rocketGA.stepsReward);
game.rocketTrainer.stepsReward = Number(stepsReward.value);
// turnReward.value = String(game.rocketGA.turnReward);
game.rocketTrainer.turnReward = Number(turnReward.value);
// forwardReward.value = String(game.rocketGA.forwardReward);
game.rocketTrainer.forwardReward = Number(forwardReward.value);

rocketSpeed.addEventListener('change', () => {
  if (Number(rocketSpeed.value) <= 0) return;
  game.userRocket.changeAcceleration(Number(rocketSpeed.value));
});

population.addEventListener('change', () => {
  const n = Number(population.value);
  if (n <= 0) return;
  game.rocketTrainer.populationSize = n;
});

moves.addEventListener('change', () => {
  const n = Number(moves.value);
  if (n <= 0) return;
  game.rocketTrainer.moves = n;
});

survivalRate.addEventListener('change', () => {
  const n = Number(survivalRate.value);
  if (n <= 0 || n > 1) return;
  game.rocketTrainer.survivalRate = n;
});

mutationRate.addEventListener('change', () => {
  const n = Number(mutationRate.value);
  if (n <= 0 || n > 1) return;
  game.rocketTrainer.mutationRate = n;
});

starsReward.addEventListener('change', () => {
  const n = Number(starsReward.value);
  game.rocketTrainer.starsReward = n;
});

healthReward.addEventListener('change', () => {
  const n = Number(healthReward.value);
  game.rocketTrainer.healthReward = n;
});

stepsReward.addEventListener('change', () => {
  const n = Number(stepsReward.value);
  game.rocketTrainer.stepsReward = n;
});

turnReward.addEventListener('change', () => {
  const n = Number(turnReward.value);
  game.rocketTrainer.turnReward = n;
});

forwardReward.addEventListener('change', () => {
  const n = Number(forwardReward.value);
  game.rocketTrainer.forwardReward = n;
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
    return { x: newX, y: newY };
  });

  const blackholeMap = game.teleportMap;

  fetch(APIOrigin + '/map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stars,
      meteorites,
      blackholes,
      blackholeMap,
    }),
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      // console.log(json.msg);
    });
});

function genGameMap(
  starsArr: any[],
  meteoritesArr: any[],
  blackholesArr: any[],
  blackholeMap: number[],
) {
  game.reset();
  for (const s of starsArr) {
    const star = {
      x: s.x * canvas.width,
      y: s.y * canvas.height,
    };
    game.addStar(star);
  }
  for (const m of meteoritesArr) {
    const meteorite = {
      x: m.x * canvas.width,
      y: m.y * canvas.height,
    };
    game.addMeteorite(meteorite);
  }
  for (const b of blackholesArr) {
    const blackhole = {
      x: b.x * canvas.width,
      y: b.y * canvas.height,
    };
    game.addBlackhole(blackhole);
  }
  // console.log(blackholeMap);
  game.teleportMap = blackholeMap;
  // window.prompt('d')
  totalScore.textContent = String(starsArr.length);
}
easyMode.addEventListener('click', () => {
  fetch(APIOrigin + '/mode?diff=easy', {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      // console.log(json[0]);
      genGameMap(
        json[0].stars,
        json[0].meteorites,
        json[0].black_holes,
        json[0].black_hole_map,
      );
      game.mapID = json[0].id;
      // console.log(mapid);
      // console.log(typeof mapid);
    });
  fetch(APIOrigin + '/rocketAI/mapID/1/aiMode/' + getAIMode(), {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      resetRocketAIDropdown();
      json.forEach((rocket: any) => {
        const rocket_ai = document.createElement('option');
        rocket_ai.value = rocket.id;
        rocket_ai.textContent = rocket.name;
        rocketAIdropdown.appendChild(rocket_ai);
      });
    });
});

rocketAIdropdown.addEventListener('change', () => {
  if (rocketAIdropdown.value === '0') return;
  // console.log(rocketAIdropdown.value);
  fetch(APIOrigin + '/rocketAI/id/' + rocketAIdropdown.value, {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((genes) => {
      game.rocketTrainer.loadRocketAI(genes);
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
      genGameMap(
        json[0].stars,
        json[0].meteorites,
        json[0].black_holes,
        json[0].black_hole_map,
      );
      game.mapID = json[0].id;
    });
  fetch(APIOrigin + '/rocketAI/mapID/2/aiMode/' + getAIMode(), {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      // console.log(json);
      resetRocketAIDropdown();
      json.forEach((rocket: any) => {
        const rocket_ai = document.createElement('option');
        rocket_ai.value = rocket.id;
        rocket_ai.textContent = rocket.name;
        rocketAIdropdown.appendChild(rocket_ai);
      });
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
      genGameMap(
        json[0].stars,
        json[0].meteorites,
        json[0].black_holes,
        json[0].black_hole_map,
      );
      game.mapID = json[0].id;
    });
  fetch(APIOrigin + '/rocketAI/mapID/3/aiMode/' + getAIMode(), {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      // console.log(json);
      resetRocketAIDropdown();
      json.forEach((rocket: any) => {
        const rocket_ai = document.createElement('option');
        rocket_ai.value = rocket.id;
        rocket_ai.textContent = rocket.name;
        rocketAIdropdown.appendChild(rocket_ai);
      });
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
  seedBtn.setAttribute('disabled', 'disabled');

  // aiStats.classList.add('active');
});

// window.addEventListener('resize', () => {
//   canvas.height = window.innerHeight * 0.78;
//   canvas.width = window.innerHeight * 1.8;
// });

// loadRocketBtn.addEventListener('click', () => {
//   fetch(APIOrigin + '/rocketAI', {
//     method: 'GET',
//   })
//     .then((res) => res.json())
//     .catch((err) => ({ error: String(err) }))
//     .then((json) => {
//       console.log(json);
//       const moves = json.moves.split('').map(Number)

//     });
// });

launchRocketBtn.addEventListener('click', () => {
  if (rocketAIdropdown.value === '0') return;
  game.rocketTrainer.launchRocketAI();
});

speedUp.addEventListener('change', function() {
  if (speedUp.checked) {
    score.classList.add('invisible');
  } else {
    score.classList.remove('invisible');
  }
});

neuralNetworkMode.addEventListener('change', function() {
  if (neuralNetworkMode.checked) {
    game.rocketTrainer.neuralNetworkMode = true;
  } else {
    game.rocketTrainer.neuralNetworkMode = false;
  }
});

showForces.addEventListener('change', () => {
  if (showForces.checked) {
    game.rocketTrainer.showForces = true;
  } else {
    game.rocketTrainer.showForces = false;
  }
});

/*
----------------------------------------------------------------
FUNCTIONS
----------------------------------------------------------------
*/

function disableAddButtons() {
  const buttons = document.querySelectorAll('button.add-objects');
  buttons.forEach((button) => button.setAttribute('disabled', ''));
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

function resetAllButtons() {
  addMeteoriteModeOn = false;
  addBlackholeModeOn = false;
  addStarModeOn = false;
}

function resetRocketAIDropdown() {
  rocketAIdropdown.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '0';
  defaultOption.textContent = 'Select a Rocket';
  rocketAIdropdown.appendChild(defaultOption);
}

function getAIMode() {
  if (neuralNetworkMode.checked) return 'nn';
  else return 'ga';
}
