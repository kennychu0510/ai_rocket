/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { degreeToRadian } from './functions.js';
import { Game } from './game.js';
import { Rocket } from './rocket.js';
import { RocketImg } from './rocketImg.js';
import { Move, RocketColor } from './type.js';

export class RocketGA {
  public populationSize = 100;
  public moves = 50;
  private survivalRate = 0.9;
  private mutationRate = 0.1;
  private generation = 0;
  // private mutationAmount = 0.05;
  public timeBetweenMove = 10;
  public time = 0;
  private population: RocketAI[] = [];
  private game: Game;
  private calledStop = false;
  constructor(game: Game) {
    this.game = game;
  }

  seed() {
    this.population = [];
    this.addSeed(this.populationSize);
    this.game.domElements.currentScore.textContent = String(
      this.populationSize,
    );
    this.game.domElements.totalScore.textContent = String(this.populationSize);
    this.game.domElements.aiStats.querySelector('#total-moves')!.textContent =
      String(this.moves);
  }

  train() {
    this.game.startAI = true;
    this.game.gameOnGoing = true;
    this.game.startTime = new Date();
    this.generation++;
    this.game.domElements.aiStats.querySelector(
      '#current-generation',
    )!.textContent = String(this.generation);
  }

  addSeed(n: number) {
    for (let i = 0; i < n; i++) {
      const rocket = new RocketAI(this.game, this);
      this.population.push(rocket);
    }
    // console.log(this.population);
  }

  update() {
    if (!this.game.startAI || !this.game.gameOnGoing) return;
    let aliveRockets = 0;
    const index = this.time / this.timeBetweenMove;
    if (index === this.moves) {
      this.game.stopGame();
    }
    if (index > this.moves) {
      return;
    }
    if (
      this.population.filter((rocket) => rocket.collectedAllStars).length ===
      this.populationSize
    ) {
      if (this.calledStop) return;
      this.game.stopGame();
      this.calledStop = true;
      return;
    }

    for (const rocket of this.population) {
      if (this.time % this.timeBetweenMove === 0) {
        if (rocket.collectedAllStars) continue;
        rocket.move(index);
      }
      rocket.update(this.time);
      if (rocket.alive) {
        aliveRockets++;
      }
    }
    if (aliveRockets === 0) {
      this.game.stopGame();
      return;
    }

    this.time++;
  }

  updateAliveCount() {
    this.game.domElements.currentScore.textContent = String(
      this.population.filter((rocket) => rocket.alive).length,
    );
  }

  draw() {
    for (const rocket of this.population) {
      rocket.draw();
    }
  }

  reset() {
    this.population = [];
  }

  select() {
    const numberOfAlive = this.population.filter(
      (rocket) => rocket.alive,
    ).length;
    let numberOfSurviving = numberOfAlive;
    if (numberOfAlive / this.population.length >= this.survivalRate) {
      numberOfSurviving = this.population.length * this.survivalRate;
    }
    console.log(numberOfSurviving);
  }
  report() {
    this.population.sort((a, b) => {
      return a.getFitness() - b.getFitness();
    });
    for (const [i, rocket] of this.population.entries()) {
      console.log({
        rocket: i,
        fitness: rocket.getFitness(),
        stars: `${rocket.collectedStars} out of ${this.game.stars.length}`,
        stepsTaken: rocket.getStepsTaken(),
        alive: rocket.alive,
      });
    }
    this.select();
  }
}

class RocketAI extends Rocket {
  moves: Move[];
  rocketGA: RocketGA;
  private backgroundColor: string;
  // private color: RocketColor;
  private staticImg: ImageData;
  private flyingImg: ImageData;
  constructor(game: Game, rocketGA: RocketGA) {
    super(game);
    this.rocketGA = rocketGA;
    this.moves = generateMoves(this.rocketGA.moves);
    this.backgroundColor = randomColor();
    // this.color = {
    //   r: Math.floor(Math.random() * 256),
    //   g: Math.floor(Math.random() * 256),
    //   b: Math.floor(Math.random() * 256),
    // };
    this.staticImg = new RocketImg('./media/rocket_1_static.png').imageData;
    this.flyingImg = new RocketImg('./media/rocket_1_flying.png').imageData;
  }
  move(index: number) {
    /* CONVERT TIMESTAMP TO INDEX IN MOVES */
    if (this.health <= 0) {
      return;
    }
    const currentMove = this.moves[index];
    switch (currentMove) {
    case Move.none:
      break;
    case Move.up:
      {
        const x_direction =
            this.acceleration * Math.sin(degreeToRadian(this.angle));
        const y_direction =
            -this.acceleration * Math.sin(degreeToRadian(90 - this.angle));
        this.velocity.x = x_direction;
        this.velocity.y = y_direction;
        this.flyingTimeout = 10;
      }
      break;
    case Move.left:
      this.angle -= this.turn;
      break;
    case Move.right:
      this.angle += this.turn;
      break;
    }
    this.game.domElements.aiStats.querySelector('#ai-move')!.textContent =
      String(index);
  }

  onDie() {
    this.rocketGA.updateAliveCount();
  }

  getFitness() {
    return (
      (this.game.stars.length - this.stars.size) * 100 +
      this.health * 20 +
      this.getStepsTaken() * -1
    );
  }

  getStepsTaken() {
    return this.finishTime || this.rocketGA.time;
  }

  draw() {
    this.game.ctx.beginPath();
    this.game.ctx.arc(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.getC() / 2.5,
      0,
      2 * Math.PI,
    );
    this.game.ctx.fillStyle = this.backgroundColor;
    this.game.ctx.fill();
    this.game.ctx.closePath();
    this.game.ctx.save();
    this.game.ctx.fillStyle = this.backgroundColor;
    super.draw();

    // let image;
    // if (this.flyingTimeout > 0) {
    //   image = this.flyingImg;
    // } else {
    //   image = this.staticImg;
    // }
    // this.game.ctx.putImageData(image, this.position.x, this.position.y);
    // this.game.ctx.restore();

    // this.game.ctx.save();
    // const imageData = this.game.ctx.getImageData(0, 0, this.game.canvasWidth, this.game.canvasHeight);
    // let i = 0;
    // const R = 0;
    // const G = 1;
    // const B = 2;
    // const A = 3;
    // for (let y = 0; y < this.game.canvasHeight; y++) {
    //   for (let x = 0; x < this.game.canvasWidth; x++) {
    //     const a = imageData.data[i + A];
    //     if (a != 0) {
    //       imageData.data[i + R] = this.color.r;
    //       imageData.data[i + G] = this.color.g;
    //       imageData.data[i + B] = this.color.b;
    //       // imageData.data[i + A] = randomA;
    //     }
    //     i += 4;
    //   }
    // }
    // this.game.ctx.putImageData(imageData, 0, 0);
    // this.game.ctx.restore();
  }
}

// type Move = number // 0 = none, 1 = up, 2 = left, 3 = right

function generateMoves(steps: number) {
  const listOfMoves: Move[] = [];
  for (let i = 0; i < steps; i++) {
    listOfMoves.push(getMove());
  }
  return listOfMoves;
}

function getMove() {
  return Math.floor(Math.random() * 4); // The maximum is inclusive and the minimum is inclusive
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
