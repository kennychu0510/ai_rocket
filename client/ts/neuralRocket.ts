import { ForceField } from './force.js';
import { degreeToRadian, randomBool } from './functions.js';
import { Game } from './game.js';
import { Rocket } from './rocket.js';
import { RocketAI } from './rocketAI.js';
import { RocketTrainer } from './rocketTrainer.js';
import { Move } from './type.js';

const { random, floor } = Math;

export class NeuralRocket extends RocketAI {
  genes: number[];
  bias: number[];
  forceField: ForceField;
  rocketTrainer: RocketTrainer;
  numOfTurns = 0;
  numOfForward = 0;

  constructor(game: Game, rocketTrainer: RocketTrainer) {
    super(game, rocketTrainer);
    this.genes = [];
    this.bias = [];
    this.rocketTrainer = rocketTrainer;
    const numOfWeights =
      this.rocketTrainer.neutralNetwork.outputNodes *
      this.rocketTrainer.neutralNetwork.inputNodes;
    for (let i = 0; i < numOfWeights; i++) {
      this.genes.push(random() * 2 - 1);
    }
    for (let i = 0; i < this.rocketTrainer.neutralNetwork.outputNodes; i++) {
      this.bias.push(random() * 2 - 1);
    }
    const stars = this.stars.map((star) => star.position);
    const meteorites = this.game.meteorites.map(
      (meteorite) => meteorite.position,
    );
    this.forceField = new ForceField(
      this.game.canvasWidth,
      this.game.canvasHeight,
      this.game.ctx,
      stars,
      meteorites,
    );
  }
  /* Take in force from four directions */
  move1() {
    if (this.health <= 0 || this.isCollectedAllStars()) {
      return;
    }
    let forces = this.rocketTrainer.forcefields[0].getNeighborForces(
      this.position.x,
      this.position.y,
      this.angle,
    );
    console.log(forces);
    if (forces[0] === forces[1]) {
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
    } else {
      forces = this.rocketTrainer.neutralNetwork.compute(
        forces,
        this.genes,
        this.bias,
      );
      if (forces[0] > forces[1]) {
        this.angle -= this.turn;
        this.numOfTurns++;
      } else {
        this.angle += this.turn;
        this.numOfTurns++;
      }
    }
  }

  move() {
    if (this.health <= 0 || this.isCollectedAllStars()) {
      return;
    }
    let forces = this.forceField.getNeighborForces(
      this.position.x,
      this.position.y,
      this.angle,
    );
    forces = this.rocketTrainer.neutralNetwork.compute(
      forces,
      this.genes,
      this.bias,
    );
    // console.log(forces);

    if (forces[0] > 0.5) {
      this.angle -= this.turn;
      this.numOfTurns++;
    } else if (forces[0] < -0.5) {
      this.angle += this.turn;
      this.numOfTurns++;
    } else {
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
    }
  }

  crossOver(parentA: NeuralRocket, parentB: NeuralRocket) {
    this.crossOverGenes(parentA, parentB);
  }

  crossOverGenes(parentA: NeuralRocket, parentB: NeuralRocket) {
    const a = parentA.genes;
    const aBias = parentA.bias;
    const b = parentB.genes;
    const bBias = parentB.bias;
    const n = a.length;
    const nBiasLength = aBias.length;
    const c = this.genes;
    const cBias = this.bias;
    const mutate = randomBool(0.5);
    for (let i = 0; i < n; i++) {
      c[i] = mutate ? a[i] : b[i];
    }
    for (let i = 0; i < nBiasLength; i++) {
      cBias[i] = mutate ? aBias[i] : bBias[i];
    }
  }

  mutate(parent: NeuralRocket) {
    const p = parent.color;
    const c = this.color;
    const r = this.rocketTrainer.mutationRate;
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
    const mutate = randomBool(0.5);
    for (let i = 0; i < this.genes.length; i++) {
      this.genes[i] = mutate ? parent.genes[i] : random();
    }
    for (let i = 0; i < this.bias.length; i++) {
      this.bias[i] = mutate ? parent.bias[i] : random();
    }
  }

  getGenes() {
    return this.genes;
  }

  calForceField() {
    const starsPostion = this.stars.map((star) => star.position);
    this.forceField.updateStars(starsPostion);
  }

  checkStarCollection(time: number) {
    super.checkStarCollection(time);
    this.calForceField();
  }
}
