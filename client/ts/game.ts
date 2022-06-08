import { Boundary } from './boundary.js';
import { CanvasText } from './canvasText.js';
import { Rocket } from './rocket.js';
import { Star } from './star.js';
import { BlackholePairType, GameBoundary, gameDOMelements, Position } from './type.js';
import { Meteorite } from './meteorite.js';
import { BlackholePair } from './blackhole.js';
import { RocketGA } from './rocketGA.js';

export class Game {
  public statusMessage: CanvasText;
  public gameInstructions: CanvasText;
  public addStarModeOn: boolean;
  public startTime: Date;
  private starSize: number;
  public totalStars: number;
  public canvasWidth: number;
  public canvasHeight: number;
  public gameStarted: boolean;
  public stars: Star[];
  public meteorites: Meteorite[];
  public blackholes: BlackholePair[];
  public buttons: string[];
  public rocket: Rocket;
  public boundary: Boundary;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private rocketGA: RocketGA;
  private initialPosition: Position;
  private aliveCount = 0;
  public startAI: boolean;
  public domElements: gameDOMelements;
  constructor(canvas: HTMLCanvasElement, gameBoundaries: GameBoundary, domElements: gameDOMelements) {
    (this.canvas = canvas), (this.canvasWidth = window.innerWidth);
    this.canvasHeight = window.innerHeight - 100;
    this.ctx = this.canvas.getContext('2d')!;
    this.initialPosition = {
      x: this.canvasWidth / 10,
      y: this.canvasHeight / 4,
    };
    (this.boundary = new Boundary(
      gameBoundaries.top,
      gameBoundaries.right,
      gameBoundaries.bot,
      gameBoundaries.left,
      this.ctx,
    )),
    (this.rocket = new Rocket(this)),
    (this.statusMessage = new CanvasText(
      `W to move, A + D to turn, S to stop`,
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
      this.canvasHeight,
      this.ctx,
    ));
    this.gameInstructions = new CanvasText(
      `Add stars to start the game`,
      { x: canvas.width / 2, y: (canvas.height * 2) / 3 },
      this.canvasHeight,
      this.ctx,
    );
    this.addStarModeOn = false;
    this.gameStarted = false;
    this.startTime = new Date();
    this.starSize = 0;
    this.stars = [];
    this.meteorites = [];
    this.blackholes = [];
    this.buttons = ['w', 's', 'd', 'a'];
    this.totalStars = 0;
    this.rocketGA = new RocketGA(this);
    this.startAI = false;
    this.domElements = domElements;
  }

  addStar(position: Position) {
    const newStar = new Star(position, this.canvasWidth, this.ctx);
    this.stars.push(newStar);
    this.totalStars++;
    this.rocket.addStar(newStar);
  }

  addMeteorite(position: Position) {
    const newMeteorite = new Meteorite(position, this.canvasWidth, this.ctx);
    this.meteorites.push(newMeteorite);
  }

  addBlackholePair(blackholePair: BlackholePairType) {
    const newBlackholePair = new BlackholePair(
      blackholePair,
      this.canvasWidth,
      this.ctx,
    );
    this.blackholes.push(newBlackholePair);
  }

  startGame() {
    this.gameStarted = true;
    this.startTime = new Date();
    this.statusMessage.updateMsg('');
    this.gameInstructions.updateMsg('');
    this.aliveCount = 1;
  }

  reportRocketDead() {
    this.aliveCount--;
    this.statusMessage.updateMsg(`0/1 rockets alive`);
    this.gameStarted = false;
  }

  update() {
    this.rocket.update();
    this.rocketGA.update();
  }

  generateStars() {
    // Offset to prevent star appearing at the boundaries
    const offset = 100;
    const maxY = this.boundary.bot - offset;
    const minY = this.boundary.top + offset;
    const maxX = this.boundary.right - offset;
    const minX = this.boundary.left + offset;
    const x = Math.floor(Math.random() * (maxX - minX + 1) + minX);
    const y = Math.floor(Math.random() * (maxY - minY + 1) + minY);
    const position = { x, y };
    this.addStar(position);
  }

  generateMeteorite() {
    const offset = 100;
    const maxY = this.boundary.bot - offset;
    const minY = this.boundary.top + offset;
    const maxX = this.boundary.right - offset;
    const minX = this.boundary.left + offset;
    const x = Math.floor(Math.random() * (maxX - minX + 1) + minX);
    const y = Math.floor(Math.random() * (maxY - minY + 1) + minY);
    const position = { x, y };
    this.addMeteorite(position);
  }

  generateBlackholePair() {
    const offset = 100;
    const maxY = this.boundary.bot - offset;
    const minY = this.boundary.top + offset;
    const maxX = this.boundary.right - offset;
    const minX = this.boundary.left + offset;
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

    for (const star of this.rocket.stars) {
      star.draw();
    }

    for (const blackholePair of this.blackholes) {
      blackholePair.draw();
    }

    for (const meteorite of this.meteorites) {
      meteorite.draw();
    }
    this.rocketGA.draw();
    this.rocket.draw();
  }

  reset() {
    this.statusMessage.updateMsg('W to move, A + D to turn, S to stop');
    this.gameInstructions.updateMsg('Add stars to start the game');
    this.rocket.reset();
    this.stars = [];
    this.meteorites = [];
    this.blackholes = [];
    this.totalStars = 0;
    this.gameStarted = false;
    this.rocket.changeAcceleration(0.002 * this.canvasWidth);
    this.rocketGA.reset();
    this.domElements.timerMilliseconds.textContent = '000';
    this.domElements.timerSeconds.textContent = '00';
    this.domElements.totalScore.textContent = '0';
    this.domElements.currentScore.textContent = '0';
    // console.log({ x: this.canvasWidth / 10, y: this.canvasHeight / 4 });
    // console.log(this.initialPosition);
  }

  seed() {
    this.rocketGA.seed();
    this.startAI = true;
  }
}
