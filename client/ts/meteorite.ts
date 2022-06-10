import { Position } from './type.js';

const meteoriteImg = new Image();
meteoriteImg.src = './media/meteorite.png';
export const meteoriteSizeRatio = 0.04;

export class Meteorite {
  public position: Position;
  private image: HTMLImageElement;
  public size: number;
  private ctx: CanvasRenderingContext2D;
  constructor(
    position: Position,
    canvasWidth: number,
    ctx: CanvasRenderingContext2D,
  ) {
    this.position = position;
    this.image = meteoriteImg;
    this.size = canvasWidth * meteoriteSizeRatio;
    this.ctx = ctx;
  }

  draw() {
    this.ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.size,
      this.size,
    );
  }
  getX() {
    return this.position.x;
  }
  getY() {
    return this.position.y;
  }
}
