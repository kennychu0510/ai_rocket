import { Game } from './game.js';
import { gameDOMelements } from './type.js';
import Swal from 'sweetalert2';
import { APIOrigin } from './api.js';

/* CHECK IF ALL STARS COLLECTED */
export function showRecordScoreForm(game: Game, domElements: gameDOMelements) {
  if (game.totalStars === game.userRocket.collectedStars) {
    // game.statusMessage.updateMsg('Well Done!');
    // game.userRocket.stop();
    // const endTime = new Date();
    // console.log(`time taken: ` + (+endTime - +game.startTime) / 1000);
    const timeTaken =
      `${domElements.timerSeconds.textContent + '.'}` +
      `${domElements.timerMilliseconds.textContent}`;
    Swal.fire({
      title: 'Submit your Name!',
      input: 'text',
      text: 'Your Time: ' + timeTaken,
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        return fetch(APIOrigin + '/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: game.mapID,
            user: login,
            timeTaken,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .catch((error) => {
            Swal.showValidationMessage(`Request failed: ${error}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Your record has been saved!',
          imageUrl: './media/champion.png',
        });
      }
    });
  }
}

export function saveRocketAI(game: Game, domElements: gameDOMelements) {
  Swal.fire({
    title: `Save your best rocket?`,
    input: 'text',
    html: `<pre>After ${game.rocketGA.generation} generations...\nFitness: ${game.rocketGA.bestFitness}\nStars: ${game.rocketGA.bestStarsCollected}/${game.totalStars}\nMoves: ${game.rocketGA.bestMovesUsed}</pre>`,
    inputAttributes: {
      autocapitalize: 'off',
    },
    inputPlaceholder: 'Name your rocket AI',
    showCancelButton: true,
    confirmButtonText: 'Save',
    showLoaderOnConfirm: true,
    preConfirm: (name) => {
      return fetch(APIOrigin + `/rocketAI`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapID: game.mapID,
          name,
          fitness: game.rocketGA.bestFitness,
          starsCollected: game.rocketGA.bestStarsCollected,
          moves: game.rocketGA.bestMovesSet,
          totalMoves: game.rocketGA.moves,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .catch((error) => {
          Swal.showValidationMessage(`Request failed: ${error}`);
        });
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: `Your rocket is saved and ready to launch`,
        imageUrl: './media/rocket_launch.gif',
      });
    }
  });
}


export function saveMap(game: Game){
  const stars = game.stars.map((star) => {
    const newX = star.getX() / game.canvasWidth;
    const newY = star.getY() / game.canvasHeight;
    return { x: newX, y: newY };
  });
  const meteorites = game.meteorites.map((meteorite) => {
    const newX = meteorite.getX() / game.canvasWidth;
    const newY = meteorite.getY() / game.canvasHeight;
    return { x: newX, y: newY };
  });
  const blackholes = game.blackholes.map((blackhole) => {
    const newX = blackhole.getX() / game.canvasWidth;
    const newY = blackhole.getY() / game.canvasHeight;
    return { x: newX, y: newY };
  });

  const blackholeMap = game.teleportMap;

  Swal.fire({
    title: 'Submit your map name',
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Save',
    showLoaderOnConfirm: true,
    preConfirm: (name: string) => {
      return fetch(APIOrigin + '/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars,
          meteorites,
          blackholes,
          blackholeMap,
          name,
    }),
      })
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
        title: `Your map saved successfully`,
        imageUrl: './media/save-map.gif'
      })
    }
  })
}
