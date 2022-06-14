/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Swal from 'sweetalert2';
import { ForceField } from './force.js';
import { degreeToRadian, randomBool } from './functions.js';
import { Game } from './game.js';
import { NeuralNetwork } from './neuralNetwork.js';
import { NeuralRocket } from './neuralRocket.js';
import { Rocket } from './rocket.js';
import { UserRocketImg } from './rocketImg.js';
import { Move, Position } from './type.js';
const { random, floor, round } = Math;

export class RocketTrainer {
  public populationSize = 100;
  public moves = 50;
  public survivalRate = 0.8;
  public mutationRate = 0.05;
  public generation = 0;
  public ticksBetweenMove = 30;
  public starsReward = 500;
  public healthReward = 1;
  public stepsReward = -1;
  public turnReward = -1;
  public forwardReward = 1;
  public tick = 0;
  public populationGA: RocketAI[] = [];
  public populationNN: NeuralRocket[] = [];
  private game: Game;
  public numArrived = 0;
  public numAlive = 0;
  public bestMovesSet = '';
  public bestFitness: number = Number.NEGATIVE_INFINITY;
  public bestStarsCollected = 0;
  public bestMovesUsed = 0;
  public launchRocketAIMode = false;
  public neuralNetworkMode = false;
  public sensors = 4;
  public neutralNetwork = new NeuralNetwork();
  public forcefields: ForceField[];
  constructor(game: Game) {
    this.game = game;
    this.forcefields = [];
    this.makeAllPaths();
  }

  seed() {
    this.populationGA = [];
    if (this.neuralNetworkMode) {
      this.addSeedNN(this.populationSize)
      this.makeAllPaths();
    } else {
      this.addSeedGA(this.populationSize);
    }
    if (!this.launchRocketAIMode) {
      this.game.domElements.currentScore.textContent = String(
        this.populationSize,
      );
      this.game.domElements.totalScore.textContent = String(
        this.populationSize,
      );
      this.game.domElements.aiStats.querySelector('#total-moves')!.textContent =
        String(this.moves);
    }
    this.tick = 0;
    this.game.startAI = false;
    this.game.stopGame();
  }

  makeAllPaths() {
    const starsCombinations: Position[][] = [];
    const allStars = this.game.stars;
    for (let i = 0; i < allStars.length; i++) {
      const newCombination = allStars
        .filter((star, index) => index >= i)
        .map((star) => star.position);
      starsCombinations.push(newCombination);
    }
    const meteoritesPositions = this.game.meteorites.map(
      (meteorite) => meteorite.position,
    );
    for (let i = 0; i < this.game.stars.length; i++) {
      const forceField = new ForceField(
        this.game.canvasWidth,
        this.game.canvasHeight,
        this.game.ctx,
        starsCombinations[i],
        meteoritesPositions,
      );
      forceField.calculate();
      this.forcefields.push(forceField);
    }
  }

  train() {
    this.populationGA.forEach((rocket) => rocket.reset());
    this.game.startGame();
    this.game.startAI = true;
    this.generation++;
    this.game.domElements.aiStats.querySelector(
      '#current-generation',
    )!.textContent = String(this.generation);
    this.numArrived = 0;
    this.numAlive = this.populationSize;
    this.tick = 0;
    this.game.domElements.currentScore.textContent = String(this.numAlive);
  }

  addSeedGA(n: number) {
    for (let i = 0; i < n; i++) {
      const rocket = new RocketAI(this.game, this);
      this.populationGA.push(rocket);
    }
    // console.log(this.population);
  }

  addSeedNN(n: number) {
    for (let i = 0; i < n; i++) {
      const rocket = new NeuralRocket(this.game, this);
      this.populationNN.push(rocket);
    }
  }

  nextGen() {
    this.game.stopGame();
    if (!this.neuralNetworkMode) {
      this.report();
      this.evolve();
    }
    this.train();
  }

  update() {
    if (!this.game.startAI || !this.game.gameOnGoing) return;
    const index = this.tick / this.ticksBetweenMove;
    if (index >= this.moves) {
      this.game.stopGame();
      this.game.gameEnd = true;
      if (this.launchRocketAIMode) return;
      this.nextGen();
      return;
    }
    for (const rocket of this.populationGA) {
      if (this.tick % this.ticksBetweenMove === 0) {
        rocket.move(index);
      }
      rocket.update(this.tick);
    }
    this.tick++;
  }

