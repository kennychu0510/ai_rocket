/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { degreeToRadian } from './functions.js';
import { Game } from './game.js';
import { Rocket } from './rocket.js';
import { RocketImg } from './rocketImg.js';
import { Move } from './type.js';
const { random, floor, round } = Math;

export class RocketGA {
  public populationSize = 100;
  public moves = 500;
  public survivalRate = 0.8;
  public mutationRate = 0.05;
  private generation = 0;
  public tickBetweenMove = 1;
  public tick = 0;
  private population: RocketAI[] = [];
  private game: Game;
  private calledStop = false;
  public numArrived = 0;
  public numAlive = 0;
  constructor(game: Game) {
    this.game = game;
  }

  seed() {
    this.population = [];
    this.addSeed(this.populationSize);
    this.game.domElements.currentScore.textContent = String(
      this.populationSize
    );
    this.game.domElements.totalScore.textContent = String(this.populationSize);
    this.game.domElements.aiStats.querySelector('#total-moves')!.textContent =
      String(this.moves);
    this.tick = 0;
    this.game.startAI = false;
    this.game.stopGame();
  }

  train() {
    this.population.forEach((rocket) => rocket.reset());
    this.game.startGame();
    this.game.startAI = true;
    this.generation++;
    this.game.domElements.aiStats.querySelector(
      '#current-generation'
    )!.textContent = String(this.generation);
    this.numArrived = 0;
    this.numAlive = this.populationSize;
    this.tick = 0;
    this.game.domElements.currentScore.textContent = String(this.numAlive);
  }

  addSeed(n: number) {
    for (let i = 0; i < n; i++) {
      const rocket = new RocketAI(this.game, this);
      this.population.push(rocket);
    }
    // console.log(this.population);
  }

  nextGen() {
    this.game.stopGame();
    this.report();
    this.evolve();
    this.train();
  }

  update() {
    if (!this.game.startAI || !this.game.gameOnGoing) return;
    const index = this.tick / this.tickBetweenMove;
    if (index === this.moves) {
      this.nextGen();
      return;
    }
    for (const rocket of this.population) {
      if (this.tick % this.tickBetweenMove === 0) {
        rocket.move(index);
      }
      rocket.update(this.tick);
    }
    this.tick++;
  }

  onDie() {
    this.numAlive--;
    this.game.domElements.currentScore.textContent = String(this.numAlive);
    if (this.numAlive === 0) this.nextGen();
  }

  onFinish() {
    this.numArrived++;
    if (this.numArrived === this.numAlive) this.nextGen();
  }

  draw() {
    for (const rocket of this.population) {
      rocket.draw();
    }
  }

  reset() {
    this.population = [];
  }

  evolve() {
    for (let i = 0; i < this.population.length; i++) {
      const a = floor(random() * this.population.length);
      const b = this.population[a];
      this.population[a] = this.population[i];
      this.population[i] = b;
    }

    for (let i = 0; i < this.population.length; i += 2) {
      let rocketA = this.population[i];
      let rocketB = this.population[i + 1];

      if (rocketA.getFitness() > rocketB.getFitness()) {
        [rocketA, rocketB] = [rocketB, rocketA];
      }

      if (randomBool(this.survivalRate)) {
        rocketA.crossOver(rocketA, rocketB);
      } else {
        rocketA.mutate(rocketB);
      }
    }
  }

  report() {
    // this.population.sort((a, b) => {
    //   return a.getFitness() - b.getFitness();
    // });
    // for (const [i, rocket] of this.population.entries()) {
    //   console.log({
    //     rocket: i,
    //     fitness: rocket.getFitness(),
    //     stars: `${rocket.collectedStars} out of ${this.game.stars.length}`,
    //     stepsTaken: rocket.getStepsTaken(),
    //     alive: rocket.alive,
    //     freeSteps: this.moves * this.stepsBetweenMove - rocket.getStepsTaken(),
    //   });
    // }
    const bestRocket = this.population.reduce((a, b) => {
      if (a.getFitness() < b.getFitness()) return b;
      return a;
    });
    const rocket = bestRocket;
    console.log({
      fitness: rocket.getFitness(),
      stars: `${rocket.collectedStars} out of ${this.game.stars.length}`,
      stepsTaken: rocket.getStepsTaken(),
      alive: rocket.alive,
      freeSteps: this.moves * this.tickBetweenMove - rocket.getStepsTaken(),
    });
  }
}

