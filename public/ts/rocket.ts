import { Boundary } from './boundary.js';
import { degreeToRadian } from './functions.js';
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
  private ctx: CanvasRenderingContext2D;
  private boundary: Boundary;
  private health: number;
  public teleportTimeout: number;
  constructor(
    position: Position,
    velocity: Position,
    canvasWidth: number,
    ctx: CanvasRenderingContext2D,
    boundary: Boundary,
  ) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = 0.002 * canvasWidth;
    this.width = 0.02 * canvasWidth;
    this.height = this.width * 2;
    this.turn = 45;
    this.image_static = spaceshipImg;
    this.image_flying = spaceshipFlyingImg;
    this.alive = true;
    this.angle = 90;
    this.collectedStars = 0;
    this.ctx = ctx;
    this.boundary = boundary;
    this.health = 3;
    this.teleportTimeout = 0;
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    this.ctx.rotate((this.angle * Math.PI) / 180);
    this.ctx.translate(
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
    this.ctx.drawImage(
      image,
      this.position.x + this.velocity.x * Math.sin(degreeToRadian(this.angle)),
      this.position.y + this.velocity.y,
      this.width,
      this.height,
    );
    // c.fillRect(this.position.x, this.position.y, this.size, this.size)
    // c.fill()
    this.ctx.restore();
    // c.rotate(10)
    if (this.teleportTimeout > 0) {
      this.teleportTimeout--;
    }
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
}
