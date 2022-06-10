import { BlackholePairType, Position } from './type.js';

const blackholeImg = new Image();
blackholeImg.src = './media/blackhole.png';

export const blackholeSizeRatio = 0.03;
export class Blackhole {
  public position: Position;
  private image: HTMLImageElement;
  public size: number;
  private ctx: CanvasRenderingContext2D;
  constructor(
    blackhole: Position,
    canvasWidth: number,
    ctx: CanvasRenderingContext2D,
  ) {
    this.position = blackhole;
    this.image = blackholeImg;
    this.size = blackholeSizeRatio * canvasWidth;
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
