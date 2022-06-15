import { Boundary } from './boundary.js';
import { CanvasText } from './canvasText.js';
import { Rocket } from './rocket.js';
import { Star, starSizeRatio } from './star.js';
import {
  BlackholePairType,
  GameBoundary,
  gameDOMelements,
  Position,
} from './type.js';
import { Meteorite, meteoriteSizeRatio } from './meteorite.js';
import { Blackhole, blackholeSizeRatio } from './blackhole.js';
import { RocketGA } from './rocketGA.js';
import { showRecordScoreForm } from './events.js';
import Swal from 'sweetalert2';
const { floor, random } = Math;
export class Game {
  public statusMessage: CanvasText;
  public gameInstructions: CanvasText;
  public startTime: number;
  public totalStars: number;
  public totalMeteorites: number;
  public totalBlackHoles: number;
  public canvasWidth: number;
  public canvasHeight: number;
  public gameOnGoing: boolean;
  public stars: Star[];
  public meteorites: Meteorite[];
  public blackholes: Blackhole[];
  public buttons: string[];
  public userRocket: Rocket;
  public boundary: Boundary;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public rocketGA: RocketGA;
  public startAI: boolean;
  public domElements: gameDOMelements;
  public time = 0;
  public gameEnd = false;
  public teleportMap = [0];
  public mapID = 0;
  constructor(
    canvas: HTMLCanvasElement,
    gameBoundaries: GameBoundary,
    domElements: gameDOMelements,
  ) {
    (this.canvas = canvas), (this.canvasWidth = window.innerWidth);
    this.canvasHeight = window.innerHeight - 100;
    this.ctx = this.canvas.getContext('2d')!;

    this.boundary = new Boundary(
      gameBoundaries.top,
      gameBoundaries.right,
      gameBoundaries.bot,
      gameBoundaries.left,
      this.ctx,
    );
    this.userRocket = new Rocket(this);
    this.userRocket.onDie = () => {
      this.statusMessage.updateMsg('Game Over');
      this.gameEnd = true;
      this.stopGame();
    };
    this.userRocket.onFinish = () => {
      this.statusMessage.updateMsg('Well Done!');
      this.gameEnd = true;
      this.stopGame();
      showRecordScoreForm(this, this.domElements);
    };
    this.statusMessage = new CanvasText(
      `W to move, A + D to turn, S to stop`,
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
      this.canvasHeight,
      this.ctx,
    );
    this.gameInstructions = new CanvasText(
      `Add stars to start the game`,
      { x: canvas.width / 2, y: (canvas.height * 2) / 3 },
      this.canvasHeight,
      this.ctx,
    );
    this.startTime = Date.now();
    this.gameOnGoing = false;
    this.stars = [];
    this.meteorites = [];
    this.blackholes = [];
    this.buttons = ['w', 's', 'd', 'a'];
    this.totalStars = 0;
    this.totalMeteorites = 0;
    this.totalBlackHoles = 0;
    this.rocketGA = new RocketGA(this);
    this.startAI = false;
    this.domElements = domElements;
  }

  addStar(position: Position) {
    const size = starSizeRatio * this.canvasWidth * 1.3;
    for (let i = 0; i < this.stars.length; i++) {
      const nSPosition = this.stars[i].position;
      const dx = Math.abs(nSPosition.x - position.x);
      const dy = Math.abs(nSPosition.y - position.y);
      if (dx < size && dy < size) {
        return Swal.fire('Star position too close !');
      }
    }
    const newStar = new Star(position, this.canvasWidth, this.ctx);
    this.stars.push(newStar);
    this.totalStars++;
    this.userRocket.addStar(newStar);
    this.domElements.totalScore.textContent = String(this.totalStars);
  }

  addMeteorite(position: Position) {
    const size = meteoriteSizeRatio * this.canvasWidth * 1.3;
    // for (let i = 0; i < this.meteorites.length; i++) {
    //   const nMPosition = this.meteorites[i].position;
    //   const dx = Math.abs(nMPosition.x - position.x);
    //   const dy = Math.abs(nMPosition.y - position.y);
    //   if (dx < size && dy < size) {
    //     return Swal.fire('Meteorite position too close !');
    //   }
    // }
    const newMeteorite = new Meteorite(position, this.canvasWidth, this.ctx);
    this.meteorites.push(newMeteorite);
    this.totalMeteorites++;
    this.domElements.totalMeteorite.textContent = String(this.totalMeteorites);
  }

