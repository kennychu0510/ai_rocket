/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Swal from 'sweetalert2';
import { ForceField } from './force.js';
import { degreeToRadian, randomBool } from './functions.js';
import { Game } from './game.js';
import { NeuralNetwork } from './neuralNetwork.js';
import { NeuralRocket } from './neuralRocket.js';
import { Rocket } from './rocket.js';
import { RocketAI } from './rocketAI.js';
import { UserRocketImg } from './rocketImg.js';
import { Move, Position } from './type.js';
const { random, floor, round } = Math;

export class RocketTrainer {
  public populationSize = 100;
  public moves = 5000;
  public survivalRate = 0.8;
  public mutationRate = 0.05;
  public generation = 0;
  public ticksBetweenMove = 1;
  public starsReward = 500;
  public healthReward = 1;
  public stepsReward = 0;
  public turnReward = -1;
  public forwardReward = 1;
  public tick = 0;
  public populationGA: RocketAI[] = [];
  public populationNN: NeuralRocket[] = [];
  private game: Game;
  public numArrived = 0;
  public numAlive = 0;
  public bestGenes = '';
  public bestBias = '';
  public bestFitness: number = Number.NEGATIVE_INFINITY;
  public bestStarsCollected = 0;
  public bestMovesUsed = 0;
  public launchRocketAIMode = false;
  public neuralNetworkMode = false;
  public sensors = 4;
  public neutralNetwork = new NeuralNetwork();
  public forcefields: ForceField[];
  public showForces = false;
  constructor(game: Game) {
    this.game = game;
    this.forcefields = [];
    this.makeAllPaths();
  }

  seed() {
    this.populationGA = [];
    if (this.neuralNetworkMode) {
      this.addSeedNN(this.populationSize);
      // this.makeAllPaths();
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
    // console.log(this.forcefields[0]);
  }

  train() {
    this.getPopulation().forEach((rocket) => rocket.reset());
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
    this.evolve();
    this.report();
    this.train();
  }

  update() {
    if (!this.game.startAI || !this.game.gameOnGoing) return;
    const ticksBetweenMove = this.neuralNetworkMode ?
      this.ticksBetweenMove :
      30;
    const index = this.tick / ticksBetweenMove;
    if (index >= this.moves) {
      this.game.stopGame();
      this.game.gameEnd = true;
      if (this.launchRocketAIMode) return;
      this.nextGen();
      return;
    }
    const population = this.getPopulation();
    for (const rocket of population) {
      if (this.tick % ticksBetweenMove === 0) {
        rocket.move(index);
      }
      rocket.update(this.tick);
    }
    if (this.tick % ticksBetweenMove === 0) {
      this.game.domElements.aiStats.querySelector('#ai-move')!.textContent =
        String(index);
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

  getPopulation() {
    if (this.neuralNetworkMode) {
      return this.populationNN;
    } else {
      return this.populationGA;
    }
  }

  draw() {
    if (this.forcefields.length === 0) return;
    if (this.showForces) {
      this.forcefields[0].draw();
    }
    for (const rocket of this.getPopulation()) {
      rocket.draw();
    }
  }

  reset() {
    this.populationGA = [];
    this.populationNN = [];
  }

  evolve() {
    const population = this.getPopulation();
    // Shuffle Array
    for (let i = 0; i < population.length; i++) {
      const a = floor(random() * population.length);
      const b = population[a];
      population[a] = population[i];
      population[i] = b;
    }

    for (let i = 0; i < population.length; i += 2) {
      let rocketA = population[i];
      let rocketB = population[i + 1];

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

  loadRocketAI(genes: number[]) {
    this.reset();
    this.tick = 0;
    this.game.startAI = false;
    this.game.stopGame();

    let rocketAI;
    if (this.neuralNetworkMode) {
      rocketAI = new NeuralRocket(this.game, this);
      this.populationNN.push(rocketAI);
    } else {
      rocketAI = new RocketAI(this.game, this);
      this.populationGA.push(rocketAI);
    }
    rocketAI.genes = genes;
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
    const bestRocketInGen = this.getPopulation().reduce((a, b) => {
      if (a.getFitness() < b.getFitness()) return b;
      return a;
    });

    if (bestRocketInGen.getFitness() > this.bestFitness) {
      this.bestFitness = bestRocketInGen.getFitness();
      this.bestGenes = String(bestRocketInGen.getGenes());
      this.bestStarsCollected = bestRocketInGen.collectedStars;
      this.bestMovesUsed = bestRocketInGen.getStepsTaken();
      this.bestBias = String(bestRocketInGen.getBias());
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
      genes: bestRocketInGen.getGenes(),
    });
  }
}
