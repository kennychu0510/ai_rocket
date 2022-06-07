import { Position } from './type.js';

const meteoriteImg = new Image();
meteoriteImg.src = './media/meteorite.png';

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
    this.size = canvasWidth * 0.04;
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
}
