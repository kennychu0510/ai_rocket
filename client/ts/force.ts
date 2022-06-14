import { getDOMElement, sigmoid } from './functions.js';
import { Position } from './type';

const canvas = getDOMElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.height = Math.floor((window.innerHeight * 0.78) / 100) * 100;
canvas.width = canvas.height * 2.2;

/* TEST */
const stars = [
  { x: 100, y: 100 },
  { x: 800, y: 140 },
  { x: 400, y: 400 },
];

const meteorites = [
  { x: 140, y: 100 },
  { x: 600, y: 200 },
  { x: 900, y: 300 },
];

export class ForceField {
  public force: number[][];
  public horizontalGradient: number[][];
  public verticalGradient: number[][];
  public stars: Position[];
  private meteorites: Position[];
  private blockSize = 20;
  private horBlocks = 0;
  private verBlocks = 0;
  private maxValue = 255;
  private minValue = -255;
  private fieldMode = true;
  private factor = 256;
  private ctx: CanvasRenderingContext2D;
  constructor(
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    stars: Position[],
    meteorites: Position[],
  ) {
    this.horBlocks = width / this.blockSize;
    this.verBlocks = height / this.blockSize;
    this.force = new Array(this.horBlocks)
      .fill(0)
      .map(() => new Array(this.verBlocks).fill(0));
    this.horizontalGradient = new Array(this.horBlocks)
      .fill(0)
      .map(() => new Array(this.verBlocks).fill(0));
    this.verticalGradient = new Array(this.horBlocks)
      .fill(0)
      .map(() => new Array(this.verBlocks).fill(0));
    this.ctx = ctx;
    this.stars = stars;
    this.meteorites = meteorites;
  }

  calculate() {
    // for (const star of this.stars) {
    //   this.force[Math.floor(star.x / this.blockSize)][
    //     Math.floor(star.y / this.blockSize)
    //   ] = this.maxValue;
    // }
    // for (const meteorite of this.meteorites) {
    //   this.force[Math.floor(meteorite.x / this.blockSize)][
    //     Math.floor(meteorite.y / this.blockSize)
    //   ] = this.minValue;
    // }
    const G = 100;
    if (this.fieldMode) {
      for (let i = 0; i < this.horBlocks; i++) {
        for (let j = 0; j < this.verBlocks; j++) {
          let value = 0;
          for (const star of this.stars) {
            const dx = Math.floor(star.x / this.blockSize) - i;
            const dy = Math.floor(star.y / this.blockSize) - j;
            const r2 = dx * dx + dy * dy + 1;
            value += G / r2;
          }

          for (const meteorite of this.meteorites) {
            const dx = Math.floor(meteorite.x / this.blockSize) - i;
            const dy = Math.floor(meteorite.y / this.blockSize) - j;
            const r2 = dx * dx + dy * dy + 1;
            value += -G / r2;
          }
          value = (1 / (1 + Math.exp(-value))) * 2 - 1;
          this.force[i][j] = value;
        }
      }
    }
    for (let i = 0; i < this.horBlocks; i++) {
      for (let j = 0; j < this.verBlocks; j++) {
        let top = j - 1;
        let bottom = j + 1;
        let left = i - 1;
        let right = i + 1;

        /* CHECK IF NEIGHBORS IS OUT OF BOUNDARY */
        if (left < 0) left = i;
        if (right >= this.horBlocks) right = i;
        if (top < 0) top = j;
        if (bottom >= this.verBlocks) bottom = j;

        const horGrad = (this.force[right][j] - this.force[left][j]) / 2;
        const verGrad = (this.force[i][top] - this.force[i][bottom]) / 2;
        this.horizontalGradient[i][j] = horGrad;
        this.verticalGradient[i][j] = verGrad;
      }
    }
  }

