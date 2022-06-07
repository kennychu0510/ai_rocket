import { Boundary } from './boundary.js';
import { degreeToRadian } from './functions.js';
import { Game } from './game.js';
import { Star } from './star.js';
import { Position } from './type.js';

const spaceshipImg = new Image();
spaceshipImg.src = './media/rocket_1.png';

const spaceshipFlyingImg = new Image();
spaceshipFlyingImg.src = './media/rocket_2.png';

const spaceshipDamagedImg = new Image();
spaceshipDamagedImg.src = './media/spaceship_damaged.png';

const spaceshipDecadeImg = new Image();
spaceshipDecadeImg.src = './media/spaceship_decade.png';

const boomImg = new Image();
boomImg.src = './media/boom.png';
export class Rocket {
  public position: Position;
  public velocity: Position;
  public width: number;
  public height: number;
  private acceleration: number;
  public image_static: HTMLImageElement;
  public image_flying: HTMLImageElement;
  public alive: boolean;
  private angle: number;
  private turn: number;
  public collectedStars: number;
  private health: number;
  public teleportTimeout: number;
  private stars: Set<Star>;
  private initialPosition: Position;
  constructor(
    private game: Game,
  ) {
    const canvasWidth = game.canvasWidth;
    const canvasHeight = game.canvasHeight;
    this.position = { x: canvasHeight / 4, y: canvasWidth / 10 };
    this.initialPosition = { x: this.position.x, y: this.position.y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = 0.002 * canvasWidth;
    this.width = 0.02 * canvasWidth;
    this.height = this.width * 2;
    this.turn = 45;
    this.image_static = spaceshipImg;
    this.image_flying = spaceshipFlyingImg;
    this.alive = true;
    this.angle = 90;
    this.collectedStars = 0;
    this.health = 3;
    this.teleportTimeout = 0;
    this.stars = new Set(game.stars);
  }

  draw() {
    const ctx = this.game.ctx;
    ctx.save();
    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.translate(
      -(this.position.x + this.width / 2),
      -(this.position.y + this.height / 2),
    );
    let image;
    if (this.velocity.x == 0 && this.velocity.y === 0) {
      image = this.image_static;
    } else {
      image = this.image_flying;
    }

    /* Resize boom image */
    if (this.health === 0) {
      this.height = this.height * 1.5;
      this.width = this.height;
    }
    ctx.drawImage(
      image,
      this.position.x + this.velocity.x * Math.sin(degreeToRadian(this.angle)),
      this.position.y + this.velocity.y,
      this.width,
      this.height,
    );
    // c.fillRect(this.position.x, this.position.y, this.size, this.size)
    // c.fill()
    ctx.restore();
    // c.rotate(10)
  }

  changeDirection(key: string) {
    if (key === 'w') {
      const x_direction =
        this.acceleration * Math.sin(degreeToRadian(this.angle));
      const y_direction =
        -this.acceleration * Math.sin(degreeToRadian(90 - this.angle));
      console.log({ x_direction, y_direction });
      this.velocity.x = x_direction;
      this.velocity.y = y_direction;
    }

    if (key === 's') {
      this.velocity.y = 0;
      this.velocity.x = 0;
    }
    if (key === 'a') this.angle -= this.turn;
    if (key === 'd') this.angle += this.turn;
    console.log(this.stats());
  }

  slowDown() {
    if (this.velocity.y > 0) {
      this.velocity.y -= 1;
    } else if (this.velocity.y < 0) {
      this.velocity.y += 1;
    }
    if (this.velocity.x > 0) {
      this.velocity.x -= 1;
    } else if (this.velocity.x < 0) {
      this.velocity.x += 1;
    }
  }

  updateRocketPosition() {
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;
  }

  stats() {
    return {
      x: this.position.x,
      y: this.position.y,
      x_speed: this.velocity.x,
      y_speed: this.velocity.y,
      angle_degrees: this.angle,
      acceleration: this.acceleration,
    };
  }

  stop() {
    this.velocity.y = 0;
    this.velocity.x = 0;
    this.alive = false;
  }

  changeAcceleration(acceleration: number) {
    this.acceleration = acceleration;
  }

  reset() {
    this.stop();
    this.alive = true;
    this.angle = 90;
    this.collectedStars = 0;
    this.image_static = spaceshipImg;
    this.image_flying = spaceshipFlyingImg;
    this.position.x = this.initialPosition.x;
    this.position.y = this.initialPosition.y;
  }

  setPosition(position: Position) {
    this.position = position;
    this.velocity = { x: 0, y: 0 };
  }

  getC() {
    return Math.sqrt(this.width ** 2 + this.height ** 2);
  }

  reduceHealth() {
    this.health--;
    if (this.health === 2) {
      this.image_static = spaceshipDecadeImg;
      this.image_flying = spaceshipDecadeImg;
      this.changeAcceleration(this.acceleration * 0.75);
    } else if (this.health === 1) {
      this.image_static = spaceshipDamagedImg;
      this.image_flying = spaceshipDamagedImg;
      this.changeAcceleration(this.acceleration * 0.75);
    } else if (this.health >= 0) {
      this.image_static = boomImg;
      this.image_flying = boomImg;
      this.stop();
    }
  }

  setTeleportationTimeout() {
    this.teleportTimeout = 60;
    console.log(new Date().getTime());
  }

  update() {
    if (this.teleportTimeout > 0) {
      this.teleportTimeout--;
    }
    this.checkRocketAndBoundary();
    this.checkStarCollection();
    this.checkMeoriteCollision();
    this.checkBlackholeTeleportation();
  }

  checkRocketAndBoundary() {
    const gameBoundaries = this.game.boundary;
    if (this.game.boundary.getBoundaryMode()) {
      if (
        this.position.y < gameBoundaries.top ||
        this.position.y + this.height > gameBoundaries.bot ||
        this.position.x < gameBoundaries.left ||
        this.position.x + this.width > gameBoundaries.right
      ) {
        this.stop();
        this.game.reportRocketDead();

        return;
      }
    } else {
      if (this.position.y < gameBoundaries.top) {
        this.position.y = gameBoundaries.bot - this.height;
      }
      if (
        this.position.y + this.height >
        gameBoundaries.bot
      ) {
        this.position.y = gameBoundaries.top;
      }
      if (this.position.x < gameBoundaries.left) {
        this.position.x = gameBoundaries.right - this.width;
      }
      if (
        this.position.x + this.width >
        gameBoundaries.right
      ) {
        this.position.x = gameBoundaries.left;
      }
    }
  }

  checkStarCollection() {
    for (const star of this.stars) {
      const dx =
        this.position.x +
        this.width / 2 -
        (star.getX() + star.size / 2);
      const dy =
        this.position.y +
        this.height / 2 -
        (star.getY() + star.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.getC() / 2 + star.size / 2) {
        this.stars.delete(star);
        this.collectedStars++;
        // currentScore.textContent = String(this.collectedStars);
      }
    }
  }

  checkBlackholeTeleportation() {
    for (const blackholePair of this.game.blackholes) {
      const dx1 =
        this.position.x +
        this.width / 2 -
        (blackholePair.blackhole1.x + blackholePair.size / 2);
      const dy1 =
        this.position.y +
        this.height / 2 -
        (blackholePair.blackhole1.y + blackholePair.size / 2);
      const dx2 =
        this.position.x +
        this.width / 2 -
        (blackholePair.blackhole2.x + blackholePair.size / 2);
      const dy2 =
        this.position.y +
        this.height / 2 -
        (blackholePair.blackhole2.y + blackholePair.size / 2);
      const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const range = this.getC() / 2 + blackholePair.size / 2;

      if (distance1 <= range / 2 && this.teleportTimeout === 0) {
        this.position.x =
          blackholePair.blackhole2.x +
          blackholePair.size / 2 -
          this.width / 2;
        this.position.y =
          blackholePair.blackhole2.y +
          blackholePair.size / 2 -
          this.height / 2;
        this.setTeleportationTimeout();
      } else if (distance2 <= range / 2 && this.teleportTimeout === 0) {
        this.position.x =
          blackholePair.blackhole1.x +
          blackholePair.size / 2 -
          this.width / 2;
        this.position.y =
          blackholePair.blackhole1.y +
          blackholePair.size / 2 -
          this.height / 2;
        this.setTeleportationTimeout();
      }
    }
  }

  checkMeoriteCollision() {
    for (const meteorite of this.game.meteorites) {
      const dx =
        this.position.x +
        this.width / 2 -
        (meteorite.position.x + meteorite.size / 2);
      const dy =
        this.position.y +
        this.height / 2 -
        (meteorite.position.y + meteorite.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.getC() / 2 + meteorite.size / 2) {
        this.velocity.x = -this.velocity.x;
        this.velocity.y = -this.velocity.y;
        this.reduceHealth();
      }
    }
  }
}
