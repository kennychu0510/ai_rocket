import { getDOMElement } from './functions.js';
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

export class Path {
  public force: number[][];
  public horizontalGradient: number[][];
  public verticalGradient: number[][];
  private stars: Position[];
  private meteorites: Position[];
  private blockSize = 20;
  private horBlocks = 0;
  private verBlocks = 0;
  private maxValue = 255;
  private minValue = -255;
  private fieldMode = true;
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
    for (const star of this.stars) {
      this.force[Math.floor(star.x / this.blockSize)][
        Math.floor(star.y / this.blockSize)
      ] = this.maxValue;
    }
    for (const meteorite of this.meteorites) {
      this.force[Math.floor(meteorite.x / this.blockSize)][
        Math.floor(meteorite.y / this.blockSize)
      ] = this.minValue;
    }
    const G = 100;
    if (this.fieldMode) {
      for (let i = 0; i < this.horBlocks; i++) {
        for (let j = 0; j < this.verBlocks; j++) {
          let value = 0;
          for (const star of this.stars) {
            const dx = Math.floor(star.x / this.blockSize) - i;
            const dy = Math.floor(star.y / this.blockSize) - j;
            const r2 = dx * dx + dy * dy;
            value += G / r2;
          }

          for (const meteorite of this.meteorites) {
            const dx = Math.floor(meteorite.x / this.blockSize) - i;
            const dy = Math.floor(meteorite.y / this.blockSize) - j;
            const r2 = dx * dx + dy * dy;
            value += -G / r2;
          }
          value = (1 / (1 + Math.exp(-value))) * 256;
          this.force[i][j] = Math.floor(value);
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

  draw() {
    for (let i = 0; i < this.horBlocks; i++) {
      for (let j = 0; j < this.verBlocks; j++) {
        if (this.fieldMode) {
          /* Field Mode */

          const value = this.force[i][j];
          ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
          ctx.fillRect(
            i * this.blockSize,
            j * this.blockSize,
            this.blockSize,
            this.blockSize,
          );
        } else {
          /* Star / Meteorite Mode */
          if (this.force[i][j] === 0) {
            ctx.fillStyle = 'rgb(0,0,0)';
          } else if (this.force[i][j] === this.maxValue) {
            ctx.fillStyle = 'yellow';
          } else if (this.force[i][j] === this.minValue) {
            ctx.fillStyle = 'red';
          }
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

const path = new Path(canvas.width, canvas.height, ctx, stars, meteorites);

path.calculate();
path.draw();