  onDie() {
    if (this.launchRocketAIMode) {
      this.game.gameEnd = true;
      this.game.stopGame();
    }
    this.numAlive--;
    this.game.domElements.currentScore.textContent = String(this.numAlive);
    if (this.numAlive === 0) this.nextGen();
    if (this.numArrived === this.numAlive) this.nextGen();
  }

  onFinish() {
    this.numArrived++;
    if (this.launchRocketAIMode) {
      this.game.gameEnd = true;
      this.game.stopGame();
    }
    if (this.numArrived === this.numAlive) this.nextGen();
  }

  draw() {
    for (const rocket of this.populationGA) {
      rocket.draw();
    }
  }

  reset() {
    this.populationGA = [];
  }

  /* GENETIC ALGORITHM ONLY */
  evolve() {
    // Shuffle Array
    for (let i = 0; i < this.populationGA.length; i++) {
      const a = floor(random() * this.populationGA.length);
      const b = this.populationGA[a];
      this.populationGA[a] = this.populationGA[i];
      this.populationGA[i] = b;
    }

    for (let i = 0; i < this.populationGA.length; i += 2) {
      let rocketA = this.populationGA[i];
      let rocketB = this.populationGA[i + 1];

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

  /* NEURAL NETWORK */
  learn() {
    for (let i = 0; i < this.populationGA.length; i++) {
      // TODO:
    }
  }

  loadRocketAI(moves: Move[]) {
    this.populationGA = [];
    this.tick = 0;
    this.game.startAI = false;
    this.game.stopGame();

    const rocketAI = new RocketAI(this.game, this);
    rocketAI.moves = moves;
    this.populationGA.push(rocketAI);
  }

  launchRocketAI() {
    this.launchRocketAIMode = true;
    this.game.startGame();
    this.game.startAI = true;
    this.numArrived = 0;
    this.numAlive = this.populationSize;
    this.tick = 0;
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
    const bestRocketInGen = this.populationGA.reduce((a, b) => {
      if (a.getFitness() < b.getFitness()) return b;
      return a;
    });

    if (bestRocketInGen.getFitness() > this.bestFitness) {
      this.bestFitness = bestRocketInGen.getFitness();
      this.bestMovesSet = bestRocketInGen.moves.join('');
      this.bestStarsCollected = bestRocketInGen.collectedStars;
      this.bestMovesUsed = bestRocketInGen.getStepsTaken();
      console.log('new best rocket ', {
        bestfitness: this.bestFitness,
        starsCollected: this.bestStarsCollected,
      });
    }

    console.log({
      generation: this.generation,
      fitness: bestRocketInGen.getFitness(),
      stars: `${bestRocketInGen.collectedStars} out of ${this.game.stars.length}`,
      stepsTaken: bestRocketInGen.getStepsTaken(),
      alive: bestRocketInGen.alive,
      freeSteps: this.moves - bestRocketInGen.getStepsTaken(),
      moves: bestRocketInGen.moves,
    });
  }
}

export class RocketAI extends Rocket {
  moves: Move[];
  rocketGA: RocketTrainer;
  numOfTurns = 0;
  numOfForward = 0;

  // private color: RocketColor;
  constructor(game: Game, rocketGA: RocketTrainer) {
    super(game, false);
    this.isUserControlled = false;
    this.rocketGA = rocketGA;
    this.moves = generateMoves(this.rocketGA.moves);
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
    return (
      (this.game.stars.length - this.stars.size) * this.rocketGA.starsReward
    );
  }

  getFitnessFromHealth() {
    return this.health * this.rocketGA.healthReward;
  }

  getFitnessFromSteps() {
    return (
      round(this.getStepsTaken() / this.rocketGA.moves) *
      this.rocketGA.stepsReward
    );
  }

  getFitnessFromAction() {
    return (
      this.numOfTurns * this.rocketGA.turnReward +
      this.numOfForward * this.rocketGA.forwardReward
    );
  }

  getStepsTaken() {
    return (
      round(this.finishTime / this.rocketGA.ticksBetweenMove) ||
      round(this.rocketGA.tick / this.rocketGA.ticksBetweenMove)
    );
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

const getMax = (a: number, b: number) => Math.max(a, b);