class RocketAI extends Rocket {
  moves: Move[];
  rocketGA: RocketGA;
  numOfTurns = 0;
  numOfForward = 0;
  // private color: RocketColor;
  constructor(game: Game, rocketGA: RocketGA) {
    super(game, false);
    this.isUserControlled = false;
    this.rocketGA = rocketGA;
    this.moves = generateMoves(this.rocketGA.moves);
    // this.color = {
    //   r: floor(random() * 256),
    //   g: floor(random() * 256),
    //   b: floor(random() * 256),
    // };
  }
  move(index: number) {
    /* CONVERT TIMESTAMP TO INDEX IN MOVES */
    if (this.health <= 0 || this.isCollectedAllStars()) {
      return;
    }
    const currentMove = this.moves[index];
    switch (currentMove) {
    case Move.none:
      this.numOfForward++;
      break;
    case Move.up:
      this.numOfForward++;
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
      this.numOfTurns++;
      break;
    case Move.right:
      this.angle += this.turn;
      this.numOfTurns++;
      break;
    }
    this.game.domElements.aiStats.querySelector('#ai-move')!.textContent =
      String(index);
  }

  crossOver(parentA: RocketAI, parentB: RocketAI) {
    // this.crossOverColor(parentA, parentB);
    this.crossOverMove(parentA, parentB);
  }

  crossOverColor(parentA: RocketAI, parentB: RocketAI) {
    const a = parentA.color;
    const b = parentB.color;
    const c = this.color;
    c[0] = randomBool(0.5) ? a[0] : b[0];
    c[1] = randomBool(0.5) ? a[1] : b[1];
    c[2] = randomBool(0.5) ? a[2] : b[2];
    this.image_flying.updateImgData();
    this.image_static.updateImgData();
  }

  crossOverMove(parentA: RocketAI, parentB: RocketAI) {
    const a = parentA.moves;
    const b = parentB.moves;
    const n = a.length;
    const c = this.moves;
    for (let i = 0; i < n; i++) {
      c[i] = randomBool(0.5) ? a[i] : b[i];
    }
  }

  mutate(parent: RocketAI) {
    const p = parent.color;
    const c = this.color;
    const r = this.rocketGA.mutationRate;
    if (randomBool(r)) {
      c[0] = floor(random() * 256);
      c[1] = floor(random() * 256);
      c[2] = floor(random() * 256);
      this.image_flying.updateImgData();
      this.image_static.updateImgData();
    } else {
      c[0] = p[0];
      c[1] = p[1];
      c[2] = p[2];
    }

    for (let i = 0; i < this.moves.length; i++) {
      this.moves[i] = randomBool(0.5) ? parent.moves[i] : getMove();
    }
  }

  onFinish() {
    this.rocketGA.onFinish();
  }

  onDie() {
    this.rocketGA.onDie();
  }

  getFitness() {
    return (
      this.getFitnessFromStars() +
      this.getFitnessFromHealth() +
      this.getFitnessFromSteps() +
      this.getFitnessFromAction()
    );
  }

  reset() {
    super.reset();
    this.numOfTurns = 0;
    this.numOfForward = 0;
  }

  getFitnessFromStars() {
    return (this.game.stars.length - this.stars.size) * 500;
  }

  getFitnessFromHealth() {
    return this.health * 1;
  }

  getFitnessFromSteps() {
    return round(this.getStepsTaken() / this.rocketGA.moves) * -1;
  }

  getFitnessFromAction() {
    return this.numOfTurns * -1 + this.numOfForward * 1;
  }

  getStepsTaken() {
    return this.finishTime || this.rocketGA.tick;
  }

  draw() {
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
  return floor(random() * 4); // The maximum is inclusive and the minimum is inclusive
}

function randomColor() {
  return '#' + floor(random() * 16777215).toString(16);
}

// If prob is greater, chance of true is greater
function randomBool(prob: number): boolean {
  return random() < prob;
}

const getMax = (a: number, b: number) => Math.max(a, b);
