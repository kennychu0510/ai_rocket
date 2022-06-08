/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { degreeToRadian } from './functions.js';
import { Game } from './game.js';
import { Rocket } from './rocket.js';
import { RocketImg } from './rocketImg.js';
import { RocketColor } from './type.js';

export class RocketGA {
  public populationSize = 20;
  public tickStep = 50;
  private survivalRate = 0.9;
  private mutationRate = 0.1;
  private mutationAmount = 0.05;
  public timeBetweenMove = 10;
  private time = 0;
  private population: RocketAI[] = [];
  private game: Game;
  constructor(game: Game) {
    this.game = game;
  }

  seed() {
    this.population = [];
    this.addSeed(this.populationSize);
    this.time = 0;
    this.game.domElements.currentScore.textContent = String(this.populationSize);
    this.game.domElements.totalScore.textContent = String(this.populationSize);
    this.game.domElements.aiStats.querySelector('#total-moves')!.textContent = String(this.tickStep);
  }

  addSeed(n: number) {
    for (let i = 0; i < n; i++) {
      this.population.push(new RocketAI(this.game, this));
    }
    // console.log(this.population);
  }

  update() {
    if (!this.game.gameStarted) return;
    let aliveRockets = 0;
    const index = this.time / this.timeBetweenMove;
    if (index === this.tickStep) {
      this.game.stopGame();
    }
    if (index > this.tickStep) {
      return;
    }

    for (const rocket of this.population) {
      if (this.time % this.timeBetweenMove === 0) {
        rocket.move(index);
      }
      rocket.update();
      if (rocket.survive) {
        aliveRockets++;
      }
    }
    this.game.domElements.currentScore.textContent = String(aliveRockets);
    this.time++;
  }

  draw() {
    for (const rocket of this.population) {
      rocket.draw();
    }
  }

  reset() {
    this.population = [];
  }
  // evaluate() {

  // }

  // select() {
  //   const numberOfSurviving = this.population.length * this.survivalRate;

  // }
  report() {
    for (const [i, rocket] of this.population.entries()) {
      console.log(`rocket-${i}`, rocket.fitness);
    }
  }
}

class RocketAI extends Rocket {
  fitness: number;
  survive: boolean;
  moves: Move[];
  rocketGA: RocketGA;
  private backgroundColor: string;
  // private color: RocketColor;
  private staticImg: ImageData;
  private flyingImg: ImageData;
  constructor(game: Game, rocketGA: RocketGA) {
    super(game);
    this.rocketGA = rocketGA;
    this.fitness = 0;
    this.survive = true;
    this.moves = generateMoves(this.rocketGA.tickStep);
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
    this.game.domElements.aiStats.querySelector('#ai-move')!.textContent = String(index);
  }

  reduceHealth() {
    super.reduceHealth();
    if (this.health <= 0) {
      this.survive = false;
    }
  }

  update() {
    const currentStars = this.collectedStars;
    const currentHealth = this.health;
    super.update();
    if (this.collectedStars > currentStars) {
      this.fitness += 100;
    }
    if (this.health < currentHealth) {
      this.fitness -= 20;
    }
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

export enum Move {
  // eslint-disable-next-line no-unused-vars
  none = 0,
  // eslint-disable-next-line no-unused-vars
  up = 1,
  // eslint-disable-next-line no-unused-vars
  left = 2,
  // eslint-disable-next-line no-unused-vars
  right = 3,
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
