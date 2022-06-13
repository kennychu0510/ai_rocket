import { degreeToRadian, randomBool } from './functions.js';
import { Game } from './game.js';
import { Rocket } from './rocket.js';
import { RocketAI, RocketGA } from './rocketGA.js';
import { Move } from './type.js';

const { random, floor } = Math;

export class NeuralRocket extends Rocket {
  weightGenes: number[];
  rocketGA: RocketGA;
  numOfTurns = 0;
  numOfForward = 0;
  constructor(game: Game, rocketGA: RocketGA) {
    super(game);
    this.weightGenes = [];
    this.rocketGA = rocketGA;
    const numOfWeights =
      this.rocketGA.neutralNetwork.outputNodes *
      this.rocketGA.neutralNetwork.inputNodes;
    for (let i = 0; i < this.rocketGA.sensors; i++) {
      for (let j = 0; j < numOfWeights; i++) {
        this.weightGenes.push(random());
      }
    }
  }

  calMove(forces: number[]) {
    if (this.health <= 0 || this.isCollectedAllStars()) {
      return;
    }
    const output = this.rocketGA.neutralNetwork.compute(
      forces,
      this.weightGenes,
    );
    let currentMove;
    if (output[0] < 0.5 && output[1] < 0.5) {
      currentMove = Move.left;
      this.angle -= this.turn;
      this.numOfTurns++;
    } else if (output[0] < 0.5 && output[1] >= 0.5) {
      currentMove = Move.right;
      this.angle += this.turn;
      this.numOfTurns++;
    } else if (output[0] >= 0.5 && output[1] < 0.5) {
      currentMove = Move.up;
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
      currentMove = Move.none;
      this.numOfForward++;
    }
  }

  crossOver(parentA: NeuralRocket, parentB: NeuralRocket) {
    this.crossOverGenes(parentA, parentB);
  }

  crossOverGenes(parentA: NeuralRocket, parentB: NeuralRocket) {
    const a = parentA.weightGenes;
    const b = parentB.weightGenes;
    const n = a.length;
    const c = this.weightGenes;
    for (let i = 0; i < n; i++) {
      c[i] = randomBool(0.5) ? a[i] : b[i];
    }
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

  mutate(parent: NeuralRocket) {
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

    for (let i = 0; i < this.weightGenes.length; i++) {
      this.weightGenes[i] = randomBool(0.5) ? parent.weightGenes[i] : random();
    }
  }
}
