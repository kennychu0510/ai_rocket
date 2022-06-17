import { degreeToRadian, getDOMElement, sigmoid } from './functions.js';
import { Position } from './type';
const { sin, cos, sqrt, round } = Math;

const canvas = getDOMElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.height = Math.floor((window.innerHeight * 0.78) / 100) * 100;
canvas.width = canvas.height * 2.2;

export const blockSize = 20;

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
  public forcefield: number[][];
  public horizontalGradient: number[][];
  public verticalGradient: number[][];
  public stars: Position[];
  private meteorites: Position[];
  public blockSize = blockSize;
  public horBlocks = 0;
  public verBlocks = 0;
  private maxValue = 255;
  private minValue = -255;
  private fieldMode = false;
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
    this.forcefield = new Array(this.horBlocks)
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
    this.calculate();
  }

  private calculate() {
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
        this.forcefield[i][j] = value;
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

        const horGrad =
          (this.forcefield[right][j] - this.forcefield[left][j]) / 2;
        const verGrad =
          (this.forcefield[i][top] - this.forcefield[i][bottom]) / 2;
        this.horizontalGradient[i][j] = horGrad;
        this.verticalGradient[i][j] = verGrad;
      }
    }
  }

  updateStars(stars: Position[]) {
    this.calculate();
  }

  /* Return Neighbor Forces Normalized */
  getNeighborForces(x: number, y: number, degree: number) {
    const row = Math.floor(x / this.blockSize);
    const col = Math.floor(y / this.blockSize);
    const forceCalculator = new ForceCalculator(this.horBlocks, this.verBlocks);
    const neighborForces = forceCalculator.getNeighborForces(
      row,
      col,
      degree,
      this.forcefield,
    );
    return neighborForces;
  }

  draw() {
    for (let i = 0; i < this.horBlocks; i++) {
      for (let j = 0; j < this.verBlocks; j++) {
        if (this.fieldMode) {
          /* Field Mode */

          const value = Math.floor((this.forcefield[i][j] + 1) * 128);
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
          const value = Math.floor((this.forcefield[i][j] + 1) * 128);
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

class ForceCalculator {
  private rightBoundary: number;
  private bottomBoundary: number;

  constructor(rightBoundary: number, bottomBoundary: number) {
    this.rightBoundary = rightBoundary;
    this.bottomBoundary = bottomBoundary;
  }

  private validRow(n: number, sign: number) {
    n += sign;
    if (n < 0) {
      return this.rightBoundary - 1;
    } else if (n >= this.rightBoundary) {
      return 0;
    } else {
      return n;
    }
  }

  private validCol(n: number, sign: number) {
    n += sign;
    if (n < 0) {
      return this.bottomBoundary - 1;
    } else if (n >= this.bottomBoundary) {
      return 0;
    } else {
      return n;
    }
  }

  private directionToRow(degree: number) {
    const radians = degreeToRadian(degree);
    return round(cos(radians) * sqrt(2) * -2);
  }

  private directionToCol(degree: number) {
    const radians = degreeToRadian(degree);
    return round(sin(radians) * sqrt(2) * 2);
  }

  private directionToRowCol(degree: number) {
    return [this.directionToRow(degree), this.directionToCol(degree)];
  }

  private directionToNeighborCells(degree: number) {
    const neighborCells = [];
    for (let i = 0; i < 8; i++) {
      neighborCells.push(this.directionToRowCol(degree + 45 * i));
    }
    return neighborCells;
  }

  getNeighborForces(
    row: number,
    col: number,
    degree: number,
    forcefield: number[][],
  ) {
    const neighborForces = [];
    const neighborCoordinates = this.directionToNeighborCells(degree);

    for (let i = 0; i < neighborCoordinates.length; i++) {
      neighborForces.push(
        forcefield[this.validRow(row, neighborCoordinates[i][0])][
          this.validCol(col, neighborCoordinates[i][1])
        ] - forcefield[row][col],
      );
    }
    return neighborForces;
  }
}
