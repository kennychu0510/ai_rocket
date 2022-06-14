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
    html: `<pre>After ${game.rocketTrainer.generation} generations...\nFitness: ${game.rocketTrainer.bestFitness}\nStars: ${game.rocketTrainer.bestStarsCollected}/${game.totalStars}\nMoves: ${game.rocketTrainer.bestMovesUsed}</pre>`,
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
          fitness: game.rocketTrainer.bestFitness,
          starsCollected: game.rocketTrainer.bestStarsCollected,
          moves: game.rocketTrainer.bestMovesSet,
          totalMoves: game.rocketTrainer.moves,
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
