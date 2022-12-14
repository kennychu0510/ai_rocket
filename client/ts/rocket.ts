import { blockSize } from './force.js';
import {
  degreeToRadian,
  directionToNeighborCells,
  drawBlock,
  validCol,
  validRow,
} from './functions.js';
import { Game } from './game.js';
import { RocketImg, UserRocketImg } from './rocketImg.js';
import { Star } from './star.js';
import { Position, RocketColor } from './type.js';
const { floor } = Math;

const spaceshipImg = new Image();
spaceshipImg.src = './media/rocket_1_static.png';

const spaceshipFlyingImg = new Image();
spaceshipFlyingImg.src = './media/rocket_1_flying.png';

const spaceshipDamagedImg = new Image();
spaceshipDamagedImg.src = './media/rocket_2_static.png';

const spaceshipDamagedFylingImg = new Image();
spaceshipDamagedFylingImg.src = './media/rocket_2_flying.png';

const spaceshipBrokenImg = new Image();
spaceshipBrokenImg.src = './media/rocket_3_static.png';

const spaceshipBrokenFlyingImg = new Image();
spaceshipBrokenFlyingImg.src = './media/rocket_3_flying.png';

const boomImg = new Image();
boomImg.src = './media/boom.png';
export class Rocket {
  public position = { x: 0, y: 0 };
  public velocity: Position;
  public width = 0;
  public height = 0;
  protected acceleration = 0;
  color: RocketColor = [
    Math.floor(Math.random() * 128 + 128),
    Math.floor(Math.random() * 128 + 128),
    Math.floor(Math.random() * 128 + 128),
  ];
  public image_static = this.isUserControlled ?
    new UserRocketImg() :
    new RocketImg(this.color);
  public image_flying = this.isUserControlled ?
    new UserRocketImg() :
    new RocketImg(this.color);
  protected angle = 0;
  protected turn: number;
  public collectedStars = 0;
  public health = 0;
  public teleportTimeout = 0;
  public flyingTimeout = 0;
  public stars: Star[];
  protected mapID: string;
  private initialPosition: Position;
  public finishTime = 0;
  public time = 0;
  constructor(public game: Game, public isUserControlled = true) {
    this.velocity = { x: 0, y: 0 };
    // this.acceleration === this.game.rocketGA.ticksBetweenMove / 10

    this.turn = 45;
    this.initialPosition = {
      x: this.game.canvasHeight / 4,
      y: this.game.canvasWidth / 10,
    };
    this.stars = [];
    this.mapID = '';
    this.reset();
  }

  drawRotated() {
    const ctx = this.game.ctx;

    ctx.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.translate(
      -(this.position.x + this.width / 2),
      -(this.position.y + this.height / 2),
    );
  }

  draw() {
    this.game.ctx.save();
    this.drawRotated();
    this.drawImage();
    // c.fillRect(this.position.x, this.position.y, this.size, this.size)
    // c.fill()
    // c.rotate(10)
    this.game.ctx.restore();
  }

  drawImage() {
    const image = this.flyingTimeout ? this.image_flying : this.image_static;
    this.game.ctx.drawImage(
      image.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );

    // const row = floor(this.position.x / blockSize);
    // const col = floor(this.position.y / blockSize);
    // const rightBoundary = this.game.canvasWidth / blockSize;
    // const bottomBoundary = this.game.canvasHeight / blockSize;

    // const neighborCells = directionToNeighborCells(this.angle).map((cell) => {
    //   cell[0] = validRow(row, cell[0], rightBoundary);
    //   cell[1] = validCol(col, cell[1], bottomBoundary);
    //   return cell;
    // });
    // for (let i = 0; i < neighborCells.length; i++) {
    //   drawBlock(neighborCells[i][0], neighborCells[i][1], this.game.ctx, i);
    // }
  }

