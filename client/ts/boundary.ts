export class Boundary {
  private color: string;
  private boundaryModeOn: boolean;
  constructor(
    public top: number,
    public right: number,
    public bot: number,
    public left: number,
    private ctx: CanvasRenderingContext2D,
  ) {
    this.color = 'green';
    this.boundaryModeOn = false;
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
