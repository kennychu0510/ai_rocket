import { degreeToRadian } from './functions';
import { Game } from './game';
import { Rocket } from './rocket';

export class RocketGA {
  private Population_size = 20;
  public Tick_Step = 500;
  private Survival_Rate = 0.9;
  private Mutation_Rate = 0.1;
  private Mutation_Amount = 0.05;
  public timeBetweenMove = 10;
  private time = 0;
  private population: RocketAI[] = [];
  private game: Game;
  constructor(game: Game) {
    this.game = game;
  }

  seed() {
    this.population = [];
    this.addSeed(this.Population_size);
    this.time = 0;
  }

  addSeed(n: number) {
    for (let i = 0; i < n; i++) {
      this.population.push(new RocketAI(this.game, this));
    }
    console.log(this.population);
  }

  update() {
    for (const rocket of this.population) {
      if (this.time % this.timeBetweenMove === 0) {
        rocket.move(this.time / this.timeBetweenMove);
      }
      rocket.update();
    }
    this.time++;
  }

  draw() {
    for (const rocket of this.population) {
      rocket.draw();
    }
  }

  reset() {
    this.population = [];
  }
  // evaluate() {

  // }
}

class RocketAI extends Rocket {
  fitness: number;
  survive: boolean;
  moves: Move[];
  rocketGA: RocketGA;
  private color: string;
  constructor(game: Game, rocketGA: RocketGA) {
    super(game);
    this.rocketGA = rocketGA;
    this.fitness = 0;
    this.survive = true;
    this.moves = generateMoves(this.rocketGA.Tick_Step);
    this.color = randomColor();
  }
  move(index: number) {
    /* CONVERT TIMESTAMP TO INDEX IN MOVES */
    if (this.health <= 0) {
      return;
    }
    const currentMove = this.moves[index];
    switch (currentMove) {
    case Move.none:
      break;
    case Move.up:
      {
        const x_direction =
            this.acceleration * Math.sin(degreeToRadian(this.angle));
        const y_direction =
            -this.acceleration * Math.sin(degreeToRadian(90 - this.angle));
        this.velocity.x = x_direction;
        this.velocity.y = y_direction;
      }
      break;
    case Move.left:
      this.angle -= this.turn;
      break;
    case Move.right:
      this.angle += this.turn;
      break;
    }
  }

  reduceHealth() {
    super.reduceHealth();
    if (this.health <= 0) {
      this.survive = false;
    }
  }

  draw() {
    this.game.ctx.beginPath();
    this.game.ctx.arc(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.getC() / 3,
      0,
      2 * Math.PI,
    );
    this.game.ctx.fillStyle = this.color;
    this.game.ctx.fill();
    this.game.ctx.closePath();
    super.draw();
  }
}

export enum Move {
  // eslint-disable-next-line no-unused-vars
  none = 0,
  // eslint-disable-next-line no-unused-vars
  up = 1,
  // eslint-disable-next-line no-unused-vars
  left = 2,
  // eslint-disable-next-line no-unused-vars
  right = 3,
}

// type Move = number // 0 = none, 1 = up, 2 = left, 3 = right

function generateMoves(steps: number) {
  const listOfMoves: Move[] = [];
  for (let i = 0; i < steps; i++) {
    listOfMoves.push(getMove());
  }
  return listOfMoves;
}

function getMove() {
  return Math.floor(Math.random() * 4); // The maximum is inclusive and the minimum is inclusive
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