  addBlackhole(position: Position) {
    const size = blackholeSizeRatio * this.canvasWidth * 1.3;
    for (let i = 0; i < this.blackholes.length; i++) {
      const nBPosition = this.blackholes[i].position;
      const dx = Math.abs(nBPosition.x - position.x);
      const dy = Math.abs(nBPosition.y - position.y);
      if (dx < size && dy < size) {
        return Swal.fire('Blackhole position too close !');
      }
    }
    const newBlackhole = new Blackhole(position, this.canvasWidth, this.ctx);
    this.blackholes.push(newBlackhole);
    this.totalBlackHoles++;
    this.domElements.totalBlackhole.textContent = String(this.totalBlackHoles)
  }

  startGame() {
    this.gameOnGoing = true;
    this.startTime = Date.now();
    this.statusMessage.updateMsg('');
    this.gameInstructions.updateMsg('');
  }

  stopGame() {
    this.gameOnGoing = false;
  }

  reportRocketDead() {
    // this.statusMessage.updateMsg(`0/1 rockets alive`);
    this.gameOnGoing = false;
  }

  update() {
    this.userRocket.update(this.userRocket.time);
    this.rocketGA.update();
    /* UPDATE TIMER */
    if (this.gameOnGoing) {
      this.time++;
    }
    if (!this.startAI) {
      this.domElements.currentScore.textContent = String(
        this.userRocket.collectedStars,
      );
    }
    if (this.rocketGA.launchRocketAIMode) {
      this.domElements.currentScore.textContent = String(
        this.rocketGA.population[0].collectedStars,
      );
    }
  }

  generateRandomStars() {
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

  draw() {
    this.statusMessage.draw();
    this.statusMessage.draw();
    this.gameInstructions.draw();
    this.boundary.draw();

    if (!this.rocketGA.launchRocketAIMode) {
      for (const star of this.userRocket.stars) {
        star.draw();
      }
    } else {
      for (const star of this.rocketGA.population[0].stars) {
        star.draw();
      }
    }

    for (const blackholePair of this.blackholes) {
      blackholePair.draw();
    }

    for (const meteorite of this.meteorites) {
      meteorite.draw();
    }
    this.rocketGA.draw();
    this.userRocket.draw();

    if (this.gameOnGoing) {
      const timeTaken = Date.now() - this.startTime;
      this.domElements.timerMilliseconds.textContent = String(
        timeTaken % 1000,
      ).padStart(3, '0');

      this.domElements.timerSeconds.textContent = String(
        Math.floor(timeTaken / 1000),
      ).padStart(2, '0');
    }
  }

  reset() {
    this.statusMessage.updateMsg('W to move, A + D to turn, S to stop');
    this.gameInstructions.updateMsg('Add stars to start the game');
    this.userRocket.reset();
    this.userRocket.stars = new Set<Star>();
    this.stars = [];
    this.meteorites = [];
    this.blackholes = [];
    this.totalStars = 0;
    this.totalMeteorites = 0;
    this.gameOnGoing = false;
    // this.userRocket.changeAcceleration(1 * this.canvasWidth);
    this.rocketGA.reset();
    this.domElements.timerMilliseconds.textContent = '000';
    this.domElements.timerSeconds.textContent = '00';
    this.domElements.totalScore.textContent = '0';
    this.domElements.currentScore.textContent = '0';
    this.domElements.totalMeteorite.textContent = '0';
    this.time = 0;
    // console.log({ x: this.canvasWidth / 10, y: this.canvasHeight / 4 });
    // console.log(this.initialPosition);
  }

  seed() {
    this.rocketGA.seed();
    this.statusMessage.updateMsg('');
    this.gameInstructions.updateMsg('');
  }

  genTeleportMap(n: number) {
    /* Only gen teleport map once */
    if (n < 2) return [0];
    const map: number[] = [];
    // shuffle available mapping
    const sources = new Array(n).fill(0).map((_, i) => i);

    random: for (;;) {
      for (let i = 0; i < n; i++) {
        const a = floor(random() * n);
        const b = floor(random() * n);
        const t = sources[a];
        sources[a] = sources[b];
        sources[b] = t;
      }
      for (let i = 0; i < n; i++) {
        if (sources[i] === i) {
          continue random;
        }
      }
      break random;
    }

    for (let i = 0; i < n; i++) {
      map[i] = sources[i];
    }
    this.teleportMap = map;
  }
}
