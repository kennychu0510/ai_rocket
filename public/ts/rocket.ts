import { Boundary } from './boundary.js';
import { degreeToRadian } from './functions.js';
import { Position } from './type.js';

const spaceshipImg = new Image();
spaceshipImg.src = './media/rocket_1.png';

const spaceshipFlyingImg = new Image();
spaceshipFlyingImg.src = './media/rocket_2.png';

export class Rocket {
  public position: Position;
  private velocity: Position;
  public width: number;
  public height: number;
  private acceleration: number;
  private image_static: HTMLImageElement;
  private image_flying: HTMLImageElement;
  public alive: boolean;
  private angle: number;
  private turn: number;
  public collectedStars: number;
  private ctx: CanvasRenderingContext2D;
  private boundary: Boundary;
  constructor(position: Position, velocity: Position, canvasWidth: number, ctx: CanvasRenderingContext2D, boundary: Boundary) {
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
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    this.ctx.rotate(this.angle * Math.PI / 180);
    this.ctx.translate(-(this.position.x + this.width / 2), -(this.position.y + this.height / 2));
    let image;
    if (this.velocity.x == 0 && this.velocity.y === 0) {
      image = this.image_static;
    } else {
      image = this.image_flying;
    }

    this.ctx.drawImage(image, this.position.x + this.velocity.x * Math.sin(degreeToRadian(this.angle)), this.position.y + this.velocity.y, this.width, this.height);
    // c.fillRect(this.position.x, this.position.y, this.size, this.size)
    // c.fill()
    this.ctx.restore();
    // c.rotate(10)
  }

  changeDirection(key: string) {
    if (key === 'w') {
      const x_direction = this.acceleration * Math.sin(degreeToRadian(this.angle));
      const y_direction = -this.acceleration * Math.sin(degreeToRadian(90 - this.angle));
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

  // update() {
  //   this.draw();
  //   if (this.boundary.getBoundaryMode()) {
  //     if (this.position.y < trackTopBound || this.position.y + this.size > trackBotBound || this.position.x < trackLeftBound || (this.position.x + this.size) > trackRightBound) {
  //       this.alive = false;
  //       game.gameStarted = false;
  //       game.statusMessage.updateMsg('you have crashed!');
  //       return;
  //     }
  //   } else {
  //     if (this.position.y < trackTopBound) {
  //       this.position.y = trackBotBound - this.size;
  //     }
  //     if (this.position.y + this.size > trackBotBound) {
  //       this.position.y = trackTopBound;
  //     }
  //     if (this.position.x < trackLeftBound) {
  //       this.position.x = trackRightBound - this.size;
  //     }
  //     if (this.position.x + this.size > trackRightBound) {
  //       this.position.x = trackLeftBound;
  //     }
  //   }

  //   /* DETECT STARS COLLECTED */
  //   for (let i = 0; i < game.stars.length; i++) {
  //     const star = game.stars[i];
  //     const dx = (this.position.x + this.size / 2) - (star.getX() + 10);
  //     const dy = (this.position.y + this.size / 2) - (star.getY() + 10);
  //     const distance = Math.sqrt(dx * dx + dy * dy);

  //     if (distance < this.size / 2 + 10) {
  //       game.stars.splice(i, 1);
  //       i--;
  //       this.collectedStars++;
  //       currentScore.textContent = String(this.collectedStars);
  //     }
  //   }


  //   /* UPDATE ROCKET LOCATION IN NEXT FRAME TO MIMIC MOVEMENT */
  //   this.position.y += this.velocity.y;
  //   this.position.x += this.velocity.x;
  // }

  updateRocketPosition() {
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;
  }

  stats() {
    return ({
      x: this.position.x,
      y: this.position.y,
      x_speed: this.velocity.x,
      y_speed: this.velocity.y,
      angle_degrees: this.angle,
      acceleration: this.acceleration,
    });
  }

  stop() {
    this.velocity.y = 0;
    this.velocity.x = 0;
    this.alive = false;
  }
  changeAcceleration(acceleration: number) {
    this.acceleration = acceleration;
  }
}
