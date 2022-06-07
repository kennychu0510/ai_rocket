import { Boundary } from './boundary';
import { Rocket } from './rocket';
import { Position } from './type';

export class RocketGA {
  static Population_size = 100;
  static Tick_Step = 100;
  static Survival_Rate = 0.9;
  static Mutation_Rate = 0.1;
  static Mutation_Amount = 0.05;

  population: Rocket[] = [];

  seed() {
    this.population = [];
    this.addSeed(RocketGA.Population_size);
  }

  addSeed(n: number) {
    for (let i = 0; i < n; i++) {
      this.population.push();
    }
  }
}

class RocketAI extends Rocket {
  gene: RocketGene;
  fitness: number;
  survive: boolean;
  constructor(
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
    boundary: Boundary,
  ) {
    super(canvasWidth, canvasHeight, ctx, boundary);
    this.fitness = 0;
    this.survive = true;
    this.gene = new RocketGene();
  }
}

class RocketGene {
  moves: number[];
  constructor() {
    this.moves = [];
  }
}
