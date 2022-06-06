import { Position } from './type.js';

export class CanvasText {
  private message: string;
  private font: string;
  private color: string;
  private position: Position;
  private ctx: CanvasRenderingContext2D;
  constructor(message: string, position: Position, canvasHeight: number, ctx: CanvasRenderingContext2D) {
    this.message = message;
    const fontSize = canvasHeight * 0.05;
    this.font = `${fontSize}px Arial`;
    this.color = 'yellow';
    this.position = position;
    this.ctx = ctx;
  }

  updateMsg(message: string) {
    this.message = message;
  }

  draw() {
    this.ctx.font = this.font;
    this.ctx.fillStyle = this.color;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.message, this.position.x, this.position.y);
  }
}
