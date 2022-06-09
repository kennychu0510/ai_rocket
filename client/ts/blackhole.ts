import { BlackholePairType, Position } from './type.js';

const blackholeImg = new Image();
blackholeImg.src = './media/blackhole.png';

export class BlackholePair {
  public blackhole1: Position;
  public blackhole2: Position;
  private image: HTMLImageElement;
  public size: number;
  private ctx: CanvasRenderingContext2D;
  constructor(
    blackholePair: BlackholePairType,
    canvasWidth: number,
    ctx: CanvasRenderingContext2D,
  ) {
    this.blackhole1 = blackholePair.blackhole1;
    this.blackhole2 = blackholePair.blackhole2;
    this.image = blackholeImg;
    this.size = 0.03 * canvasWidth;
    this.ctx = ctx;
  }

  draw() {
    this.ctx.drawImage(
      this.image,
      this.blackhole1.x,
      this.blackhole1.y,
      this.size,
      this.size,
    );
    this.ctx.drawImage(
      this.image,
      this.blackhole2.x,
      this.blackhole2.y,
      this.size,
      this.size,
    );
  }
  getX() {
    return { x1: this.blackhole1.x, x2: this.blackhole2.x };
  }
  getY() {
    return { y1: this.blackhole1.y, y2: this.blackhole2.y };
  }
}
