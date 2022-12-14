import { Position } from './type.js';

const starImg = new Image();
starImg.src = './media/star.png';
export const starSizeRatio = 0.015;

export class Star {
  public position: Position;
  public id: string;
  private image: HTMLImageElement;
  public size: number;
  private ctx: CanvasRenderingContext2D;
  constructor(
    position: Position,
    canvasWidth: number,
    ctx: CanvasRenderingContext2D,
  ) {
    this.position = position;
    this.image = starImg;
    this.size = starSizeRatio * canvasWidth;
    this.ctx = ctx;
    this.id = this.position.x + ',' + this.position.y;
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
