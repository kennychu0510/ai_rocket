import { degreeToRadian, randomBool } from './functions.js';
import { Game } from './game.js';
import { NeuralRocket } from './neuralRocket.js';
import { Rocket } from './rocket.js';
import { RocketTrainer } from './rocketTrainer.js';
import { Move } from './type.js';
const { random, floor, round } = Math;

export class RocketAI extends Rocket {
  genes: number[];
  rocketTrainer: RocketTrainer;
  numOfTurns = 0;
  numOfForward = 0;
  bias: number[];
  public isBest = false;
  cellsTraveled = new Map<number, number>();

  // private color: RocketColor;
  constructor(game: Game, rocketTrainer: RocketTrainer) {
    super(game, false);
    this.isUserControlled = false;
    this.rocketTrainer = rocketTrainer;
    this.genes = generateMoves(this.rocketTrainer.moves);
    this.bias = [0];
  }
  move(index: number) {
    /* CONVERT TIMESTAMP TO INDEX IN MOVES */
    if (this.health <= 0 || this.isCollectedAllStars()) {
      return;
    }
    const currentMove = this.genes[index];
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
    const travelIndex = this.getCurrentPositionIndex();
    let cell = this.cellsTraveled.get(index);
    if (!cell) {
      this.cellsTraveled.set(index, 1);
    } else {
      this.cellsTraveled.set(index, cell++);
    }
  }

  crossOver(parentA: RocketAI, parentB: RocketAI) {
    // this.crossOverColor(parentA, parentB);
    this.crossOverGenes(parentA, parentB);
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

  crossOverGenes(parentA: RocketAI, parentB: RocketAI) {
    const a = parentA.genes;
    const b = parentB.genes;
    const n = a.length;
    const c = this.genes;
    for (let i = 0; i < n; i++) {
      c[i] = randomBool(0.5) ? a[i] : b[i];
    }
  }

  mutate(parent: RocketAI) {
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

    for (let i = 0; i < this.genes.length; i++) {
      this.genes[i] = randomBool(0.5) ? parent.genes[i] : getMove();
    }
  }

  onFinish() {
    this.rocketTrainer.onFinish();
  }

  onDie() {
    this.rocketTrainer.onDie();
  }

  getFitness() {
    return (
      this.getFitnessFromStars() +
      this.getFitnessFromHealth() +
      this.getFitnessFromSteps() +
      this.getFitnessFromAction() +
      this.getFitnessFromCellsTraveled()
    );
  }

  reset() {
    super.reset();
    this.numOfTurns = 0;
    this.numOfForward = 0;
  }

  getFitnessFromStars() {
    return this.collectedStars * this.rocketTrainer.starsReward;
  }

  getFitnessFromHealth() {
    return this.health * this.rocketTrainer.healthReward;
  }

  getFitnessFromSteps() {
    // if (this instanceof NeuralRocket)
    return this.cellsTraveled.size * this.rocketTrainer.stepsReward;
    // return (
    //   round(this.getStepsTaken() / this.rocketTrainer.moves) *
    //   this.rocketTrainer.stepsReward
    // );
  }

  getFitnessFromAction() {
    return (
      this.numOfTurns * this.rocketTrainer.turnReward +
      this.numOfForward * this.rocketTrainer.forwardReward
    );
  }

  getFitnessFromCellsTraveled() {
    if (this instanceof NeuralRocket) {
      let brightness = 0;
      this.cellsTraveled.forEach((value) => {
        brightness += value;
      });
      const avgBrightness = Math.floor(
        (brightness = brightness / this.cellsTraveled.size) *
          this.rocketTrainer.brightnessReward,
      );
      // console.log(avgBrightness)
      return avgBrightness;
    }
    return 0;
  }

  getStepsTaken() {
    return this.cellsTraveled.size;
  }

  getGenes() {
    return this.genes;
  }

  getBias() {
    return this.bias;
  }

  drawImage() {
    const image = this.flyingTimeout ? this.image_flying : this.image_static;
    this.game.ctx.drawImage(
      this.isBest ? image.srcImage : image.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }
  getCurrentPositionIndex() {
    const x = Math.floor(this.position.x / 20);
    const y = Math.floor(this.position.y / 20);
    const i = y * 20 + x;
    return i;
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
