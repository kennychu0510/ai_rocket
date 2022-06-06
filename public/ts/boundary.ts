export class Boundary {
  private top: number;
  private right: number;
  private bot: number;
  private left: number;
  private color: string;
  private boundaryModeOn: boolean;
  private ctx: CanvasRenderingContext2D;
  constructor(top: number, right: number, bot: number, left: number, ctx: CanvasRenderingContext2D) {
    this.top = top;
    this.right = right;
    this.bot = bot;
    this.left = left;
    this.color = 'red';
    this.boundaryModeOn = true;
    this.ctx = ctx;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.color;
    this.ctx.moveTo(this.left, this.top);
    this.ctx.lineTo(this.right, this.top);
    this.ctx.lineTo(this.right, this.bot);
    this.ctx.lineTo(this.left, this.bot);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  turnOffBoundary() {
    this.color = 'green';
    this.boundaryModeOn = false;
  }

  turnOnBoundary() {
    this.color = 'red';
    this.boundaryModeOn = true;
  }

  getBoundaryMode() {
    return this.boundaryModeOn;
  }
}
