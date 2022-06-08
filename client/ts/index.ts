
import Swal from 'sweetalert2'
import { APIOrigin } from './api.js';
import { getDOMElement } from './functions.js';
import { Game } from './game.js';
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
const rankingsBtn = getDOMElement('#rankings');
const boundaryModeBtn = getDOMElement('#boundary-mode');

const _scoreboard = document.querySelector('#scoreboard');
if (!_scoreboard) throw new Error('score-board not found');
const scoreboard = _scoreboard as HTMLElement;

/* TIMER */
const timerMilliseconds = getDOMElement('#millisecond');
const timerSeconds = getDOMElement('#second');

/* CANVAS */
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

/* VARIABLES */
const starSize = 20;

const boundaryOffset = 20;
// const trackTopBound = boundaryOffset;
// const trackBotBound = canvas.height - boundaryOffset;
// const trackLeftBound = boundaryOffset;
// const trackRightBound = canvas.width - boundaryOffset;

const gameBoundaries: GameBoundary = {
  top: boundaryOffset,
  bot: window.innerHeight - 100 - boundaryOffset,
  left: boundaryOffset,
  right: window.innerWidth - boundaryOffset,
};

/* SET UP NEW GAME */
const game = new Game(canvas, gameBoundaries);

// Generate the grid

/* RENDER CANVAS */
function animate() {
  requestAnimationFrame(animate);
  game.ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* CHECK IF ALL STARS COLLECTED */
  if (game.totalStars === game.rocket.collectedStars && game.gameStarted) {
    game.statusMessage.updateMsg('Well Done!');
    game.rocket.stop();
    const endTime = new Date();
    console.log(`time taken: ` + (+endTime - +game.startTime) / 1000);
    game.gameStarted = false;
    Swal.fire({
      title: 'Submit your Name!',
      input: 'text',
      text: 'Your Time: ' + `${timerSeconds.textContent + '.'}` + `${timerMilliseconds.textContent}`,
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        return fetch(`//api.github.com/users/${login}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText)
            }
            return response.json()
          })
          .catch(error => {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          })
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `${result.value.login}'s avatar`,
          imageUrl: result.value.avatar_url
        })
      }
    })
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

rankingsBtn.addEventListener('click', () => {
  
  Swal.fire(`<table>
  <thead>
      <tr>
          <th></th>
          <th>Column 2</th>
      </tr>
  </thead>
  <tbody>
      <tr>
          <td>Row 1 Data 1</td>
          <td>Row 1 Data 2</td>
      </tr>
      <tr>
          <td>Row 2 Data 1</td>
          <td>Row 2 Data 2</td>
      </tr>
  </tbody>
  </table>
  `)

});
     
// })





