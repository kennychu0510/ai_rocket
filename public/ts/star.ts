import { Position } from './type.js';

const starImg = new Image();
starImg.src = './media/star.png';

export class Star {
  private position: Position;
  private image: HTMLImageElement;
  public size: number;
  private ctx: CanvasRenderingContext2D;
  constructor(position: Position, canvasWidth: number, ctx: CanvasRenderingContext2D) {
    this.position = position;
    this.image = starImg;
    this.size = 0.015 * canvasWidth;
    this.ctx = ctx;
  }

  draw() {
    this.ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
  }
  getX() {
    return this.position.x;
  }
  getY() {
    return this.position.y;
  }
}
