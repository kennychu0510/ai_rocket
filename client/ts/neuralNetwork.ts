const { random } = Math;

export class NeuralNetwork {
  inputNodes = 4;
  hiddenLayers = 0;
  outputNodes = 2;
  private output: number[];
  private input: number[];
  private weights: number[];
  constructor() {
    this.input = [0];
    this.weights = [0];
    this.output = [0, 0];
  }

  updateWeights(newWeights: number[]) {
    this.weights = newWeights;
  }

  compute(input: number[], weights: number[]) {
    this.input = input;
    for (let i = 0; i < this.outputNodes; i++) {
      for (let j = 0; j < this.inputNodes; j++) {
        this.output[i] += this.input[j] * this.weights[j + i * j];
      }
    }
    return this.output;
  }
}
const input = [0.1, 0.2, 0.3, 0.09];
const weights = [0.25, 0.79, 0.67, 0.12, 0.24, 0.56, 0.12, 0.99];
const nn = new NeuralNetwork();
console.log(nn);
const output = nn.compute(input, weights);

console.log(output);