  changeDirection(key: string) {
    if (this.game.gameEnd) return;
    if (key === 'w') {
      this.flyingTimeout = 10;
      const x_direction =
        this.acceleration * Math.sin(degreeToRadian(this.angle));
      const y_direction =
        -this.acceleration * Math.sin(degreeToRadian(90 - this.angle));
      // console.log({ x_direction, y_direction });
      this.velocity.x = x_direction;
      this.velocity.y = y_direction;
    }

    if (key === 's') {
      this.velocity.y = 0;
      this.velocity.x = 0;
    }
    if (key === 'a') this.angle -= this.turn;
    if (key === 'd') this.angle += this.turn;
    if (this.angle < 0) {
      this.angle = 360 + this.angle;
    }
    if (this.angle === 360) this.angle = 0;
    // console.log(this.stats().angle_degrees);
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

  get alive() {
    return this.health > 0;
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
  }

  changeAcceleration(acceleration: number) {
    this.acceleration = acceleration;
  }

  reset() {
    this.stop();
    this.health = 3;
    this.angle = 90;
    this.collectedStars = 0;
    this.teleportTimeout = 0;
    this.width = 0.02 * this.game.canvasWidth;
    this.height = this.width * 2;
    this.image_static.setSrc(spaceshipImg.src, this);
    this.image_flying.setSrc(spaceshipFlyingImg.src, this);
    this.position.x = this.initialPosition.x;
    this.position.y = this.initialPosition.y;
    if (this.game.stars) {
      this.stars = this.game.stars.map((star) => star);

      this.updateMapID();
    }

    this.flyingTimeout = 0;
    this.finishTime = 0;
    this.acceleration = 0.002 * this.game.canvasWidth;
  }

  setPosition(position: Position) {
    this.position = position;
    this.velocity = { x: 0, y: 0 };
  }

  getC() {
    return Math.sqrt(this.width ** 2 + this.height ** 2);
  }

  reduceHealth(time: number) {
    this.health--;
    if (this.health === 2) {
      this.image_static.setSrc(spaceshipDamagedImg.src, this);
      this.image_flying.setSrc(spaceshipDamagedFylingImg.src, this);
      this.changeAcceleration(this.acceleration * 0.75);
    } else if (this.health === 1) {
      this.image_static.setSrc(spaceshipBrokenImg.src, this);
      this.image_flying.setSrc(spaceshipBrokenFlyingImg.src, this);
      this.changeAcceleration(this.acceleration * 0.75);
    } else if (this.health >= 0) {
      this.height = this.height * 1;
      this.width = (this.height * 3) / 2;
      this.image_static.setSrc(boomImg.src, this);
      this.image_flying.setSrc(boomImg.src, this);
      this.finishTime = time;
      this.onDie();
    }
    const x = String(this.health);
    this.game.domElements.currentLife.textContent = x;
    if (x < '0') {
      return (this.game.domElements.currentLife.textContent = '0');
    }
  }

  setTeleportationTimeout() {
    this.teleportTimeout = 60;
    // console.log(new Date().getTime());
  }

  update(time: number) {
    if (this.flyingTimeout > 0) this.flyingTimeout--;
    if (
      this.health <= 0 ||
      (this.isCollectedAllStars() && this.game.gameOnGoing)
    ) {
      return 'skip';
    }
    if (this.teleportTimeout > 0) {
      this.teleportTimeout--;
    }
    this.updateRocketPosition();
    this.checkRocketAndBoundary();
    this.checkStarCollection(time);
    this.checkMeteoriteCollision(time);
    this.checkBlackholeTeleportation();
    if (
      this.game.gameOnGoing &&
      this.collectedStars === this.game.totalStars &&
      !this.game.startAI &&
      this.isUserControlled
    ) {
      this.game.stopGame();

      this.game.gameOnGoing = false;
      this.finishTime = time;
    }
    this.time++;
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
        this.onDie();
        return;
      }
    } else {
      if (this.position.y < gameBoundaries.top) {
        this.position.y = gameBoundaries.bot - this.height;
      }
      if (this.position.y + this.height > gameBoundaries.bot) {
        this.position.y = gameBoundaries.top;
      }
      if (this.position.x < gameBoundaries.left) {
        this.position.x = gameBoundaries.right - this.width;
      }
      if (this.position.x + this.width > gameBoundaries.right) {
        this.position.x = gameBoundaries.left;
      }
    }
  }

  checkStarCollection(time: number) {
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      const dx =
        this.position.x + this.width / 2 - (star.getX() + star.size / 2);
      const dy =
        this.position.y + this.height / 2 - (star.getY() + star.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.getC() / 4 + star.size / 2) {
        this.stars.splice(i, 1);
        this.updateMapID();
        this.collectedStars++;
        if (this.collectedStars === this.game.stars.length) {
          this.finishTime = time;
          this.stop();
          this.onFinish();
        }
        // currentScore.textContent = String(this.collectedStars);
      }
    }
  }

  private updateMapID() {
    this.mapID = this.stars.map((star) => star.id).join(';');
  }

  onFinish() {
    // For event listener
  }

  onDie() {
    // For event listener
  }

  checkBlackholeTeleportation() {
    const blackholes = this.game.blackholes;
    const teleportMap = this.game.teleportMap;
    for (let i = 0; i < blackholes.length; i++) {
      const blackholeIndex = this.game.teleportMap[i];
      const dx =
        this.position.x +
        this.width / 2 -
        (blackholes[i].getX() + blackholes[i].size / 2);
      const dy =
        this.position.y +
        this.height / 2 -
        (blackholes[i].getY() + blackholes[i].size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      const range = this.getC() / 2 + blackholes[i].size / 2;

      if (distance <= range / 2 && this.teleportTimeout === 0) {
        this.position.x =
          this.game.blackholes[blackholeIndex].position.x +
          blackholes[i].size / 2 -
          this.width / 2;
        this.position.y =
          this.game.blackholes[blackholeIndex].position.y +
          blackholes[i].size / 2 -
          this.height / 2;
        this.setTeleportationTimeout();
      }
    }
  }

  checkMeteoriteCollision(time: number) {
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
      if (distance < this.getC() / 4 + meteorite.size / 2) {
        this.velocity.x = -this.velocity.x;
        this.velocity.y = -this.velocity.y;
        this.reduceHealth(time);
      }
    }
  }

  isCollectedAllStars() {
    return this.stars.length === 0;
  }

  addStar(star: Star) {
    this.stars.push(star);
    // console.log(this.stars);
  }
}