  /* Return Neighbor Forces Normalized */
  getNeighborForces(x: number, y: number, direction: number) {
    const row = Math.floor(x / this.blockSize);
    const col = Math.floor(y / this.blockSize);
    const forces = [];
    let forwardLeftForce = 0;
    let forwardRightForce = 0;
    const myForce = this.force[row][col];
    const rightBoundary = this.horBlocks;
    const bottomBoundary = this.verBlocks;
    switch ((direction - 45 + 360) % 360) {
    case 0:
      forwardLeftForce = this.force[validRow(row, -1)][validCol(col, -1)];
      forwardRightForce = this.force[validRow(row, -1)][validCol(col, +1)];
      break;
    case 45:
      forwardLeftForce = this.force[validRow(row, -1)][col];
      forwardRightForce = this.force[row][validCol(col, +1)];
      break;
    case 90:
      forwardLeftForce = this.force[validRow(row, -1)][validCol(col, +1)];
      forwardRightForce = this.force[validRow(row, +1)][validCol(col, +1)];
      break;
    case 135:
      forwardLeftForce = this.force[row][validCol(col, +1)];
      forwardRightForce = this.force[validRow(row, +1)][col];
      break;
    case 180:
      forwardLeftForce = this.force[validRow(row, +1)][validCol(col, +1)];
      forwardRightForce = this.force[validRow(row, +1)][validCol(col, -1)];
      break;
    case 225:
      forwardLeftForce = this.force[validRow(row, +1)][col];
      forwardRightForce = this.force[row][validCol(col, -1)];
      break;
    case 270:
      forwardLeftForce = this.force[validRow(row, +1)][validCol(col, -1)];
      forwardRightForce = this.force[validRow(row, -1)][validCol(col, -1)];
      break;
    case 315:
      forwardLeftForce = this.force[row][validCol(col, -1)];
      forwardRightForce = this.force[validRow(row, -1)][col];
      break;
    }
    function validRow(n: number, sign: number) {
      n += sign;
      if (n < 0) {
        return rightBoundary - 1;
      } else if (n >= rightBoundary) {
        return 0;
      } else {
        return n;
      }
    }
    function validCol(n: number, sign: number) {
      n += sign;
      if (n < 0) {
        return bottomBoundary - 1;
      } else if (n >= bottomBoundary) {
        return 0;
      } else {
        return n;
      }
    }

    // let top = row - 1;
    // if (top < 0) top = this.verBlocks;
    // let bot = row + 1;
    // if (bot >= this.verBlocks) bot = 0;
    // let left = col - 1;
    // if (left < 0) left = this.horBlocks;
    // let right = col + 1;
    // if (right >= this.horBlocks) right = 0;

    forwardLeftForce -= myForce;
    forwardRightForce -= myForce;
    // const topForce = this.force[top][col];
    // const rightForce = this.force[row][right];
    // const botForce = this.force[bot][col];
    // const leftForce = this.force[row][left];
    for (const force of [forwardLeftForce, forwardRightForce]) {
      forces.push(force);
    }
    // console.log(forces);
    return forces;
  }

  draw() {
    for (let i = 0; i < this.horBlocks; i++) {
      for (let j = 0; j < this.verBlocks; j++) {
        if (this.fieldMode) {
          /* Field Mode */

          const value = Math.floor((this.force[i][j] + 1) * 128);
          // ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
          const forces = this.getNeighborForces(
            i * this.blockSize,
            j * this.blockSize,
            90,
          );
          let d = forces[0] - forces[1];
          d = Math.floor(sigmoid(d) * 256);
          ctx.fillStyle = `rgb(${d}, ${d}, ${d})`;
          ctx.fillRect(
            i * this.blockSize,
            j * this.blockSize,
            this.blockSize,
            this.blockSize,
          );
        } else {
          const value = Math.floor((this.force[i][j] + 1) * 128);
          ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
          ctx.fillRect(
            i * this.blockSize,
            j * this.blockSize,
            this.blockSize,
            this.blockSize,
          );
        }
      }
    }
  }
}

// const path = new ForceField(canvas.width, canvas.height, ctx, stars, meteorites);

// path.calculate();
// path.draw();

function normalize(value: number, max: number) {
  return value / max;
  // return (1 / (1 + Math.exp(-value)));
}
