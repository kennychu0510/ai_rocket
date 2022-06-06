import { Boundary } from './boundary.js';
import { CanvasText } from './canvasText.js';
import { Rocket } from './rocket.js';
import { Star } from './star.js';
import { GameBoundary, Position } from './type.js';

export class Game {
  public statusMessage: CanvasText;
  public gameInstructions: CanvasText;
  public addStarModeOn: boolean;
  public startTime: Date;
  private starSize: number;
  public totalStars: number;
  private canvasWidth: number;
  private canvasHeight: number;
  public gameStarted: boolean;
  public stars: Star[];
  public buttons: string[];
  public rocket: Rocket;
  public boundary: Boundary;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public gameBoundaries: GameBoundary;
  constructor(canvas: HTMLCanvasElement, gameBoundaries: GameBoundary) {
    this.canvas = canvas,
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight - 100;
    this.ctx = this.canvas.getContext('2d')!;
    this.boundary = new Boundary(gameBoundaries.top, gameBoundaries.right, gameBoundaries.bot, gameBoundaries.left, this.ctx),
    this.rocket = new Rocket({ x: canvas.width / 10, y: canvas.height / 4 }, { x: 0, y: 0 }, this.canvasWidth, this.ctx, this.boundary),
    this.statusMessage = new CanvasText(`W to move, A + D to turn, S to stop`,
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
      }, this.canvasHeight, this.ctx);
    this.gameInstructions = new CanvasText(`Add stars to start the game`,
      { x: canvas.width / 2, y: canvas.height * 2 / 3 }, this.canvasHeight, this.ctx);
    this.addStarModeOn = false;
    this.gameStarted = false;
    this.startTime = new Date();
    this.starSize = 0;
    this.stars = [];
    this.buttons = ['w', 's', 'd', 'a'];
    this.totalStars = 0;
    this.gameBoundaries = gameBoundaries;
  }
  newGame() {
    this.stars = [];
  }

  addStar(position: Position) {
    const newStar = new Star(position, this.canvasWidth, this.ctx);
    this.stars.push(newStar);
    // totalScore.textContent = String(this.stars.length);
    this.totalStars++;
  }
  startGame() {
    this.gameStarted = true;
    this.startTime = new Date();
    this.statusMessage.updateMsg('');
    this.gameInstructions.updateMsg('');
  }
  checkRocketAndBoundary() {
    this.rocket.draw();
    if (this.boundary.getBoundaryMode()) {
      if (this.rocket.position.y < this.gameBoundaries.top || this.rocket.position.y + this.rocket.height > this.gameBoundaries.bot || this.rocket.position.x < this.gameBoundaries.left || this.rocket.position.x + this.rocket.width > this.gameBoundaries.right) {
        this.rocket.alive = false;
        this.gameStarted = false;
        this.rocket.stop();
        this.statusMessage.updateMsg('you have crashed!');
        return;
      }
    } else {
      if (this.rocket.position.y < this.gameBoundaries.top) {
        this.rocket.position.y = this.gameBoundaries.bot - this.rocket.height;
      }
      if (this.rocket.position.y + this.rocket.height > this.gameBoundaries.bot) {
        this.rocket.position.y = this.gameBoundaries.top;
      }
      if (this.rocket.position.x < this.gameBoundaries.left) {
        this.rocket.position.x = this.gameBoundaries.right - this.rocket.width;
      }
      if (this.rocket.position.x + this.rocket.width > this.gameBoundaries.right) {
        this.rocket.position.x = this.gameBoundaries.left;
      }
    }
  }

  checkStarCollection() {
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      const dx = (this.rocket.position.x + this.rocket.width / 2) - (star.getX() + this.starSize / 2);
      const dy = (this.rocket.position.y + this.rocket.height / 2) - (star.getY() + this.starSize / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < Math.sqrt(this.rocket.width ** 2 + this.rocket.height ** 2) / 2 + this.starSize / 2) {
        this.stars.splice(i, 1);
        i--;
        this.rocket.collectedStars++;
        // currentScore.textContent = String(this.rocket.collectedStars);
      }
    }
  }

  update() {
    this.rocket.draw();
    this.checkRocketAndBoundary();
    this.checkStarCollection();
    this.rocket.updateRocketPosition();
  }

  generateStars() {
    // Offset to prevent star appearing at the boundaries
    const offset = 100;
    const maxY = this.gameBoundaries.bot - offset;
    const minY = this.gameBoundaries.top + offset;
    const maxX = this.gameBoundaries.right - offset;
    const minX = this.gameBoundaries.left + offset;
    const x = Math.floor(Math.random() * (maxX - minX + 1) + minX);
    const y = Math.floor(Math.random() * (maxY - minY + 1) + minY);
    const position = { x, y };
    this.addStar(position);
  }

  draw() {
    this.statusMessage.draw();
  }
  // animate = () => {
  //   requestAnimationFrame(this.animate());
  //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvasHeight);
  //   this.boundary.draw();
  //   this.statusMessage.draw();
  //   this.gameInstructions.draw();
  //   if (this.gameStarted) {
  //     const timeTaken = Number(new Date()) - +startTime;
  //     timerMilliseconds.textContent = String(timeTaken % 1000).padStart(3, '0');
  //     timerSeconds.textContent = String(Math.floor(timeTaken / 1000)).padStart(2, '0');
  //   }

  //   for (const star of this.stars) {
  //     star.draw();
  //   }
  // };
}
