import { Boundary } from './boundary.js';
import { CanvasText } from './canvasText.js';
import { Rocket } from './rocket.js';
import { Star } from './star.js';
import { BlackholePairType, GameBoundary, Position } from './type.js';
import { Meteorite } from './meteorite.js';
import { BlackholePair } from './blackhole.js';

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
  public meteorites: Meteorite[];
  public blackholes: BlackholePair[];
  public buttons: string[];
  public rocket: Rocket;
  public boundary: Boundary;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public gameBoundaries: GameBoundary;
  private initialPosition: Position;
  constructor(canvas: HTMLCanvasElement, gameBoundaries: GameBoundary) {
    this.canvas = canvas,
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight - 100;
    this.ctx = this.canvas.getContext('2d')!;
    this.initialPosition = { x: this.canvasWidth / 10, y: this.canvasHeight / 4 };
    this.boundary = new Boundary(gameBoundaries.top, gameBoundaries.right, gameBoundaries.bot, gameBoundaries.left, this.ctx),
    this.rocket = new Rocket(this.initialPosition, { x: 0, y: 0 }, this.canvasWidth, this.ctx, this.boundary),
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
    this.meteorites = [];
    this.blackholes = [];
    this.buttons = ['w', 's', 'd', 'a'];
    this.totalStars = 0;
    this.gameBoundaries = gameBoundaries;
  }

  addStar(position: Position) {
    const newStar = new Star(position, this.canvasWidth, this.ctx);
    this.stars.push(newStar);
    this.totalStars++;
  }

  addMeteorite(position: Position) {
    const newMeteorite = new Meteorite(position, this.canvasWidth, this.ctx);
    this.meteorites.push(newMeteorite);
  }

  addBlackholePair(blackholePair: BlackholePairType) {
    const newBlackholePair = new BlackholePair(blackholePair, this.canvasWidth, this.ctx);
    this.blackholes.push(newBlackholePair);
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

      if (distance < this.rocket.getC() / 2 + this.starSize / 2) {
        this.stars.splice(i, 1);
        i--;
        this.rocket.collectedStars++;
        // currentScore.textContent = String(this.rocket.collectedStars);
      }
    }
  }

  checkBlackholeTeleportation() {
    for (const blackholePair of this.blackholes) {
      const dx1 = (this.rocket.position.x + this.rocket.width / 2) - (blackholePair.blackhole1.x + blackholePair.size / 2);
      const dy1 = (this.rocket.position.y + this.rocket.height / 2) - (blackholePair.blackhole1.y + blackholePair.size / 2);
      const dx2 = (this.rocket.position.x + this.rocket.width / 2) - (blackholePair.blackhole2.x + blackholePair.size / 2);
      const dy2 = (this.rocket.position.y + this.rocket.height / 2) - (blackholePair.blackhole2.y + blackholePair.size / 2);
      const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const range = this.rocket.getC() / 2 + blackholePair.size / 2;

      if (distance1 <= range / 2) {
        this.rocket.position.x = blackholePair.blackhole2.x - dx1 * 2;
        this.rocket.position.y = blackholePair.blackhole2.y - dy1 * 2;
      } else if (distance2 <= range / 2) {
        this.rocket.position.x = blackholePair.blackhole1.x - dx2 * 2;
        this.rocket.position.y = blackholePair.blackhole1.y - dy2 * 2;
      }
    }
  }

  checkMeoriteCollision() {
    for (const meteorite of this.meteorites) {
      const dx = (this.rocket.position.x + this.rocket.width / 2) - (meteorite.position.x + meteorite.size / 2);
      const dy = (this.rocket.position.y + this.rocket.height / 2) - (meteorite.position.y + meteorite.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.rocket.getC() / 2 + meteorite.size / 2) {
        this.rocket.velocity.x = -this.rocket.velocity.x;
        this.rocket.velocity.y = -this.rocket.velocity.y;
        this.rocket.reduceHealth();
      }
    }
  }

  update() {
    this.rocket.draw();
    this.checkRocketAndBoundary();
    this.checkStarCollection();
    this.checkMeoriteCollision();
    this.checkBlackholeTeleportation();
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

  generateMeteorite() {
    const offset = 100;
    const maxY = this.gameBoundaries.bot - offset;
    const minY = this.gameBoundaries.top + offset;
    const maxX = this.gameBoundaries.right - offset;
    const minX = this.gameBoundaries.left + offset;
    const x = Math.floor(Math.random() * (maxX - minX + 1) + minX);
    const y = Math.floor(Math.random() * (maxY - minY + 1) + minY);
    const position = { x, y };
    this.addMeteorite(position);
  }

  generateBlackholePair() {
    const offset = 100;
    const maxY = this.gameBoundaries.bot - offset;
    const minY = this.gameBoundaries.top + offset;
    const maxX = this.gameBoundaries.right - offset;
    const minX = this.gameBoundaries.left + offset;
    const x1 = Math.floor(Math.random() * (maxX - minX + 1) + minX);
    const y1 = Math.floor(Math.random() * (maxY - minY + 1) + minY);
    const x2 = Math.floor(Math.random() * (maxX - minX + 1) + minX);
    const y2 = Math.floor(Math.random() * (maxY - minY + 1) + minY);
    const position1 = { x: x1, y: y1 };
    const position2 = { x: x2, y: y2 };
    const blackholePair: BlackholePairType = {
      blackhole1: position1,
      blackhole2: position2,
    };
    this.addBlackholePair(blackholePair);
  }

  draw() {
    this.statusMessage.draw();
    this.statusMessage.draw();
    this.gameInstructions.draw();
    this.boundary.draw();

    for (const star of this.stars) {
      star.draw();
    }

    for (const blackholePair of this.blackholes) {
      blackholePair.draw();
    }

    for (const meteorite of this.meteorites) {
      meteorite.draw();
    }
  }

  reset() {
    this.statusMessage.updateMsg('W to move, A + D to turn, S to stop');
    this.gameInstructions.updateMsg('Add stars to start the game');
    this.rocket.reset();
    this.rocket.setPosition({ x: this.canvasWidth / 10, y: this.canvasHeight / 4 });
    this.stars = [];
    this.totalStars = 0;
    this.gameStarted = false;
    this.rocket.changeAcceleration(0.002 * this.canvasWidth);
    // console.log({ x: this.canvasWidth / 10, y: this.canvasHeight / 4 });
    // console.log(this.initialPosition);
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
