/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { degreeToRadian } from './functions.js';
import { Game } from './game.js';
import { Rocket } from './rocket.js';
import { RocketImg } from './rocketImg.js';
import { Move } from './type.js';
let { random, floor } = Math;

export class RocketGA {
  public populationSize = 100;
  public moves = 10;
  private survivalRate = 0.9;
  private mutationRate = 0.1;
  private generation = 0;
  // private mutationAmount = 0.05;
  public stepsBetweenMove = 10;
  public time = 0;
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
    this.time = 0;
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
    const index = this.time / this.stepsBetweenMove;
    if (index === this.moves) {
      this.nextGen();
      return;
    }
    for (const rocket of this.population) {
      if (this.time % this.stepsBetweenMove === 0) {
        rocket.move(index);
      }
      rocket.update(this.time);
    }
    this.time++;
  }

  onDie() {
    this.numAlive--;
    this.game.domElements.currentScore.textContent = String(this.numAlive);
    if (this.numAlive === 0) this.nextGen();
  }

  onFinish() {
    this.numArrived++;
    if (this.numArrived === this.populationSize) this.nextGen();
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
    const numberOfAlive = this.population.filter(
      (rocket) => rocket.alive
    ).length;
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
    let rocket = this.population[0];
    console.log({
      fitness: rocket.getFitness(),
      stars: `${rocket.collectedStars} out of ${this.game.stars.length}`,
      stepsTaken: rocket.getStepsTaken(),
      alive: rocket.alive,
      freeSteps: this.moves * this.stepsBetweenMove - rocket.getStepsTaken(),
    });
  }
}

class RocketAI extends Rocket {
  moves: Move[];
  rocketGA: RocketGA;
  private liveNextRound: boolean;
  public backgroundColor: string;
  // private color: RocketColor;
  private staticImg: ImageData;
  private flyingImg: ImageData;
  constructor(game: Game, rocketGA: RocketGA) {
    super(game);
    this.isUserControlled = false;
    this.rocketGA = rocketGA;
    this.moves = generateMoves(this.rocketGA.moves);
    this.backgroundColor = randomColor();
    // this.color = {
    //   r: floor(random() * 256),
    //   g: floor(random() * 256),
    //   b: floor(random() * 256),
    // };
    this.staticImg = new RocketImg('./media/rocket_1_static.png').imageData;
    this.flyingImg = new RocketImg('./media/rocket_1_flying.png').imageData;
    this.liveNextRound = true;
  }
  move(index: number) {
    /* CONVERT TIMESTAMP TO INDEX IN MOVES */
    if (this.health <= 0 || this.isCollectedAllStars()) {
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

  crossOver(parentA: RocketAI, parentB: RocketAI) {
    // this.crossOverColor(parentA, parentB);
    this.crossOverMove(parentA, parentB);
  }

  crossOverColor(parentA: RocketAI, parentB: RocketAI) {
    let a = parentA.backgroundColor;
    let b = parentB.backgroundColor;
    let n = a.length;
    let color = '#';
    for (let i = 1; i < n; i++) {
      color += randomBool(0.5)
        ? a[i]
        : b[i];
    }
    this.backgroundColor = color;
  }

  crossOverMove(parentA: RocketAI, parentB: RocketAI) {
    let a = parentA.moves;
    let b = parentB.moves;
    let n = a.length;
    let c = this.moves;
    for (let i = 0; i < n; i++) {
      c[i] = randomBool(0.5) ? a[i] : b[i];
    }
  }

  mutate(parent: RocketAI) {
    let color = '#';
    for (let i = 1; i < parent.backgroundColor.length; i++) {
      color += randomBool(0.5)
        ? parent.backgroundColor[i]
        : floor(random() * 16).toString(16);
    }
    this.backgroundColor = color;

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
      (this.game.stars.length - this.stars.size) * 1000 +
      this.health * 20 +
      (this.rocketGA.moves * this.rocketGA.stepsBetweenMove -
        this.getStepsTaken())
    );
  }

  getStepsTaken() {
    return this.finishTime || this.rocketGA.time;
  }

  drawBackground() {
    this.game.ctx.beginPath();
    this.game.ctx.arc(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.getC() / 2.5,
      0,
      2 * Math.PI
    );
    this.game.ctx.fillStyle = this.backgroundColor;
    this.game.ctx.fill();
    this.game.ctx.closePath();
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
